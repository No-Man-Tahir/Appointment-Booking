import type {
  Metadata,
} from "next";

import "./globals.css";

import {
  AuthProvider,
} from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "AI Appointment Booking",
  description:
    "AI-assisted appointment booking prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}