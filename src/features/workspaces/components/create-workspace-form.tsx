"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkspaceSchema } from "../schemas";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import React, { useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CreateWorkspaceFormProps {
    onCancel?: () => void;
}

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => { 
    const { mutate, isPending } = useCreateWorkspace();
    const router = useRouter();

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof createWorkspaceSchema>>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            name: "",
        },
    })

    const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        };
        
        mutate({ form: finalValues }, {
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

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create a new workspace
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
                                                                    inputRef.current.value
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
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
      </Card>
  )
}