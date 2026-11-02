import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, CalendarDays, Clock, MapPin, Check, ArrowRight, User } from 'lucide-react';

const mockCars = [
    { id: 1, name: 'Hyundai H1', plate: 'B 2459 FGW', status: 'Tersedia', type: 'Van', color: 'bg-emerald-50' },
    { id: 2, name: 'Fortuner', plate: 'B 2793 FBE', status: 'Tersedia', type: 'SUV', color: 'bg-slate-50' },
    { id: 3, name: 'Elf 25', plate: 'B 7325 IR', status: 'Tersedia', type: 'Minibus', color: 'bg-emerald-50' },
    { id: 4, name: 'Elf 24', plate: 'B 7324 IR', status: 'Dipakai', type: 'Minibus', color: 'bg-teal-50' },
    { id: 5, name: 'Suzuki Carry', plate: 'B 8987 OZ', status: 'Tersedia', type: 'Van', color: 'bg-amber-50' },
    { id: 6, name: 'Honda CRV', plate: 'B 1458 SJD', status: 'Tersedia', type: 'SUV', color: 'bg-rose-50' },
    { id: 7, name: 'Omoda', plate: 'B 1674 FNO', status: 'Tersedia', type: 'SUV', color: 'bg-indigo-50' },
    { id: 8, name: 'Ambulance', plate: 'B 7818 IR', status: 'Tersedia', type: 'Ambulance', color: 'bg-red-50' },
    { id: 9, name: 'Isuzu Panther', plate: 'B 9989 IV', status: 'Tersedia', type: 'SUV', color: 'bg-stone-50' },
];

export default function FormPeminjaman() {
    const [selectedCar, setSelectedCar] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: '', jamMulai: '', jamSelesai: '', tujuan: '', keperluan: '', leader: ''
    });

    const handleCarSelect = (car) => {
        if (car.status !== 'Tersedia') return;
        setSelectedCar(car);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCar) {
            alert('Mohon pilih kendaraan terlebih dahulu.');
            return;
        }
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="max-w-md w-full bg-white border border-gray-100 shadow-2xl shadow-emerald-900/5 rounded-3xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30">
                        <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengajuan Terkirim</h2>
                    <p className="text-gray-500 mb-8">Permintaan kendaraan <span className="font-semibold text-gray-900">{selectedCar?.name}</span> Anda telah dikirim ke {formData.leader} untuk disetujui.</p>
                    
                    <button onClick={() => { setIsSubmitted(false); setSelectedCar(null); }} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold py-3.5 rounded-xl transition-colors">
                        Selesai
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
            {/* Minimal Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Pinjam Mobil</h1>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-5 pt-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Mau kemana hari ini?</h2>
                <p className="text-gray-500 mb-8">Pilih armada operasional untuk mendukung perjalanan dinas Anda.</p>

                <form onSubmit={handleSubmit}>
                    {/* Horizontal Scroll for Cars */}
                    <div className="mb-10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Pilih Kendaraan</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                            {mockCars.map((car) => (
                                <motion.div 
                                    key={car.id}
                                    whileTap={{ scale: car.status === 'Tersedia' ? 0.98 : 1 }}
                                    onClick={() => handleCarSelect(car)}
                                    className={`snap-start flex-shrink-0 w-64 p-5 rounded-3xl border-2 transition-all ${
                                        selectedCar?.id === car.id 
                                        ? 'border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-900/5' 
                                        : car.status === 'Tersedia'
                                            ? 'border-gray-100 bg-white hover:border-gray-200 cursor-pointer'
                                            : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 rounded-full ${car.color} flex items-center justify-center border border-black/5`}>
                                            <Car className={`w-6 h-6 ${selectedCar?.id === car.id ? 'text-emerald-600' : 'text-gray-600'}`} />
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                            car.status === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {car.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-lg">{car.name}</h4>
                                    <p className="text-gray-500 text-sm mt-1">{car.plate}</p>
                                    
                                    {selectedCar?.id === car.id && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center text-emerald-600 text-sm font-semibold">
                                            Terpilih <Check className="w-4 h-4 ml-1" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {selectedCar && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
                            >
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">2. Detail Perjalanan</h3>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1">
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                                <CalendarDays className="w-4 h-4 mr-2 text-emerald-600" /> Tanggal
                                            </label>
                                            <input type="date" required name="tanggal" value={formData.tanggal} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                            <div>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                                    <Clock className="w-4 h-4 mr-2 text-emerald-600" /> Jam Berangkat
                                                </label>
                                                <input type="time" required name="jamMulai" value={formData.jamMulai} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-400" /> Jam Kembali
                                                </label>
                                                <input type="time" required name="jamSelesai" value={formData.jamSelesai} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <MapPin className="w-4 h-4 mr-2 text-emerald-600" /> Tujuan & Keperluan
                                        </label>
                                        <div className="space-y-3">
                                            <input type="text" required name="tujuan" value={formData.tujuan} onChange={handleInputChange} placeholder="Lokasi tujuan..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all" />
                                            <textarea required name="keperluan" value={formData.keperluan} onChange={handleInputChange} rows="2" placeholder="Deskripsi singkat keperluan operasional..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all resize-none"></textarea>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-50">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Persetujuan Leader</label>
                                        <select required name="leader" value={formData.leader} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="">Pilih Leader Anda...</option>
                                            <option value="Bpk. Kepala Sekolah">Bpk. Kepala Sekolah</option>
                                            <option value="Wakil Kepala Sarpras">Wakil Kepala Sarpras</option>
                                        </select>
                                    </div>

                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex justify-center items-center gap-2 mt-4">
                                        Kirim Pengajuan <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
}
