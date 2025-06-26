import { db } from "@/db/drizzle";
import { eq, and, gt } from "drizzle-orm";
import { users, verificationTokens } from "@/db/schema";
import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = searchParams;

  if (!token) {
    return <div>Invalid verification link</div>;
  }

  try {
    // Find the verification token
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      ),
    });

    if (!verificationToken) {
      return <div>Invalid or expired verification link</div>;
    }

    // Update user as verified
    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.email, verificationToken.email));

    // Delete the used token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));

    redirect("/login?verified=true");
  } catch (error) {
    console.error("Email verification error:", error);
    return <div>An error occurred during verification</div>;
  }
}