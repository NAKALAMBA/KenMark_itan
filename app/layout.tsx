import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatbotProvider } from "@/components/ChatbotProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kenmark ITan Solutions - AI Chatbot",
  description: "AI-powered virtual assistant for Kenmark ITan Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ChatbotProvider>
          {children}
        </ChatbotProvider>
      </body>
    </html>
  );
}

