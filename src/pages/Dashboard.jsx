import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, User, School, Calendar, FileText, Download, Share2, LogOut, History, Save, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
    const { user, profile, signOut } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [savedId, setSavedId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        class: '',
        subject: 'Rapor Sumatif Tengah Semester Gasal T.A 2025-2026',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        unit: 'SMK Mitra Industri MM2100'
    });

    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        if (!user && !loading) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                name: profile.full_name || '',
                unit: profile.unit_name || 'SMK Mitra Industri MM2100',
                class: profile.default_class || ''
            }));
        }
    }, [profile]);

    useEffect(() => {
        if (savedId) {
            const baseUrl = window.location.origin + window.location.pathname + '#/verify';
            setQrUrl(`${baseUrl}?id=${savedId}`);
        } else {
            setQrUrl('');
        }
    }, [savedId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSavedId(null); // Reset saved status on edit
    };

    const handleSave = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('signatures')
            .insert([{
                created_by: user.id,
                subject: formData.subject,
                class_name: formData.class,
                date_signed: formData.date
            }])
            .select()
            .single();

        if (error) {
            alert('Gagal menyimpan signature: ' + error.message);
        } else {
            setSavedId(data.id);
        }
        setLoading(false);
    };

    const downloadQr = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

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
                canvas.width = qrImg.width;
                canvas.height = qrImg.height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(qrImg, 0, 0);
                const logoSize = 40;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                ctx.fillStyle = 'white';
                ctx.fillRect(x, y, logoSize, logoSize);
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);

                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `QR_Signature_${formData.name}_${formData.class}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        qrImg.onload = handleLoad;
        logoImg.onload = handleLoad;
        qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        logoImg.src = '/logo.png';
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header / Navbar replacement */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 glass-card p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                    <QrCode className="text-accent w-8 h-8" />
                    <div>
                        <h1 className="text-xl font-bold text-white">MitraSign</h1>
                        <p className="text-xs text-gray-500">Digital Signature for Teachers</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <History size={18} />
                        History
                    </button>
                    <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-white">{profile?.full_name}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{profile?.role}</p>
                        </div>
                        <button
                            onClick={signOut}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-8"
            >
                {/* Input Section */}
                <div className="flex-1 glass-card">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <User size={20} className="text-accent" />
                        Detail Dokumen
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nama Penandatangan (Otomatis)</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-3 w-5 h-5 text-accent/70" />
                                <input
                                    name="name"
                                    value={formData.name}
                                    readOnly
                                    className="input-field pl-16 pr-4 bg-white/5 opacity-70 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Kelas</label>
                                <div className="relative flex items-center">
                                    <School className="absolute left-3 w-5 h-5 text-accent/70" />
                                    <input
                                        name="class"
                                        value={formData.class}
                                        onChange={handleChange}
                                        className="input-field pl-16 pr-4"
                                        placeholder="Contoh: XII TKR 3"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Tanggal</label>
                                <div className="relative flex items-center">
                                    <Calendar className="absolute left-3 w-5 h-5 text-accent/70" />
                                    <input
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="input-field pl-16 pr-4"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Perihal Dokumen</label>
                            <div className="relative flex items-start">
                                <FileText className="absolute left-3 top-3 w-5 h-5 text-accent/70" />
                                <textarea
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="input-field pl-16 pr-4 pt-2.5 min-h-[100px]"
                                    placeholder="Contoh: Rapor Semester Ganjil"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading || !formData.class || !formData.subject}
                        className={`w-full mt-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${savedId
                                ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                                : 'bg-accent hover:bg-accent-hover text-black'
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (savedId ? <CheckCircle size={20} /> : <Save size={20} />)}
                        {loading ? 'Menyimpan...' : (savedId ? 'Tersimpan & Siap Scan' : 'Generate Signature (Save to DB)')}
                    </button>
                    {!savedId && (
                        <p className="text-[10px] text-center text-gray-500 mt-2 uppercase tracking-widest">
                            Tombol ini akan mendaftarkan tanda tangan ke database resmi sekolah
                        </p>
                    )}
                </div>

                {/* QR Preview Section */}
                <div className="w-full md:w-[400px]">
                    <div className="glass-card sticky top-8 flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-6">Preview MitraSign</h2>

                        <div className={`p-4 rounded-3xl shadow-2xl mb-6 relative group transform transition-all duration-300 ${savedId ? 'bg-white scale-105' : 'bg-white/10 grayscale opacity-50 shadow-none'}`}>
                            {savedId ? (
                                <>
                                    <QRCodeSVG
                                        id="qr-code-svg"
                                        value={qrUrl}
                                        size={250}
                                        level="H"
                                        includeMargin={true}
                                        imageSettings={{
                                            src: "/logo.png",
                                            x: undefined,
                                            y: undefined,
                                            height: 40,
                                            width: 40,
                                            excavate: true,
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center backdrop-blur-sm">
                                        <p className="text-white text-sm font-bold">READY TO SCAN</p>
                                    </div>
                                </>
                            ) : (
                                <div className="w-[250px] h-[250px] flex items-center justify-center border-4 border-dashed border-white/20 rounded-2xl">
                                    <p className="text-gray-500 text-xs text-center px-8 font-medium italic">
                                        Klik tombol "Generate Signature" untuk melihat QR Code yang valid
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={downloadQr}
                                disabled={!savedId}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${savedId
                                        ? 'bg-white/10 hover:bg-white/20 text-white'
                                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <Download size={18} />
                                Download PNG
                            </button>
                            <button
                                onClick={() => window.open(qrUrl, '_blank')}
                                disabled={!savedId}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${savedId
                                        ? 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30'
                                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <Share2 size={18} />
                                Test Verification Link
                            </button>
                        </div>

                        {savedId && (
                            <p className="text-xs text-center text-green-500/70 mt-6 font-medium">
                                QR Code ini berisi ID Unik yang terdaftar secara resmi.
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
