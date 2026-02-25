import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, User, Calendar, FileText, School, MapPin } from 'lucide-react';

export default function Verification() {
    const [searchParams] = useSearchParams();

    const data = {
        name: searchParams.get('name') || 'Unknown',
        class: searchParams.get('class') || '-',
        subject: searchParams.get('subject') || '-',
        date: searchParams.get('date') || '-',
        unit: searchParams.get('unit') || 'SMK Mitra Industri MM2100'
    };

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
                        Officially Signed
                    </p>
                </div>

                <div className="space-y-6 relative">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/10 p-2 rounded-lg mt-1">
                            <User size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Penandatangan</p>
                            <p className="text-lg font-semibold text-white leading-tight">{data.name}</p>
                            <p className="text-sm text-gray-400">Wali Kelas {data.class}</p>
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
                            <p className="text-sm text-gray-200 mt-1">{data.date}</p>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="School Logo" className="w-10 h-10 object-contain" />
                            <div>
                                <p className="text-sm font-bold text-white">{data.unit}</p>
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
                        Digital Signature ID: {Math.random().toString(36).substring(2, 12).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                        &copy; {new Date().getFullYear()} MitraSign - SMK Mitra Industri
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
