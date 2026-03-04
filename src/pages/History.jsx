import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { History as HistoryIcon, ArrowLeft, ExternalLink, Trash2, Calendar, FileText, School, Search, Loader2, Paperclip, QrCode, X, Download } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function History() {
    const { user, profile } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [targetProfile, setTargetProfile] = useState(null);
    const [selectedSig, setSelectedSig] = useState(null);

    const getLogo = () => {
        const hostProfile = targetProfile || profile;
        if (hostProfile?.unit_name?.includes('03')) return '/logo03.png';
        return '/logo.png';
    };

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

        const { error, count } = await supabase
            .from('signatures')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('created_by', user.id);

        console.log('Delete result:', { error, count });

        if (error) {
            alert('Gagal menghapus: ' + error.message);
        } else if (count === 0) {
            alert('Hapus diblokir oleh sistem (RLS Policy). Silakan atur izin DELETE di Supabase Dashboard → Table Editor → signatures → RLS Policies.');
        } else {
            setSignatures(prev => prev.filter(s => s.id !== id));
        }
    };

    const filteredSignatures = signatures.filter(s =>
        s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadQr = (sig) => {
        const svg = document.getElementById(`qr-${sig.id}`);
        if (!svg) return;

        const scale = 4; // 4x scale for HD quality (220px → 880px)
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const qrImg = new Image();
        const logoImg = new Image();

        let loadedCount = 0;
        const handleLoad = () => {
            loadedCount++;
            if (loadedCount === 2) {
                canvas.width = qrImg.naturalWidth * scale;
                canvas.height = qrImg.naturalHeight * scale;
                ctx.imageSmoothingEnabled = false;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);
                const logoSize = 35 * scale;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                ctx.fillStyle = 'white';
                ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);

                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `QR_History_${sig.subject}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        qrImg.onload = handleLoad;
        logoImg.onload = handleLoad;
        qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        logoImg.src = getLogo();
    };

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 sm:gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">Kembali ke Dashboard</span>
                    <span className="sm:hidden">Kembali</span>
                </button>
                <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    <HistoryIcon className="text-accent" size={20} />
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
                                    {sig.attachment_url && (
                                        <div className="flex items-center gap-1 text-accent font-medium">
                                            <Paperclip size={14} />
                                            Lampiran PDF
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                                <button
                                    onClick={() => setSelectedSig(sig)}
                                    className="flex-1 md:flex-none p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg flex items-center justify-center gap-1 text-xs sm:text-sm px-3 sm:px-4 border border-accent/20"
                                >
                                    <QrCode size={14} />
                                    Lihat QR
                                </button>
                                <button
                                    onClick={() => window.open(`${window.location.origin}/#/verify?id=${sig.id}`, '_blank')}
                                    className="flex-1 md:flex-none p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg flex items-center justify-center gap-1 text-xs sm:text-sm px-3 sm:px-4"
                                >
                                    <ExternalLink size={14} />
                                    Cek
                                </button>
                                <button
                                    onClick={() => deleteSignature(sig.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/10"
                                >
                                    <Trash2 size={15} />
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

            <AnimatePresence>
                {/* QR Viewer Modal */}
                {selectedSig && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSig(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative max-w-sm w-full glass-card p-5 sm:p-8 flex flex-col items-center mx-3"
                        >
                            <button
                                onClick={() => setSelectedSig(null)}
                                className="absolute top-3 right-3 p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-base sm:text-xl font-bold text-white mb-1 text-center pr-6">{selectedSig.subject}</h3>
                            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">{selectedSig.class_name} • {selectedSig.date_signed}</p>

                            <div className="bg-white p-3 sm:p-4 rounded-2xl mb-5 sm:mb-8">
                                <QRCodeSVG
                                    id={`qr-${selectedSig.id}`}
                                    value={`${window.location.origin}/#/verify?id=${selectedSig.id}`}
                                    size={Math.min(window.innerWidth - 140, 220)}
                                    level="H"
                                    includeMargin={true}
                                    imageSettings={{
                                        src: getLogo(),
                                        x: undefined,
                                        y: undefined,
                                        height: 35,
                                        width: 35,
                                        excavate: true,
                                    }}
                                />
                            </div>

                            <button
                                onClick={() => downloadQr(selectedSig)}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                            >
                                <Download size={18} />
                                Download QR Code
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
}
