import type { Metadata } from "next";
import "./globals.css";
import "../components/profile-rebuild.css";
import "../components/upload-tabs.css";
import "../components/brand-icons.css";
import "../components/profile-fixes.css";
import "../components/profile-upgrades.css";
import "../components/profile-v5.css";

const title=process.env.NEXT_PUBLIC_SITE_TITLE||process.env.NEXT_PUBLIC_NAME||"Profile";
const description=process.env.NEXT_PUBLIC_SITE_DESCRIPTION||process.env.NEXT_PUBLIC_BIO||"Personal profile website.";
export const metadata:Metadata={title,description,icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
