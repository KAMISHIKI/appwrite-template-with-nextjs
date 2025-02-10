"use server";

import { cookies } from "next/headers";
import { Account, Client, Databases } from "node-appwrite";
import { env } from "process";

// クライアントの初期化
function initializeClient(endpoint: string, projectId: string, apiKey?: string) {
    if (!endpoint || !projectId) {
        throw new Error("Invalid Appwrite configuration");
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId);

    if (apiKey) {
        client.setKey(apiKey);
    }

    return client;
}

// サーバー用クライアント
const serverClient = initializeClient(
    env.APPWRITE_ENDPOINT!,
    env.APPWRITE_PROJECT_ID!,
    env.APPWRITE_SECRET_KEY
);

// セッション用クライアント
const sessionClient = initializeClient(
    env.APPWRITE_ENDPOINT!,
    env.APPWRITE_PROJECT_ID!
);

// セッションクライアントの作成
export async function createSessionClient() {
    const session = (await cookies()).get(env.SESSION_NAME!);
    if (!session || !session.value) {
        throw new Error("No client sessions");
    }

    sessionClient.setSession(session.value);

    return {
        account: new Account(sessionClient)
    };
}

// 管理者クライアントの作成
export async function createAdminClient() {
    return {
        account: new Account(serverClient)
    };
}

// ログイン中のユーザーを取得
export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        return await account.get();
    } catch (error) {
        console.error("Error fetching logged in user:", error);
        return null;
    }
}

// データベースクライアントの作成
export async function createDatabaseClient() {
    return new Databases(serverClient);
}

// サーバークライアントの作成
export async function createServerClient() {
    return serverClient;
}