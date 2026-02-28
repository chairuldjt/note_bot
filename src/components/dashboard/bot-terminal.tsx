"use client";

import { useState, useEffect } from "react";
import {
    Power,
    RefreshCw,
    Trash2,
    Activity,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BotTerminal() {
    const [botData, setBotData] = useState<any>({ status: "DISCONNECTED", hasQr: false, qr: null });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchBotStatus = async () => {
        try {
            const res = await fetch("/api/bot");
            const data = await res.json();
            setBotData(data);
        } catch (err) {
            console.error("Failed to fetch bot status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBotStatus();
        const interval = setInterval(fetchBotStatus, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (action: string) => {
        if (action === 'logout' && !confirm("Are you sure you want to logout and clear session?")) return;

        setActionLoading(true);
        try {
            await fetch("/api/bot", {
                method: "POST",
                body: JSON.stringify({ action }),
            });
            await fetchBotStatus();
        } catch (err) {
            alert("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between min-h-[300px]">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">WhatsApp Bot Terminal</h3>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            botData.status === "CONNECTED" ? "bg-brand-success/10 text-brand-success" :
                                botData.status === "CONNECTING" ? "bg-brand-accent/10 text-brand-accent" :
                                    "bg-brand-danger/10 text-brand-danger"
                        )}>
                            <Activity className={cn("w-3 h-3", botData.status === "CONNECTING" && "animate-pulse")} />
                            {botData.status}
                        </div>
                    </div>
                    <p className="text-text-secondary text-sm mb-6">
                        {botData.status === "CONNECTED" ? "Bot is online and responding to commands." : "Bot is currently offline. Please scan QR to connect."}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleAction("reconnect")}
                            disabled={actionLoading || botData.status === "CONNECTED"}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-brand-primary transition-all"
                        >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Power className="w-5 h-5" />}
                            Connect Bot
                        </button>
                        <button
                            onClick={() => handleAction("reconnect")}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-6 py-3 border border-slate-700 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all text-sm"
                        >
                            <RefreshCw className={cn("w-4 h-4", actionLoading && "animate-spin")} />
                            Restart
                        </button>
                        <button
                            onClick={() => handleAction("logout")}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-6 py-3 border border-brand-danger/30 text-brand-danger rounded-xl font-semibold hover:bg-brand-danger hover:text-white disabled:opacity-50 transition-all text-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-brand-success/80 h-32 overflow-y-auto">
                    <p>[{new Date().toLocaleTimeString()}] System: Waiting for connection...</p>
                    {botData.status === "CONNECTED" && <p className="text-brand-success">[{new Date().toLocaleTimeString()}] Connection: Established.</p>}
                    {botData.hasQr && <p className="text-brand-accent">[{new Date().toLocaleTimeString()}] Auth: QR Code generated. Awaiting scan...</p>}
                </div>
            </div>

            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                <div className="w-48 h-48 bg-white rounded-2xl p-3 mb-4 shadow-2xl shadow-brand-primary/10 flex items-center justify-center relative group">
                    {loading ? (
                        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                    ) : botData.qr ? (
                        <img src={botData.qr} alt="WA QR Code" className="w-full h-full" />
                    ) : botData.status === "CONNECTED" ? (
                        <div className="flex flex-col items-center gap-2 text-brand-success">
                            <CheckCircleIcon className="w-12 h-12" />
                            <span className="text-xs font-bold uppercase">Linked</span>
                        </div>
                    ) : (
                        <div className="text-slate-300 flex flex-col items-center gap-2">
                            <RefreshCw className="w-8 h-8 opacity-20" />
                            <span className="text-[10px] italic">No QR available</span>
                        </div>
                    )}
                </div>
                <h4 className="font-bold mb-1">{botData.status === "CONNECTED" ? "Device Linked" : "Scan to Login"}</h4>
                <p className="text-text-muted text-[10px] px-8">Refresh manually if QR code does not appear within 10 seconds</p>
            </div>
        </div>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}
