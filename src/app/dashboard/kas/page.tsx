"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    Plus,
    Trash2,
    Edit2,
    Search,
    TrendingUp,
    Loader2,
    Calendar,
    Save,
    X
} from "lucide-react";

export default function KasManagement() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    // Form state
    const [nama, setNama] = useState("");
    const [jumlah, setJumlah] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/kas");
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

    const totalKas = data.reduce((acc, curr) => acc + curr.jumlah, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch("/api/kas", {
                method: "POST",
                body: JSON.stringify({
                    id: editItem?.id,
                    nama,
                    jumlah: parseFloat(jumlah)
                }),
            });
            setIsModalOpen(false);
            setEditItem(null);
            setNama("");
            setJumlah("");
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus data kas ini?")) return;
        try {
            await fetch("/api/kas", {
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
        setNama(item.nama);
        setJumlah(item.jumlah.toString());
        setIsModalOpen(true);
    };

    const filteredData = data.filter(d =>
        d.nama.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Kas Management</h1>
                    <p className="text-text-secondary text-sm">Track group finances and bot transaction logs</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>
                    <button
                        onClick={() => { setEditItem(null); setNama(""); setJumlah(""); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-all text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add Record
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-card overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                            <p className="text-text-secondary text-sm">Loading records...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-text-muted text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Nama Item</th>
                                        <th className="px-6 py-4 font-semibold">Jumlah (Rp)</th>
                                        <th className="px-6 py-4 font-semibold">Tanggal</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-sm">{item.nama}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`font-bold ${item.jumlah < 0 ? 'text-brand-danger' : 'text-brand-success'}`}>
                                                    {item.jumlah < 0 ? '-' : '+'} Rp {Math.abs(item.jumlah).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-muted">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
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

                <div className="space-y-6">
                    <div className="glass-card p-6 bg-brand-primary/5 border-brand-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-brand-primary/20">
                                <TrendingUp className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="font-bold">Total Saldo Kas</h3>
                        </div>
                        <p className="text-3xl font-black text-text-primary">Rp {totalKas.toLocaleString()}</p>
                        <p className="text-text-muted text-xs mt-2 uppercase tracking-widest font-semibold italic">Terhitung dari awal</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md glass-card p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{editItem ? 'Edit Data Kas' : 'Tambah Data Kas'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Nama Keterangan</label>
                                <input
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    required
                                    placeholder="e.g. Pembelian Hosting"
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Jumlah (Rp)</label>
                                <input
                                    type="number"
                                    value={jumlah}
                                    onChange={(e) => setJumlah(e.target.value)}
                                    required
                                    placeholder="e.g. 50000"
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                                <p className="text-[10px] text-text-muted italic">Gunakan tanda minus (-) untuk pengeluaran</p>
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
                                    <Save className="w-4 h-4" /> {editItem ? 'Update' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
