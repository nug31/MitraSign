import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, User, School, Calendar, FileText, Download, Share2, LogOut, History, Save, Loader2, CheckCircle, ShieldCheck, FileUp, Paperclip, Edit2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Dashboard() {
    const { user, profile, signOut, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [savedId, setSavedId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isEditingNik, setIsEditingNik] = useState(false);
    const [updateNikLoading, setUpdateNikLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        nik: '',
        class: '',
        subject: 'Rapor Sumatif Tengah Semester Genap T.P 2025-2026',
        date: '12 Maret 2026',
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
                nik: profile.nik || '',
                unit: profile.unit_name || 'SMK Mitra Industri MM2100',
                class: profile.default_class || (profile.role === 'kepsek' ? 'Semua Kelas' : '')
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

    const handleUpdateNik = async () => {
        if (!isEditingNik) {
            setIsEditingNik(true);
            return;
        }

        if (!formData.nik) {
            alert('NIK tidak boleh kosong');
            return;
        }

        setUpdateNikLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ nik: formData.nik })
            .eq('id', user.id);

        if (error) {
            alert('Gagal memperbarui NIK: ' + error.message);
        } else {
            await fetchProfile(user.id);
            setIsEditingNik(false);
        }
        setUpdateNikLoading(false);
    };

    const handleSave = async () => {
        setLoading(true);

        // 1. Ensure profile exists (Foreign Key Safety)
        if (!profile) {
            const { data: profileCheck, error: checkError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (checkError || !profileCheck) {
                // Profile missing, try to create it manually as a fallback
                const { error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: user.id,
                        full_name: user.user_metadata?.full_name || 'Anonymous Walas',
                        unit_name: 'SMK Mitra Industri MM2100'
                    }]);

                if (createError) {
                    alert('Gagal membuat profil: ' + createError.message + '\nPastikan kamu sudah menjalankan SQL Schema di Supabase.');
                    setLoading(false);
                    return;
                }
            }
        }

        // 2. Upload PDF if exists (Principal only)
        let currentFileUrl = null;
        let currentFileName = null;

        if (file && profile?.role === 'kepsek') {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file);

            if (uploadError) {
                alert('Gagal mengunggah PDF: ' + uploadError.message);
                setLoading(false);
                setUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('attachments')
                .getPublicUrl(filePath);

            currentFileUrl = publicUrl;
            currentFileName = file.name;
        }

        // 3. Insert Signature
        const { data, error } = await supabase
            .from('signatures')
            .insert([{
                created_by: user.id,
                subject: formData.subject,
                class_name: formData.class,
                date_signed: formData.date,
                attachment_url: currentFileUrl,
                attachment_name: currentFileName
            }])
            .select()
            .single();

        if (error) {
            alert('Gagal menyimpan signature: ' + error.message);
        } else {
            setSavedId(data.id);
            setFileUrl(currentFileUrl);
            setFileName(currentFileName);
        }
        setLoading(false);
        setUploading(false);
    };

    const downloadQr = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const scale = 4; // 4x scale for HD quality (250px → 1000px)
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
                const logoSize = 40 * scale;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                ctx.fillStyle = 'white';
                ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
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
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
            {/* Header / Navbar */}
            <div className="flex flex-row justify-between items-center mb-6 gap-3 glass-card p-3 sm:p-4 rounded-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                    <img src="/favicon.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                    <div>
                        <h1 className="text-base sm:text-xl font-bold text-white">MitraSign</h1>
                        <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Digital Signature for Teachers</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <History size={16} />
                        <span className="hidden sm:inline">History</span>
                    </button>
                    {profile?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1.5 rounded-lg border border-blue-500/20"
                        >
                            <ShieldCheck size={14} />
                            <span className="hidden sm:inline">Admin</span>
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">{profile?.full_name}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{profile?.role}</p>
                        </div>
                        <button
                            onClick={signOut}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-4 sm:gap-8"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 flex justify-between items-center">
                                <span>NIK (Nomor Induk Karyawan)</span>
                                <button
                                    onClick={handleUpdateNik}
                                    disabled={updateNikLoading}
                                    className="text-[10px] text-accent flex items-center gap-1 hover:underline uppercase font-bold tracking-wider"
                                >
                                    {updateNikLoading ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : isEditingNik ? (
                                        <><Check size={12} /> Simpan NIK</>
                                    ) : (
                                        <><Edit2 size={12} /> {formData.nik ? 'Ubah' : 'Tambah'} NIK</>
                                    )}
                                </button>
                            </label>
                            <div className="relative flex items-center">
                                <ShieldCheck className="absolute left-3 w-5 h-5 text-accent/70" />
                                <input
                                    name="nik"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    readOnly={!isEditingNik}
                                    className={`input-field pl-16 pr-4 transition-all ${!isEditingNik ? 'bg-white/5 opacity-70 cursor-not-allowed border-transparent' : 'bg-accent/5 border-accent/30 focus:border-accent shadow-[0_0_15px_-5px_theme(colors.accent.DEFAULT)]'}`}
                                    placeholder="Masukkan NIK Anda..."
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

                        {profile?.role === 'kepsek' && (
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex justify-between items-center">
                                    <span>Lampiran PDF (Opsional)</span>
                                    {file && <span className="text-[10px] text-accent uppercase font-bold px-2 py-0.5 bg-accent/10 rounded">Terpilih</span>}
                                </label>
                                <div className={`relative flex items-center p-4 border-2 border-dashed rounded-xl transition-all ${file ? 'border-accent/40 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={`p-3 rounded-lg ${file ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-500'}`}>
                                            {file ? <Paperclip size={24} /> : <FileUp size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${file ? 'text-white' : 'text-gray-500'}`}>
                                                {file ? file.name : 'Pilih file PDF lampiran...'}
                                            </p>
                                            <p className="text-[10px] text-gray-600 uppercase tracking-wider">Maksimal 5MB • Hanya PDF</p>
                                        </div>
                                        {file && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                className="z-20 p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <LogOut size={16} className="rotate-90" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading || !formData.class || !formData.subject}
                        className={`w-full mt-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${savedId
                            ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                            : (loading || !formData.class || !formData.subject)
                                ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed border border-white/5'
                                : 'bg-accent hover:bg-accent-hover text-black shadow-lg shadow-accent/20'
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
                    <div className="glass-card md:sticky md:top-8 flex flex-col items-center">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Preview MitraSign</h2>

                        <div className={`p-3 sm:p-4 rounded-3xl shadow-2xl mb-4 sm:mb-6 relative group transform transition-all duration-300 ${savedId ? 'bg-white scale-100 sm:scale-105' : 'bg-white/10 grayscale opacity-50 shadow-none'}`}>
                            {savedId ? (
                                <>
                                    <QRCodeSVG
                                        id="qr-code-svg"
                                        value={qrUrl}
                                        size={Math.min(window.innerWidth - 120, 250)}
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
                                <div className="w-[220px] sm:w-[250px] h-[220px] sm:h-[250px] flex items-center justify-center border-4 border-dashed border-white/20 rounded-2xl">
                                    <p className="text-gray-500 text-xs text-center px-6 font-medium italic">
                                        Klik tombol "Generate Signature" untuk melihat QR Code yang valid
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={downloadQr}
                                disabled={!savedId}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${savedId
                                    ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <Download size={18} />
                                Download PNG
                            </button>
                            <button
                                onClick={() => window.open(qrUrl, '_blank')}
                                disabled={!savedId}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${savedId
                                    ? 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 active:scale-95'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <Share2 size={18} />
                                Test Verification Link
                            </button>
                        </div>

                        {savedId && (
                            <p className="text-xs text-center text-green-500/70 mt-4 sm:mt-6 font-medium">
                                QR Code ini berisi ID Unik yang terdaftar secara resmi.
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
}
