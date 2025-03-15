"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/extras/loadingAnimations";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="text-center">
        {/* Logo */}
        <div className="-mt-20">
          <img
            src="/logo.png" // Replace with your logo file path
            alt="Logo"
            className="w-120 h-80 mx-auto"
          />
        </div>

        {/* Loading Animation */}
        <div className="loadingcontainer -mt-20">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
}
