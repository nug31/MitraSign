import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Download, Link as LinkIcon, QrCode } from 'lucide-react';

const QrLink = () => {
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');

    const trimmed = url.trim();
    const value = trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;

    const downloadQr = () => {
        const canvas = document.getElementById('qr-link-canvas');
        if (!canvas) return;
        const a = document.createElement('a');
        a.download = `QR_${(label || 'Link').trim().replace(/\s+/g, '_')}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <QrCode className="text-blue-400" />
                            QR Link
                        </h1>
                        <p className="text-slate-400">Buat barcode dari link apa saja</p>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Link</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://bit.ly/..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nama file (opsional)</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Contoh: Lamaran Rekrutmen"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {value ? (
                        <div className="flex flex-col items-center gap-4 pt-2">
                            <div className="bg-white p-4 rounded-2xl">
                                <QRCodeCanvas
                                    id="qr-link-canvas"
                                    value={value}
                                    size={1000}
                                    level="M"
                                    marginSize={0}
                                    style={{ width: 280, height: 280 }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 break-all text-center">{value}</p>
                            <button
                                onClick={downloadQr}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Download PNG
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 text-sm italic py-8">
                            Tempel link di atas, QR akan muncul di sini
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QrLink;
