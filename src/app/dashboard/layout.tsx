"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Wallet,
    MessageSquare,
    LogOut,
    Bot,
    Settings,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-bg-main flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-secondary animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Kas Management", href: "/dashboard/kas", icon: Wallet },
        { name: "Bot Commands", href: "/dashboard/commands", icon: MessageSquare },
    ];

    if (session?.user?.role === "ADMIN") {
        menuItems.push({ name: "User & Roles", href: "/dashboard/users", icon: Users });
    }

    return (
        <div className="min-h-screen bg-bg-main flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 glass border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full lg:w-20"
                )}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className={cn("flex items-center gap-3", !isSidebarOpen && "lg:hidden")}>
                            <div className="p-2 bg-brand-primary/10 rounded-xl">
                                <Bot className="w-6 h-6 text-brand-primary" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">NoteBot</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                        >
                            {isSidebarOpen ? <X className="lg:hidden" /> : <Menu />}
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-brand-primary/10 text-brand-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-brand-primary")} />
                                    <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>{item.name}</span>
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-primary rounded-r-full" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
                        <div className={cn("flex items-center gap-3 px-3 py-3 mb-2", !isSidebarOpen && "lg:hidden")}>
                            <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary font-bold text-xs">
                                {session?.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{session?.user?.name}</span>
                                <span className="text-xs text-text-muted truncate uppercase tracking-widest">{session?.user?.role}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-brand-danger hover:bg-brand-danger/10 transition-all group"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 glass-card mx-6 mt-4 flex items-center justify-between px-6 border border-white/5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={cn("p-2 hover:bg-white/5 rounded-lg text-text-muted lg:hidden")}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="font-semibold text-lg hidden sm:block">
                            {menuItems.find(i => i.href === pathname)?.name || "Dashboard"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-brand-success/10 border border-brand-success/20 text-brand-success text-xs font-bold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                            BOT CONNECTED
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
