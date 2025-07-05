import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom-ui/app-sidebar";
import { Container } from "@/components/custom-ui/container";
import { SidebarTrigger } from "@/components/custom-ui/sidebar-trigger";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Container width="marginy" animate={false} className="w-[98vw] md:w-[75vw] mb-10">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarTrigger className="block md:hidden" />
          <main>{children}</main>
        </SidebarProvider>
      </Container>
    </>
  );
}
