"use client";

import { Button } from "@/components/ui/button";
import { useCurrent } from "@/features/auth/api/use-current";
import { useLogout } from "@/features/auth/api/use-logout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data, isLoading } = useCurrent();

  const { mutate } = useLogout();

  useEffect(() => {
    if(!isLoading && !data) {
      router.push("/sign-in")
    }
  }, [data])
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-red-600">
        Only authorised Balram
      </p>
      <Button onClick={() => mutate()}>
        logout
      </Button>
    </div>
  );
}
