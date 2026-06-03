import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 border-t border-white/5 bg-gradient-to-b from-transparent to-black/30"
        >
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Developer credit */}
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 border border-accent/20 rounded-xl">
                            <Code2 size={20} className="text-accent" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Developed by</p>
                            <p className="text-white font-bold text-sm tracking-wide">Leclerc</p>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} MitraSign — SMK Mitra Industri · All rights reserved
                    </p>
                </div>
            </div>
        </motion.footer>
    );
}
