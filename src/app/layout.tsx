import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { UserSyncProvider } from "@/components/user-sync-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SkillProbe.ai",
  description: "Your AI Interview Coach",
  icons: [{ rel: "icon", url: "/sp_favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (

    <ClerkProvider
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
    >
      <TRPCReactProvider>
        <html lang="en" className={`${geist.variable}`}>
          <body>
            <UserSyncProvider>
              <header className="flex justify-end items-center p-4 gap-4 h-16">
                <SignedOut>
                  <SignInButton
                    mode="redirect"
                    forceRedirectUrl="/home"
                  >
                    <button className="px-4 sm:px-6 py-2 mt-8 sm:py-3 bg-white text-gray-800 font-medium text-sm sm:text-base rounded-2xl hover:bg-gray-50 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ease-out">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="redirect"
                    forceRedirectUrl="/home"
                    signInForceRedirectUrl="/home"
                  >
                    <button className="px-4 py-3 mt-8 bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105 text-white">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </header>
              {children}
              <Toaster />
            </UserSyncProvider>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
