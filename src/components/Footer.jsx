import { motion } from 'framer-motion';
import { Instagram, MessageCircle, Globe, Code2, ExternalLink } from 'lucide-react';

export default function Footer() {
    const contacts = [
        {
            icon: <Instagram size={16} />,
            label: 'Instagram',
            value: '@j.s_nugroho',
            href: 'https://instagram.com/j.s_nugroho',
            color: 'from-pink-500 via-purple-500 to-orange-500'
        },
        {
            icon: <MessageCircle size={16} />,
            label: 'WhatsApp',
            value: '081316052316',
            href: 'https://wa.me/6281316052316',
            color: 'from-green-400 to-emerald-500'
        },
        {
            icon: <Globe size={16} />,
            label: 'Portofolio',
            value: 'jsnportofolio.netlify.app',
            href: 'https://jsnportofolio.netlify.app',
            color: 'from-blue-400 to-cyan-500'
        }
    ];

    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 border-t border-white/5 bg-gradient-to-b from-transparent to-black/30"
        >
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Developer credit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 border border-accent/20 rounded-xl">
                            <Code2 size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Developed by</p>
                            <p className="text-white font-bold text-sm tracking-wide">jsnugroho</p>
                        </div>
                    </div>

                    {/* Contact Links */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {contacts.map((c) => (
                            <a
                                key={c.label}
                                href={c.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                            >
                                <div className={`p-1 rounded-md bg-gradient-to-br ${c.color} text-white`}>
                                    {c.icon}
                                </div>
                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                                    {c.value}
                                </span>
                                <ExternalLink size={10} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} MitraSign — SMK Mitra Industri MM2100 · All rights reserved
                    </p>
                </div>
            </div>
        </motion.footer>
    );
}
