"use client";

import { useState, useEffect } from "react";
import {
    MessageSquare,
    Plus,
    Trash2,
    Edit2,
    Search,
    Loader2,
    Terminal,
    Save,
    X,
    Code
} from "lucide-react";

export default function CommandManagement() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [error, setError] = useState("");

    // Form state
    const [command, setCommand] = useState("");
    const [response, setResponse] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/commands");
            const json = await res.json();
            if (Array.isArray(json)) setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/commands", {
                method: "POST",
                body: JSON.stringify({
                    id: editItem?.id,
                    command,
                    response
                }),
            });
            const result = await res.json();
            if (result.error) {
                setError(result.error);
                return;
            }
            setIsModalOpen(false);
            setEditItem(null);
            setCommand("");
            setResponse("");
            fetchData();
        } catch (err) {
            setError("Database connection error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus command bot ini?")) return;
        try {
            await fetch("/api/commands", {
                method: "DELETE",
                body: JSON.stringify({ id }),
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (item: any) => {
        setEditItem(item);
        setCommand(item.command);
        setResponse(item.response);
        setIsModalOpen(true);
    };

    const filteredData = data.filter(d =>
        d.command.toLowerCase().includes(search.toLowerCase()) ||
        d.response.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Bot Command CRUD</h1>
                    <p className="text-text-secondary text-sm">Define automated responses for your WhatsApp bot</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search commands..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>
                    <button
                        onClick={() => { setEditItem(null); setCommand(""); setResponse(""); setError(""); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-all text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> New Command
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                        <p className="text-text-secondary text-sm">Loading commands...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-text-muted text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Command</th>
                                    <th className="px-6 py-4 font-semibold">Automated Response</th>
                                    <th className="px-6 py-4 font-semibold">Stats</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-white/5 border border-white/5">
                                                    <Code className="w-3.5 h-3.5 text-brand-secondary" />
                                                </div>
                                                <code className="text-brand-primary font-bold">{item.command}</code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <p className="max-w-xs md:max-w-md truncate text-text-secondary italic">"{item.response}"</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> 84 hits</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg glass-card p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{editItem ? 'Edit Command' : 'New Bot Command'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Command Identifier</label>
                                <input
                                    type="text"
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                    required
                                    placeholder="e.g. /info"
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Response Content</label>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    required
                                    rows={5}
                                    placeholder="What should the bot say? Support for markdown-like WA formatting."
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-white/5 rounded-xl font-semibold hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> {editItem ? 'Update' : 'Create Command'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
