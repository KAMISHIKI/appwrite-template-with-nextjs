"use server";

import { cookies } from "next/headers";
import { Account, Client, Databases } from "node-appwrite";
import { env } from "process";

const serverClient = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT!)
    .setProject(env.APPWRITE_PROJECT_ID!)
    .setKey(env.APPWRITE_SECRET_KEY!);

const sessionClient = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT!)
    .setProject(env.APPWRITE_PROJECT_ID!);


// make client session
export async function createSessionClient() {
    const session = (await cookies()).get(env.SESSION_NAME!);
    if (!session || !session.value) {
        throw new Error("No client sessions");
    }

    sessionClient.setSession(session.value);

    return {
        get account() {
            return new Account(sessionClient);
        }
    };
}

// make admin client
export async function createAdminClient() {
    return {
        get account() {
            return new Account(serverClient);
        }
    };
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        return await account.get();
    } catch (error) {
        return null;
    }
}

export async function createDatabaseClient() {
    const db = new Databases(serverClient);

    return db;
}

export async function createServerClient() {
    return serverClient;
}