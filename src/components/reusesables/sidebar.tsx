import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    FaUser,
    FaBus,
    FaChartBar,
    FaTruck,
    FaGasPump,
    FaCommentDots,
    FaWrench,
    FaMicrochip,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

export default function Sidebar() {
    const pathname = usePathname();
    
    // Initialize state directly from localStorage to avoid initial animation
    const [minimized, setMinimized] = useState(() => {
        // Check if we're in browser environment
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarMinimized');
            return savedState === 'true';
        }
        return false;
    });
    
    // Add a mounting state to control when transitions should apply
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        // Mark as mounted after first render
        setMounted(true);
    }, []);

    const toggleSidebar = () => {
        const newState = !minimized;
        setMinimized(newState);
        localStorage.setItem('sidebarMinimized', newState.toString());
    };

    const menuItems = [
        { href: "/dashboard", icon: <FaChartBar />, label: "Dashboard" },
        { href: "/personnel", icon: <FaUser />, label: "Bus Personnel Management" },
        { href: "/bus-profiles", icon: <FaBus />, label: "Bus Profiles" },
        { href: "/devices", icon: <FaMicrochip />, label: "Device Management" },
        { href: "/bus-maintenance", icon: <FaWrench />, label: "Bus Maintenance Management" },
        { href: "/dispatch-monitoring", icon: <FaTruck />, label: "Dispatch Monitoring" },
        { href: "/fuel-monitoring", icon: <FaGasPump />, label: "Fuel Monitoring" },
        { href: "/feedback", icon: <FaCommentDots />, label: "Feedback" },
    ];

    const isActive = (href) => pathname.startsWith(href);

    return (
        <aside 
            className={`h-screen bg-gray-100 relative ${
                minimized ? "w-16" : "md:w-64 w-16"
            } ${mounted ? "transition-all duration-300 ease-in-out" : ""}`} 
            aria-label="Sidebar"
        >
            <div className="py-4 px-2 md:px-6 flex items-center">
                <Link href="/dashboard">
                    <img
                        src="/logo1.png"
                        alt="Image Logo"
                        className={`object-contain h-16 cursor-pointer ${
                            minimized ? "hidden" : "hidden sm:block"
                        }`}
                    />
                </Link>
            </div>

            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 bg-violet-700 text-white p-1 rounded-full shadow-md hover:bg-violet-800 transition-colors z-10 hidden md:block"
            >
                {minimized ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
            </button>

            <nav className="flex flex-col space-y-2 md:space-y-4 p-2 md:p-4">
                <ul className="space-y-3">
                    {menuItems.map(({ href, icon, label }) => (
                        <li key={href} className="relative group">
                            <Link
                                href={href}
                                className={`flex items-center rounded-md transition-colors duration-200
                                    ${minimized ? "justify-center p-2" : "space-x-2 md:space-x-4 p-2"}
                                    ${isActive(href) ? "text-violet-700 bg-gray-200" : "hover:text-violet-700"}`}
                            >
                                <span
                                    className={`text-2xl ${
                                        isActive(href) ? "text-violet-700" : "text-gray-500 group-hover:text-violet-700"
                                    }`}
                                >
                                    {icon}
                                </span>
                                <span
                                    className={`text-sm md:text-base ${
                                        isActive(href) ? "text-violet-700" : "text-gray-500 group-hover:text-violet-700"
                                    } ${minimized ? "hidden" : "hidden md:inline"}`}
                                >
                                    {label}
                                </span>
                            </Link>
                            {minimized && (
                                <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 whitespace-nowrap">
                                    {label}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
