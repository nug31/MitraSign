import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, User, Calendar, FileText, School, MapPin, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Verification() {
    const [searchParams] = useSearchParams();
    const sigId = searchParams.get('id');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSignature = async () => {
            if (!sigId) {
                setError('ID Tanda Tangan tidak ditemukan.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('signatures')
                .select(`
                    *,
                    profiles (
                        full_name,
                        unit_name
                    )
                `)
                .eq('id', sigId)
                .single();

            if (error) {
                setError('Dokumen tidak dapat diverifikasi atau ID tidak valid.');
            } else {
                setData(data);
            }
            setLoading(false);
        };

        fetchSignature();
    }, [sigId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-accent w-12 h-12" />
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card border-t-4 border-t-red-500 text-center p-8">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">Verifikasi Gagal</h1>
                <p className="text-gray-400 text-sm mb-6">{error || 'Data tidak ditemukan'}</p>
                <button onClick={() => window.location.href = '/'} className="btn-primary w-full">Kembali ke Beranda</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-card border-t-4 border-t-green-500 relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-green-500/10 rounded-full blur-3xl"></div>

                <div className="text-center mb-8 relative">
                    <div className="flex justify-center mb-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                            className="bg-green-500/20 p-4 rounded-full"
                        >
                            <ShieldCheck className="w-16 h-16 text-green-500" />
                        </motion.div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Verification Status</h1>
                    <p className="text-green-500 font-semibold flex items-center justify-center gap-2 mt-1">
                        <CheckCircle2 size={16} />
                        Officially Signed & Verified
                    </p>
                </div>

                <div className="space-y-6 relative">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/10 p-2 rounded-lg mt-1">
                            <User size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Penandatangan</p>
                            <p className="text-lg font-semibold text-white leading-tight">{data.profiles?.full_name}</p>
                            <p className="text-sm text-gray-400">Wali Kelas {data.class_name}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-white/10 p-2 rounded-lg mt-1">
                            <FileText size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Perihal Dokumen</p>
                            <p className="text-sm text-gray-200 mt-1">{data.subject}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-white/10 p-2 rounded-lg mt-1">
                            <Calendar size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tanggal Tanda Tangan</p>
                            <p className="text-sm text-gray-200 mt-1">{data.date_signed}</p>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="School Logo" className="w-10 h-10 object-contain" />
                            <div>
                                <p className="text-sm font-bold text-white">{data.profiles?.unit_name}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin size={10} />
                                    <span>Kawasan Industri MM2100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                        Digital Signature ID:<br />{data.id.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-2">
                        &copy; {new Date().getFullYear()} MitraSign - SMK Mitra Industri
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
