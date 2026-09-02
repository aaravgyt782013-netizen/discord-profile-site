import type { Metadata } from "next";
import "./globals.css";
import "../components/profile-rebuild.css";

const title = process.env.NEXT_PUBLIC_SITE_TITLE || process.env.NEXT_PUBLIC_NAME || "Profile";
const description = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || process.env.NEXT_PUBLIC_BIO || "Personal profile website.";

export const metadata: Metadata = { title, description, icons: { icon: "/favicon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
