import { auth } from "@/auth";
import { ReactNode } from "react";
import Header from "@/components/Header";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session) redirect("/sign-in");

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-pattern bg-cover bg-top bg-dark-100 px-5 xs:px-10 md:px-16">
      <div className="mx-auto max-w-7xl">
        <Header session={session} />

        <div className="mt-20 pb-20">{children}</div>
      </div>
    </main>
  );
};

export default layout;
