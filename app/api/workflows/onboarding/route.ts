import { serve } from "@upstash/workflow/nextjs";
import emailjs from "@emailjs/browser";
import config from "@/lib/config";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

type UserState = "non-active" | "active";
type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const Three_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const Thirty_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (
    timeDifference > Three_DAYS_IN_MS &&
    timeDifference <= Thirty_DAYS_IN_MS
  ) {
    return "non-active";
  }
  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      subject: "Welcome to the platform",
      message: `Welcome ${fullName}!`,
    });
  });

  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: "Are you still there",
          message: `Hey! ${fullName}, We miss you!`,
        });
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail({
          email,
          subject: "Thanks for staying active!",
          message: "Here's your monthly newsletter!",
        });
      });
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});

async function sendEmail({
  email,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) {
  const serviceID = ensureEnvVariable(
    config.env.emailJs.serviceId,
    "EMAILJS_SERVICE_ID",
  );
  const templateID = ensureEnvVariable(
    config.env.emailJs.templateId,
    "EMAILJS_TEMPLATE_ID",
  );
  const publicKey = ensureEnvVariable(
    config.env.emailJs.publicKey,
    "EMAILJS_PUBLIC_KEY",
  );

  const templateParams = {
    to_email: email,
    message,
  };

  try {
    const response = await emailjs.send(
      serviceID,
      templateID,
      templateParams,
      publicKey,
    );
    console.log(`Email sent successfully to ${email}:`, response);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}

// Helper function to validate environment variables
function ensureEnvVariable(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined.`);
  }
  return value;
}
