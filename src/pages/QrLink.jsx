import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { ArrowLeft, Download, Link as LinkIcon, QrCode, Barcode } from 'lucide-react';
import QrSizeControl, { qrPixels, PRINT_DPI } from '../components/QrSizeControl';
import { pngDataUrlWithDpi } from '../lib/pngDpi';

const QrLink = () => {
    const [mode, setMode] = useState('qr');
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');
    const [qrSize, setQrSize] = useState({ unit: 'cm', value: 2 });
    const [code, setCode] = useState('');
    const [barcodeError, setBarcodeError] = useState('');
    const barcodeRef = useRef(null);

    const trimmed = url.trim();
    const value = trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
    const codeValue = code.trim();
    const qrPixelSize = qrPixels(qrSize);

    useEffect(() => {
        if (mode !== 'barcode' || !codeValue || !barcodeRef.current) return;
        try {
            JsBarcode(barcodeRef.current, codeValue, {
                format: 'CODE128',
                width: 4,
                height: 160,
                margin: 20,
                displayValue: true,
                fontSize: 28,
                background: '#ffffff'
            });
            setBarcodeError('');
        } catch (e) {
            setBarcodeError('Teks mengandung karakter yang tidak didukung barcode');
        }
    }, [mode, codeValue]);

    const download = (canvasId, prefix) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const a = document.createElement('a');
        a.download = `${prefix}_${(label || 'Link').trim().replace(/\s+/g, '_')}.png`;
        const png = canvas.toDataURL('image/png');
        a.href = canvasId === 'qr-link-canvas' && qrSize.unit === 'cm' ? pngDataUrlWithDpi(png, PRINT_DPI) : png;
        a.click();
    };

    const tabClass = (active) =>
        `flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`;

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
                        <p className="text-slate-400">Buat QR atau barcode</p>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-slate-800/50 border border-white/10 rounded-xl mb-4">
                    <button onClick={() => setMode('qr')} className={tabClass(mode === 'qr')}>
                        <QrCode size={16} /> QR Link
                    </button>
                    <button onClick={() => setMode('barcode')} className={tabClass(mode === 'barcode')}>
                        <Barcode size={16} /> Barcode
                    </button>
                </div>

                <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-6 space-y-5">
                    {mode === 'qr' ? (
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
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Isi barcode (teks pendek / angka)</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="69754539"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            />
                        </div>
                    )}

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

                    {mode === 'qr' && (value ? (
                        <div className="flex flex-col items-center gap-4 pt-2">
                            <div className="bg-white p-4 rounded-2xl">
                                <QRCodeCanvas
                                    id="qr-link-canvas"
                                    value={value}
                                    size={qrPixelSize}
                                    level="M"
                                    marginSize={0}
                                    style={{ width: 280, height: 280 }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 break-all text-center">{value}</p>
                            <div className="w-full">
                                <QrSizeControl size={qrSize} onChange={setQrSize} />
                            </div>
                            <button
                                onClick={() => download('qr-link-canvas', 'QR')}
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
                    ))}

                    {mode === 'barcode' && (codeValue ? (
                        <div className="flex flex-col items-center gap-4 pt-2">
                            {barcodeError && <p className="text-sm text-red-400">{barcodeError}</p>}
                            <div className={`bg-white rounded-2xl overflow-hidden w-full ${barcodeError ? 'hidden' : ''}`}>
                                <canvas ref={barcodeRef} id="barcode-canvas" style={{ width: '100%', height: 'auto' }} />
                            </div>
                            <button
                                onClick={() => download('barcode-canvas', 'Barcode')}
                                disabled={!!barcodeError}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl font-semibold transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Download PNG
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 text-sm italic py-8">
                            Ketik isi barcode di atas, barcode akan muncul di sini
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QrLink;
