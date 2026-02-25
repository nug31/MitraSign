import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, User, School, Calendar, FileText, Download, Share2 } from 'lucide-react';

export default function Dashboard() {
    const [formData, setFormData] = useState({
        name: 'Joko Setyo Nugroho, S.T',
        class: 'X TKR 3',
        subject: 'Rapor Sumatif Tengah Semester Gasal T.A 2023-2024',
        date: '23 Maret 2024',
        unit: 'SMK Mitra Industri MM2100'
    });

    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        // Generate verification URL
        const params = new URLSearchParams(formData).toString();
        const baseUrl = window.location.origin + '/verify';
        setQrUrl(`${baseUrl}?${params}`);
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const downloadQr = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `QR_Signature_${formData.name}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-8"
            >
                {/* Input Section */}
                <div className="flex-1 glass-card">
                    <div className="flex items-center gap-3 mb-6">
                        <QrCode className="text-accent w-8 h-8" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            MitraSign
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Penandatanganan</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-3 w-5 h-5 text-accent/70" />
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field pl-16 pr-4"
                                    placeholder="Nama Lengkap & Gelar"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Wali Kelas</label>
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
                                        placeholder="Contoh: 23 Maret 2026"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Perihal</label>
                            <div className="relative flex items-start">
                                <FileText className="absolute left-3 top-3 w-5 h-5 text-accent/70" />
                                <textarea
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="input-field pl-16 pr-4 pt-2.5 min-h-[100px]"
                                    placeholder="Deskripsi perihal tanda tangan"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Unit Kerja</label>
                            <input
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="input-field px-4"
                                placeholder="Nama Sekolah/Instansi"
                            />
                        </div>
                    </div>
                </div>

                {/* QR Preview Section */}
                <div className="w-full md:w-[400px]">
                    <div className="glass-card sticky top-8 flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-6">Preview MitraSign</h2>

                        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6 relative group transform transition-transform hover:scale-105 duration-300">
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
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={downloadQr}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Download PNG
                            </button>
                            <button
                                onClick={() => window.open(qrUrl, '_blank')}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} />
                                Test Verification Link
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-500 mt-6">
                            Scan QR di atas untuk memvalidasi keaslian tanda tangan digital ini secara real-time.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
