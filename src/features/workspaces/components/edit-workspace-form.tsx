"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { updateWorkspaceSchema } from "../schemas";
import { useUpdateWorkspace } from "../api/use-update-worksapce";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface EditWorkspaceFormProps {
    onCancel?: () => void;
    initialValues: Workspace;
}

export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProps) => { 
    const { mutate, isPending } = useUpdateWorkspace();
    const {
        mutate: deleteWorkspace,
        isPending: isDeletingWorkspace
    } = useDeleteWorkspace();
    
    const {
        mutate: resetInviteCode,
        isPending: isResettingInviteCode
    } = useResetInviteCode();
    const router = useRouter();

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workspace",
        "This action cannot be undone",
        "destructive"
    )

    const [ResetDialog, confirmReset] = useConfirm(
        "Reset invite link",
        "This will invalidate the current invite link",
        "destructive"
    )

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        },
    })

    const handleDelete = async() => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteWorkspace({
            param: {workspaceId: initialValues.$id}
        }, {
            onSuccess: () => {
                window.location.href = "/"
            }
        })
    }

    const handleResetInviteCode = async() => {
        const ok = await confirmReset();
        if (!ok) return;

        resetInviteCode({
            param: {workspaceId: initialValues.$id}
        }, {
            onSuccess: () => {
                router.refresh();
            }
        })
    }

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        };
        
        mutate({
            form: finalValues,
            param: {workspaceId: initialValues.$id}
         }, {
            onSuccess: ({data}) => {
                form.reset();
                router.push(`/workspaces/${data.$id}`);    
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
        .then(() => toast.success("Invite link copied to clipboard"))
    }

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <ResetDialog />    

            <Card className="w-full h-full border-none shadow-none">
                    <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                        <Button size={"sm"} variant={"secondary"} onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
                            <ArrowLeftIcon className="mr-2 size-4"/>
                            Back
                        </Button>
                        <CardTitle className="text-xl font-bold">
                            {initialValues.name}
                        </CardTitle>
                    </CardHeader>
                    <div className="px-7">
                        <DottedSeparator />
                    </div>
                    <CardContent className="p-7">
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Workspace Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter workspace name"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render = {({ field }) => (
                                            <div className="flex flex-col gap-y-2">
                                                <div className="flex items-center gap-x-5">
                                                    { field.value ? (
                                                        <div className="size-[72px] relative rounded-md overflow-hidden">
                                                            <Image
                                                                src={field.value instanceof File
                                                                    ? URL.createObjectURL(field.value)
                                                                    : field.value}
                                                                alt="logo"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Avatar className="size-[72px]">
                                                                <AvatarFallback>
                                                                    <ImageIcon className="size-[36px] text-neutral-400"/>
                                                            </AvatarFallback>       
                                                        </Avatar>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            Workspace Icon
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            JPG, PNG, SVG or JPEG, max 1 mb
                                                        </p>
                                                        <input
                                                            className="hidden"
                                                            type="file"
                                                            ref={inputRef}
                                                            disabled={isPending}
                                                            accept=".jpg, .jpeg, .png, .svg"
                                                            onChange={handleImageChange}
                                                        />
                                                    {
                                                            field.value ? (
                                                                <Button
                                                                    className="w-fit mt-2"
                                                                    type="button"
                                                                    size="xs"
                                                                    disabled={isPending}
                                                                    variant={"destructive"}
                                                                    onClick={() => {
                                                                        field.onChange(null);
                                                                        if (inputRef.current) {
                                                                            inputRef.current.value = "";
                                                                        }
                                                                    }}
                                                                >
                                                                    Remove Image
                                                                </Button>
                                                            ): (
                                                            <Button
                                                                className="w-fit mt-2"
                                                                type="button"
                                                                size="xs"
                                                                onClick={() => inputRef.current?.click()}
                                                                disabled={isPending}
                                                                variant={"teritary"}
                                                            >
                                                                Upload Image
                                                            </Button>    
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    </div>
                                <DottedSeparator className="py-7" />
                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        size="lg"
                                        variant="secondary"
                                        onClick={onCancel}
                                        disabled={isPending}
                                        className={cn(!onCancel && "invisible")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isPending}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Invite Members</h3>
                        <p className="text-sm text-muted-foreground">
                             Use the invite link to add members to your workspace.
                        </p>
                        <DottedSeparator className="my-7" />
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled value={fullInviteLink} />
                                <Button
                                    className="size-12"
                                    onClick={handleCopyInviteLink}
                                    variant={"secondary"}
                                >
                                    <CopyIcon className="size-5"/>
                                </Button>       
                            </div> 
                        </div>
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant={"destructive"}
                            disabled={isPending || isResettingInviteCode}
                            onClick={handleResetInviteCode}
                        >
                            Reste invite link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Danger zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a workspace is irreversible and will remove all data associated with it.
                        </p>
                        <DottedSeparator className="my-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant={"destructive"}
                            disabled={isPending || isDeletingWorkspace}
                            onClick={handleDelete}
                        >
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
  )
}