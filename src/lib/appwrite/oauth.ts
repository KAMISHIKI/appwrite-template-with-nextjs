"use server";

import { cookies, headers } from "next/headers";
import { createAdminClient, createSessionClient } from "./server";
import { redirect } from "next/navigation";
import { Account, OAuthProvider } from "node-appwrite";
import { env } from "process";

const sessionName = env.SESSION_NAME!;
const redirectPathAfterSignIn = "/";
const redirectPathAfterSignOut = "/";
const googleCallbackPath = "/login/social/google/callback";
const googleFailurePath = "/login";

async function setSessionCookie(sessionSecret: string) {
    (await cookies()).set(sessionName, sessionSecret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true
    });
}

async function getOrigin() {
    return (await headers()).get("origin");
}

function generateCSRFToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

export async function signInWithEmail(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    await setSessionCookie(session.secret);
    redirect(redirectPathAfterSignIn);
}

export async function signInWithGoogle() {
    const { account } = await createAdminClient();
    const origin = await getOrigin();

    const crsfToken = generateCSRFToken();
    (await cookies()).set('csrfToken', crsfToken, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    const redirectUrl = await account.createOAuth2Token(
        OAuthProvider.Google,
        `${origin}${googleCallbackPath}?csrfToken=${crsfToken}`,
        `${origin}${googleFailurePath}`
    );

    return redirect(redirectUrl);
}

export async function signOut() {
    const { account } = await createSessionClient();

    (await cookies()).delete(sessionName);
    await account.deleteSession("current");

    redirect(redirectPathAfterSignOut);
}