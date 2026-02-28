"use client";

import { useState, useEffect } from "react";
import {
    Users,
    UserCheck,
    UserX,
    Trash2,
    Shield,
    ShieldAlert,
    Loader2,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Plus,
    X,
    Save,
    Lock,
    UserPlus
} from "lucide-react";

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("APPROVED");
    const [role, setRole] = useState("USER");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateStatus = async (id: number, status: string, role: string) => {
        try {
            await fetch("/api/users", {
                method: "POST",
                body: JSON.stringify({ id, status, role }),
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await fetch("/api/users", {
                method: "DELETE",
                body: JSON.stringify({ id }),
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                body: JSON.stringify({ username, password, status, role }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
                return;
            }
            setIsModalOpen(false);
            setUsername("");
            setPassword("");
            setStatus("APPROVED");
            setRole("USER");
            fetchUsers();
        } catch (err) {
            setError("Failed to create user");
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-text-secondary text-sm">Review and manage user registrations & roles</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-all text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> New User
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                        <p className="text-text-secondary text-sm">Fetching users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-text-muted text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Registered</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {user.status === 'APPROVED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-success/10 text-brand-success text-xs font-medium">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            ) : user.status === 'REJECTED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-danger/10 text-brand-danger text-xs font-medium">
                                                    <XCircle className="w-3 h-3" /> Rejected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-medium">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-brand-primary text-white' : 'border border-white/10 text-text-muted'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => updateStatus(user.id, "APPROVED", user.role)}
                                                    title="Approve"
                                                    className="p-1.5 text-brand-success hover:bg-brand-success/10 rounded-lg transition-all"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(user.id, "REJECTED", user.role)}
                                                    title="Reject"
                                                    className="p-1.5 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-all"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-white/10 mx-1" />
                                                <button
                                                    onClick={() => updateStatus(user.id, user.status, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                    title="Toggle Admin Role"
                                                    className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                >
                                                    {user.role === 'ADMIN' ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    title="Delete User"
                                                    className="p-1.5 text-text-muted hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Create User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md glass-card p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold">Add Managed User</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Username</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        placeholder="Enter username"
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Enter password"
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 px-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    >
                                        <option value="APPROVED">APPROVED</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="REJECTED">REJECTED</option>
                                    </select>
                                </div>
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
                                    <Save className="w-4 h-4" /> Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
