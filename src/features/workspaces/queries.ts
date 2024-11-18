import { Query } from "node-appwrite"
import { DATABASES_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";

export const getWorksapces = async () => {
    try {
        const { databases, account } = await createSessionClient();
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
        const { databases, account } = await createSessionClient();
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