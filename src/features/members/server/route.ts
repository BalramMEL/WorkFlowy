import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../utils";
import { DATABASES_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { MemberRole } from "../types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async(c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const { workspaceId } = c.req.valid("query");
            const user = c.get("user");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if(!member) {
                return c.json({error: "Unauthorized"},401)
            }

            const members = await databases.listDocuments(
                DATABASES_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("userId", user.$id)
                ]
            );

            const populateMembers = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    };
                })
            )
            return c.json({
                data: {
                    ...members,
                    documents: populateMembers
                }
            })
        }    
)
    .delete(
        "/:memberId",
        sessionMiddleware,
        async (c) => {
            const {memberId} = c.req.param();
            const databases = c.get("databases");
            const user = c.get("user");

          const memberToDelete = await databases.getDocument(
                DATABASES_ID,
                MEMBERS_ID,
                memberId
            )

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASES_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", memberToDelete.workspaceId)
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id
            });

            if(!member) {
                return c.json({error: "Unauthorized"},401)
            }

            if (member.role !== MemberRole.ADMIN && member.$id !== memberToDelete.$id) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if(allMembersInWorkspace.total === 1) {
                return c.json({error: "Cannot delete last member"},400)
            }

            await databases.deleteDocument(
                DATABASES_ID,
                MEMBERS_ID,
                memberId,
            )

            return c.json({ data: { $id: memberToDelete.$id } })    
        }
)
    .patch(
        "/:memberId",
        sessionMiddleware,
        zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
        async (c) => {
            const { memberId } = c.req.param();
            const {role} = c.req.valid("json");
            const databases = c.get("databases");
            const user = c.get("user");

          const memberToUpdate = await databases.getDocument(
                DATABASES_ID,
                MEMBERS_ID,
                memberId
            )

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASES_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", memberToUpdate.workspaceId)
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id
            });

            if(!member) {
                return c.json({error: "Unauthorized"},401)
            }

            if (member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            if(allMembersInWorkspace.total === 1) {
                return c.json({error: "Cannot downgrade only member"},400)
            }

            await databases.updateDocument(
                DATABASES_ID,
                MEMBERS_ID,
                memberId,
                {
                    role,
                }
            )

            return c.json({ data: { $id: memberToUpdate.$id } })    
        }
    )

export default app;