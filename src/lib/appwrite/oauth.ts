"use server";

import { cookies, headers } from "next/headers";
import { createAdminClient, createSessionClient } from "./server";
import { redirect } from "next/navigation";
import { Account, OAuthProvider } from "node-appwrite";
import { env } from "process";

const session_name = env.SESSION_NAME!;

export async function signInWithEmail(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set(session_name, session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true
    });

    redirect("/"); // redirect path after signining
}

export async function signInWithGoogle() {
    const { account } = await createAdminClient();

    const origin = (await headers()).get("origin");

    const redirectUrl = await account.createOAuth2Token(
        OAuthProvider.Google,
        `${origin}/login/social/google/callback`, // callback url with success
        `${origin}/login`,
    );

    return redirect(redirectUrl);
}

export async function signOut() {
    const { account } = await createSessionClient();

    (await cookies()).delete(session_name);
    await account.deleteSession("current");

    redirect("/"); // redirect path after signouting
}