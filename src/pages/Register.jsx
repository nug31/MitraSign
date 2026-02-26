import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, School } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // New users will be automatically added to 'profiles' by the DB trigger
            navigate('/login');
            alert('Pendaftaran berhasil! Silakan cek email untuk verifikasi (jika diaktifkan) atau langsung login.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass-card p-8"
            >
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="bg-accent/20 p-2 rounded-xl">
                        <UserPlus className="text-accent w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Daftar Akun Walas
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nama Lengkap & Gelar</label>
                        <div className="relative flex items-center">
                            <User className="absolute left-3 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-field pl-12 pr-4"
                                placeholder="Joko Setyo, S.T"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Sekolah</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-12 pr-4"
                                placeholder="name@school.id"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-3 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-12 pr-4"
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                        {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-accent hover:underline font-semibold">
                        Login di sini
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
