"use client";
// app/components/buttons/auth-button.tsx
// import { signIn, useSession } from "next-auth/react"; add this if you want to use signIn
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Heading } from "../custom-ui/heading";
import { useEffect, useState } from "react";

export default function AuthButton() {
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Button className="w-full mt-3 md:mt-0">Sign In</Button>;
  }

  return (
    <>
      {session ? (
        <Link
          href={
            session?.user?.role === "ADMIN"
              ? "/dashboard/admin"
              : "/dashboard/user"
          }
          className="flex items-center gap-2 w-full mt-3 md:mt-0"
        >
          <Avatar>
            <AvatarImage
              src="/images/user.jpg"
              alt="User Avatar"
              title={`Dashboard for ${session.user.name}`}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Heading
            size="xs"
            className="md:hidden"
            title={`Dashboard for ${session.user.name}`}
          >
            {session.user.name}
          </Heading>
        </Link>
      ) : null
      // <Button className="w-full mt-3 md:mt-0" onClick={() => signIn()}>
      //   Sign In
      // </Button>
      }
    </>
  );
}
