"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import QueryProvider from "./components/extras/QueryProvider";
import { getToken } from "./services/authService";

const inter = Inter({ subsets: ["latin"] });

const protectedRoutes = new Set([
  "/dashboard",
  "/personnel",
  "/bus-profiles",
  "/devices",
  "/bus-maintenance",
  "/dispatch-monitoring",
  "/fuel-monitoring",
  "/feedback",
]);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authToken = getToken();
    const isAuth = !!authToken;
    setIsAuthenticated(isAuth);

    if (!isAuth && protectedRoutes.has(pathname)) {
      router.replace("/login");
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <head>
        <title>TransitTrack</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <Suspense>
            {/* 🚀 Now, content is conditionally rendered but the structure stays intact! */}
            {isAuthenticated === null ? (
              <div></div> // Placeholder instead of removing the HTML structure
            ) : isAuthenticated || !protectedRoutes.has(pathname) ? (
              children
            ) : null}
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
