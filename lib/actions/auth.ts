'use server';

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";


export const SignInWithCredentials = async (params: Pick<AuthCredentials, 'email' | 'password'>) => {
    const { email, password } = params;

    try {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false
        });

        if (result?.error) {
            return { success: false, error: result.error };
        }

        return { success: true };

    } catch (error) {
        console.error(error, "SignIn Error");
        return { success: false, error: "SignIn Error" };

    }
};

export const signUp = async (params: AuthCredentials) => {
    const { fullName, email, password, universityId, universityCard } = params;

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser.length) {
        return { success: false, error: "User already exists" };
    }

    const hashedPassword = await hash(password, 10);

    try {
        await db.insert(users).values({
            fullName,
            email,
            password: hashedPassword,
            universityId,
            universityCard,
        });

        await SignInWithCredentials({ email, password });

        return { success: true };

    } catch (error) {
        console.error(error, "SignUp Error");
        return { success: false, error: "SignUp Error" };
    }

};