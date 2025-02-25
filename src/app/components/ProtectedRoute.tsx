"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";

const protectedRoutes = [
  "/dashboard",
  "/personnel",
  "/bus-profiles",
  "/devices",
  "/bus-maintenance",
  "/dispatch-monitoring",
  "/fuel-monitoring",
  "/feedback",
];

// Function to check authentication status
const fetchAuthStatus = async () => {
  if (typeof window === "undefined") return false; // Prevent SSR issues
  return !!localStorage.getItem("authToken");
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Fetch authentication status with React Query
  const { data: isAuthenticated, isLoading } = useQuery({
    queryKey: ["authStatus"],
    queryFn: fetchAuthStatus,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // **Ensure hooks run in order** and handle redirects properly
  if (!isLoading) {
    if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      redirect("/login");
    }
    if (isAuthenticated && pathname === "/login") {
      redirect("/dashboard");
    }
  }

  return <>{children}</>;
}
