import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { History as HistoryIcon, ArrowLeft, ExternalLink, Trash2, Calendar, FileText, School, Search, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function History() {
    const { user, profile } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [targetProfile, setTargetProfile] = useState(null);

    // Get target user from URL or fallback to current user
    const targetUserId = searchParams.get('user') || user?.id;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (targetUserId) {
            fetchHistory();
            if (targetUserId !== user.id) {
                fetchTargetProfile();
            }
        }
    }, [user, targetUserId, navigate]);

    const fetchTargetProfile = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetUserId)
            .single();
        if (data) setTargetProfile(data);
    };

    const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('signatures')
            .select('*')
            .eq('created_by', targetUserId)
            .order('created_at', { ascending: false });

        if (!error) {
            setSignatures(data);
        }
        setLoading(false);
    };

    const deleteSignature = async (id) => {
        if (!confirm('Yakin ingin menghapus riwayat tanda tangan ini? QR Code yang sudah dicetak tidak akan bisa diverifikasi lagi.')) return;

        const { error } = await supabase
            .from('signatures')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Gagal menghapus: ' + error.message);
        } else {
            setSignatures(signatures.filter(s => s.id !== id));
        }
    };

    const filteredSignatures = signatures.filter(s =>
        s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Kembali ke Dashboard
                </button>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <HistoryIcon className="text-accent" />
                    Riwayat Tanda Tangan
                </h1>
            </div>

            {targetUserId !== user.id && targetProfile && (
                <div className="glass-card mb-6 border-blue-500/30 bg-blue-500/5">
                    <p className="text-blue-400 font-medium flex items-center gap-2">
                        <School size={18} />
                        Menampilkan riwayat milik: <span className="text-white font-bold">{targetProfile.full_name}</span>
                    </p>
                </div>
            )}

            <div className="glass-card mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Cari perihal atau kelas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 pr-4 bg-white/5"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-accent w-10 h-10" />
                </div>
            ) : filteredSignatures.length > 0 ? (
                <div className="space-y-4">
                    {filteredSignatures.map((sig) => (
                        <motion.div
                            key={sig.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-accent/30 transition-all border border-white/5"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-accent" />
                                    <h3 className="font-bold text-white">{sig.subject}</h3>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <School size={14} />
                                        {sig.class_name}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {sig.date_signed}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => window.open(`${window.location.origin}/#/verify?id=${sig.id}`, '_blank')}
                                    className="flex-1 md:flex-none p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm px-4"
                                >
                                    <ExternalLink size={16} />
                                    Cek
                                </button>
                                <button
                                    onClick={() => deleteSignature(sig.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-card">
                    <p className="text-gray-500 italic">Belum ada riwayat tanda tangan yang ditemukan.</p>
                </div>
            )}
        </div>
    );
}
