// app/verify-email/page.tsx
import { db } from "@/db/drizzle";
import { eq, and, gt } from "drizzle-orm";
import { users, verificationTokens } from "@/db/schema";
import { redirect } from "next/navigation";
import { Container } from "@/components/custom-ui/container";
import { Heading } from "@/components/custom-ui/heading";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  // Await searchParams before accessing its properties
  const { token } = await searchParams;

  if (!token) {
    return (
      <Container
        width="marginxy"
        className="min-h-[60vh] flex items-center justify-center"
      >
        <Heading size="sm" className="text-center">
          Invalid verification link
        </Heading>
      </Container>
    );
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
      return (
        <Container
          width="marginxy"
          className="min-h-[60vh] flex items-center justify-center"
        >
          <Heading size="sm" className="text-center">
            Invalid or expired verification link
          </Heading>
        </Container>
      );
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