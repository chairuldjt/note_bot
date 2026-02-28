import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Zap,
    MessageSquare,
    Activity,
    Users as UsersIcon,
    ArrowUpRight,
} from "lucide-react";
import pool from "@/lib/db";
import { cn } from "@/lib/utils";
import BotTerminal from "@/components/dashboard/bot-terminal";

async function getStats() {
    try {
        const [kasRows]: any = await pool.query("SELECT SUM(jumlah) as total FROM kas");
        const [userRows]: any = await pool.query("SELECT COUNT(*) as count FROM users");
        const [cmdRows]: any = await pool.query("SELECT COUNT(*) as count FROM bot_commands");

        return {
            totalKas: kasRows[0]?.total || 0,
            userCount: userRows[0]?.count || 0,
            cmdCount: cmdRows[0]?.count || 0
        };
    } catch (error) {
        return { totalKas: 0, userCount: 0, cmdCount: 0 };
    }
}

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const stats = await getStats();

    const cards = [
        {
            name: "Total Kas",
            value: `Rp ${stats.totalKas.toLocaleString()}`,
            icon: Zap,
            trend: "+12%",
            color: "text-brand-primary",
            bg: "bg-brand-primary/10"
        },
        {
            name: "Total Users",
            value: stats.userCount.toString(),
            icon: UsersIcon,
            trend: "+2",
            color: "text-brand-secondary",
            bg: "bg-brand-secondary/10"
        },
        {
            name: "Bot Commands",
            value: stats.cmdCount.toString(),
            icon: MessageSquare,
            trend: "Stable",
            color: "text-brand-accent",
            bg: "bg-brand-accent/10"
        },
        {
            name: "Instance Status",
            value: "Live",
            icon: Activity,
            trend: "100%",
            color: "text-brand-success",
            bg: "bg-brand-success/10"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Bot Controls - Now Interactive */}
            <BotTerminal />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl", card.bg)}>
                                <card.icon className={cn("w-6 h-6", card.color)} />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-brand-success">
                                <ArrowUpRight className="w-3 h-3" />
                                {card.trend}
                            </div>
                        </div>
                        <h4 className="text-text-secondary text-sm font-medium">{card.name}</h4>
                        <p className="text-2xl font-bold mt-1 text-text-primary">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Log Placeholder */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">System Logs</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                        <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Live Monitoring</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 opacity-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-text-muted" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Dashboard session started</p>
                                <p className="text-xs text-text-muted">User: {session.user?.username}</p>
                            </div>
                        </div>
                        <span className="text-xs text-text-muted">Just now</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 opacity-30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-text-muted" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Baileys instance initialized</p>
                                <p className="text-xs text-text-muted">Source: internal/wa-manager</p>
                            </div>
                        </div>
                        <span className="text-xs text-text-muted">1 min ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
