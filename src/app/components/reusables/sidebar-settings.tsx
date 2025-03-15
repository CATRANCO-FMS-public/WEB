"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaArrowLeft, FaPen, FaBell } from "react-icons/fa";

export default function Sidebar2() {
    const pathname = usePathname(); // Get the current path

    const menuItems = [
        { href: "/editprofile", icon: <FaPen size={25} />, label: "Edit Profile" },
        { href: "/notification", icon: <FaBell size={25} />, label: "Notifications" },
    ];

    const isActive = (href) => pathname.startsWith(href);

    return (
        <aside
            className="h-screen bg-gray-100 md:w-64 w-16 transition-width duration-300"
            aria-label="Sidebar"
        >
            {/* Header Section */}
            <div className="py-4 px-2 md:px-6 relative">
                <Link href="/dashboard">
                    <FaArrowLeft
                        size={20}
                        className="absolute top-4 left-4 text-gray-500 hover:text-violet-700 transition-colors duration-200"
                    />
                </Link>
                <Link href="/dashboard">
                </Link>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col space-y-2 md:space-y-4 p-2 md:p-4">
                <ul className="space-y-3">
                    {menuItems.map(({ href, icon, label }) => (
                        <li key={href} className="relative">
                            <Link
                                href={href}
                                className={`flex items-center space-x-2 md:space-x-4 p-2 rounded-md transition-colors duration-200
                                    ${isActive(href) ? "text-violet-700 bg-gray-200" : "hover:text-violet-700"}`}
                            >
                                <span
                                    className={`text-2xl ${
                                        isActive(href)
                                            ? "text-violet-700"
                                            : "text-gray-500 hover:text-violet-700"
                                    }`}
                                >
                                    {icon}
                                </span>
                                <span
                                    className={`md:inline hidden text-sm md:text-base ${
                                        isActive(href)
                                            ? "text-violet-700"
                                            : "text-gray-500 hover:text-violet-700"
                                    }`}
                                >
                                    {label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
