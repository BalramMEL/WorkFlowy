import { cookies } from "next/headers"
import { Account, Client, Databases, Query } from "node-appwrite"
import { AUTH_COOKIE } from "../auth/constants";
import { DATABASES_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { Workspace } from "./types";

export const getWorksapces = async () => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        
        const session = cookies().get(AUTH_COOKIE);
        
        if (!session) return {documents: [], total: 0};

        client.setSession(session.value);
        const databases = new Databases(client);
        const account = new Account(client);
        const user = await account.get();

        const members = await databases.listDocuments(
            DATABASES_ID,
            MEMBERS_ID,
            [
               Query.equal("userId", user.$id)
            ]
        );

        if (members.total === 0) { 
            return {documents: [], total: 0} 
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId);

        const workspaces = await databases.listDocuments(
            DATABASES_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)
            ]
        );

        return workspaces
    } catch {
        return {documents: [], total: 0}
    }
}

interface GetWorkSpaceProps{
    workspaceId: string;
}


export const getWorksapce = async ({workspaceId}: GetWorkSpaceProps) => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        
        const session = cookies().get(AUTH_COOKIE);
        
        if (!session) return null;

        client.setSession(session.value);
        const databases = new Databases(client);
        const account = new Account(client);
        const user = await account.get();

        const member = await getMember({
            databases,
            userId: user.$id,
            workspaceId
        })

        const workspaces = await databases.getDocument<Workspace>(
            DATABASES_ID,
            WORKSPACES_ID,
            workspaceId,
        );

        if (!member) {
            return null;
        }

        return workspaces;
    } catch {
        return null
    }
}