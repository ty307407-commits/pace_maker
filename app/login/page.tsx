'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';

export default function LoginPage() {
    const router = useRouter();
    const { user, signIn, loading: authLoading } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && !authLoading) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(email);
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send magic link');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            {/* Background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Language Toggle */}
            <button
                onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
                className="absolute top-4 right-4 glass-panel px-4 py-2 rounded-xl text-white text-sm hover:bg-white/10 transition-colors"
            >
                {language === 'en' ? '日本語' : 'English'}
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-panel p-8 rounded-3xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">PaceMaker</h1>
                        <p className="text-slate-400">
                            {language === 'ja'
                                ? '遅れても、計画を自動修正。「進捗」を断ち切り、完走まで導きます。'
                                : 'Adaptive goal tracking that keeps you moving forward.'}
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {language === 'ja' ? 'メールアドレス' : 'Email Address'}
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={language === 'ja' ? '例）taro@example.com' : 'e.g. you@example.com'}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? (language === 'ja' ? '送信中...' : 'Sending...')
                                    : (language === 'ja' ? 'ログインリンクを送信' : 'Send Magic Link')}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="p-4 bg-green-500/20 rounded-full">
                                    <FaCheckCircle className="text-green-400 text-4xl" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white">
                                {language === 'ja' ? 'メールを確認してください' : 'Check your email'}
                            </h3>
                            <p className="text-slate-400">
                                {language === 'ja'
                                    ? `${email} にログインリンクを送信しました。メール内のリンクをクリックしてログインしてください。`
                                    : `We sent a login link to ${email}. Click the link in the email to sign in.`}
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                            >
                                {language === 'ja' ? '別のメールアドレスを使用' : 'Use a different email'}
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center mt-6 text-slate-500 text-sm">
                    {language === 'ja'
                        ? 'パスワード不要。メールで簡単ログイン。'
                        : 'No password required. Login with email magic link.'}
                </p>
            </motion.div>
        </main>
    );
}
