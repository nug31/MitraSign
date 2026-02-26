import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    FileText,
    Search,
    ArrowLeft,
    TrendingUp,
    ShieldCheck,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { user, profile } = useAuthStore();
    const navigate = useNavigate();
    const [walas, setWalas] = useState([]);
    const [recentSignatures, setRecentSignatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalWalas: 0,
        totalSignatures: 0,
        todaySignatures: 0
    });

    useEffect(() => {
        if (!user || profile?.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchAdminData();
    }, [user, profile, navigate]);

    const fetchAdminData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Stats
            const [profilesRes, signaturesRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact' }),
                supabase.from('signatures').select('id', { count: 'exact' })
            ]);

            const today = new Date().toLocaleDateString('en-GB');
            const { count: todayCount } = await supabase
                .from('signatures')
                .select('id', { count: 'exact' })
                .eq('date_signed', today);

            setStats({
                totalWalas: profilesRes.count || 0,
                totalSignatures: signaturesRes.count || 0,
                todaySignatures: todayCount || 0
            });

            // 2. Fetch Walas List with Signature Counts
            // In Supabase, we can use a join or aggregate if configured, 
            // but for simplicity we'll fetch all profiles and count their signatures
            const { data: profilesData } = await supabase
                .from('profiles')
                .select(`
                            id, 
                            full_name, 
                            unit_name, 
                            default_class,
                            signatures (id)
                        `)
                .order('full_name');

            const walasWithCount = profilesData.map(p => ({
                ...p,
                count: p.signatures?.length || 0
            }));

            setWalas(walasWithCount);

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWalas = walas.filter(w =>
        w.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.unit_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <ShieldCheck className="text-blue-400" />
                                Admin Panel
                            </h1>
                            <p className="text-slate-400">Monitoring Aktivitas Digital Signature Walas</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Users className="text-blue-400 w-6 h-6" />
                            </div>
                            <TrendingUp className="text-green-400 w-5 h-5" />
                        </div>
                        <h3 className="text-slate-400 font-medium">Total Walas</h3>
                        <p className="text-4xl font-bold mt-2">{stats.totalWalas}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/20 rounded-xl">
                                <FileText className="text-indigo-400 w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-slate-400 font-medium">Total Tanda Tangan</h3>
                        <p className="text-4xl font-bold mt-2">{stats.totalSignatures}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <ShieldCheck className="text-emerald-400 w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-slate-400 font-medium">Signature Hari Ini</h3>
                        <p className="text-4xl font-bold mt-2">{stats.todaySignatures}</p>
                    </motion.div>
                </div>

                {/* Search & Walas List */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-xl font-bold">Daftar Walas Terdaftar</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari Walas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50 text-slate-400 text-left">
                                <tr>
                                    <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Nama Walas</th>
                                    <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Unit / Sekolah</th>
                                    <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Total Tanda Tangan</th>
                                    <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium">
                                {filteredWalas.length > 0 ? filteredWalas.map((w, idx) => (
                                    <tr key={w.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">
                                                    {w.full_name?.charAt(0)}
                                                </div>
                                                <span className="font-semibold">{w.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{w.unit_name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
                                                {w.count} Signature
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/history?user=${w.id}`)}
                                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Lihat Detail
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            Tidak ada data walas ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
