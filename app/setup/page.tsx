'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useGoal } from '../../context/GoalContext';
import { FaGlobe, FaUser, FaBell, FaEnvelope, FaComment, FaBan, FaCheck, FaArrowRight } from 'react-icons/fa';

export default function SetupPage() {
    const router = useRouter();
    const { t, language, setLanguage } = useLanguage();
    const { setUserProfile } = useGoal();
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [name, setName] = useState('');

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            handleAnswer('name', name);
        }
    };

    const handleAnswer = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        const totalSteps = 4; // Name, Style, Time, Notifications -> Analyze
        // Wait a brief moment for visual feedback before stepping
        setTimeout(() => {
            if (step < totalSteps) {
                setStep(prev => prev + 1);
            } else {
                setStep(prev => prev + 1); // Go to Analyzing (5)
            }
        }, 200);
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification("PaceMaker", {
                body: language === 'ja' ? "通知設定が完了しました！" : "Notifications enabled!",
            });
            handleAnswer('notifications', 'BROWSER');
        } else {
            handleAnswer('notifications', 'NONE');
        }
    };

    const finishSetup = async () => {
        let type: any = 'STEADY';
        let multiplier = 1.0;

        if (answers['homework_style'] === 'last_minute') {
            type = 'PROCRASTINATOR';
            multiplier = 1.5;
        } else if (answers['homework_style'] === 'front_load') {
            type = 'SPRINTER';
            multiplier = 0.8;
        }

        const notifMethod = (answers['notifications'] as any) || 'NONE';

        try {
            await setUserProfile({
                name: answers['name'] || 'User',
                personalityType: type,
                pacingMultiplier: multiplier,
                notifications: {
                    enabled: notifMethod !== 'NONE',
                    method: notifMethod,
                    time: '09:00'
                },
                streak: 1,
                lastLoginDate: new Date().toISOString().split('T')[0]
            });
            router.push('/create-goal'); // Go to goal creation directly after setup
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
                    className="glass-panel px-5 py-3 rounded-full flex items-center gap-3 hover:bg-white/10 transition-colors shadow-lg"
                >
                    <FaGlobe className="text-stone-300 text-lg" />
                    <span className="text-base font-bold text-white">{language === 'en' ? 'English' : '日本語'}</span>
                </button>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-3xl w-full glass-panel p-8 md:p-12 rounded-[2.5rem] relative z-10 shadow-2xl border border-white/10"
            >
                <div className="mb-10 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-500 ${i <= (step > 4 ? 4 : step) ? 'bg-indigo-500 w-12' : 'bg-slate-700 w-4'}`}
                            />
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {step === 5 ? t('setup.analyzing') : t('app.title')}
                    </h1>
                    {step < 5 && <p className="text-lg md:text-xl text-slate-300">{t('setup.subtitle')}</p>}
                </div>

                <div className="min-h-[300px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Name */}
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                onSubmit={handleNameSubmit}
                                className="space-y-8 w-full max-w-lg mx-auto flex flex-col"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t('setup.q_name')}</h2>
                                </div>
                                <div className="relative group">
                                    <FaUser className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t('setup.name_placeholder')}
                                        className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 text-2xl transition-all shadow-inner"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!name.trim()}
                                    className="w-auto self-start px-12 py-4 mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <span>{t('setup.next')}</span> <FaArrowRight />
                                </button>
                            </motion.form>
                        )}

                        {/* Step 2: Homework Style */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-8 w-full max-w-xl mx-auto"
                            >
                                <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">{t('setup.q1')}</h2>
                                <div className="flex flex-col gap-6">
                                    {[
                                        { id: 'last_minute', label: t('setup.a1_1'), desc: t('setup.a1_1_desc'), color: 'text-indigo-300' },
                                        { id: 'steady', label: t('setup.a1_2'), desc: t('setup.a1_2_desc'), color: 'text-green-300' },
                                        { id: 'front_load', label: t('setup.a1_3'), desc: t('setup.a1_3_desc'), color: 'text-blue-300' },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswer('homework_style', option.id)}
                                            className="w-full text-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group flex flex-col items-center justify-center gap-3 min-h-[120px]"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className={`text-xl font-bold ${option.color} group-hover:text-white transition-colors`}>{option.label}</div>
                                                <div className="text-base text-slate-400 group-hover:text-slate-300">{option.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Productive Time */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-8 w-full max-w-xl mx-auto"
                            >
                                <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">{t('setup.q2')}</h2>
                                <div className="flex flex-col gap-6">
                                    {['morning', 'night', 'anytime'].map((time, idx) => (
                                        <button
                                            key={time}
                                            onClick={() => handleAnswer('productive_time', time)}
                                            className="w-full text-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all text-xl font-medium flex flex-col items-center justify-center min-h-[120px]"
                                        >
                                            {t(`setup.a2_${idx + 1}`)}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Notifications */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-6 w-full max-w-xl mx-auto"
                            >
                                <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">{t('setup.q3')}</h2>

                                <button
                                    onClick={requestNotificationPermission}
                                    className="w-full text-left p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all flex items-center gap-6 group"
                                >
                                    <div className="p-4 bg-indigo-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <FaBell size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-indigo-100 mb-1">{t('setup.a3_1')}</div>
                                        <div className="text-indigo-300/80 text-sm">Recommended for staying on track</div>
                                    </div>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAnswer('notifications', 'EMAIL')}
                                        className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3 opacity-60 hover:opacity-100"
                                    >
                                        <FaEnvelope className="text-slate-400" />
                                        <span className="text-lg">{t('setup.a3_2')}</span>
                                    </button>

                                    <button
                                        onClick={() => handleAnswer('notifications', 'LINE')}
                                        className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3 opacity-60 hover:opacity-100"
                                    >
                                        <FaComment className="text-[#06C755]" />
                                        <span className="text-lg">{t('setup.a3_3')}</span>
                                    </button>
                                </div>

                                <div className="pt-4 text-center">
                                    <button
                                        onClick={() => handleAnswer('notifications', 'NONE')}
                                        className="px-6 py-2 text-slate-400 hover:text-slate-200 text-base border-b border-transparent hover:border-slate-400 transition-colors"
                                    >
                                        {t('setup.a3_4')}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Final Step: Analyzing Result */}
                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-12 max-w-xl mx-auto"
                            >
                                <div className="inline-block p-6 rounded-full bg-green-500/20 text-green-400 mb-8 animate-bounce shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                                    <span className="text-4xl">✨</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-emerald-500">
                                    {t('setup.analyzing')}
                                </h2>

                                <div className="my-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-slate-300 text-lg mb-2">{t('setup.result')}</p>
                                    <strong className="text-2xl md:text-3xl text-white block mt-2 font-outfit">{t('setup.plan_type')}</strong>
                                </div>

                                <button
                                    onClick={finishSetup}
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xl font-bold rounded-2xl shadow-xl shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {t('setup.go_dashboard')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>
        </div>
    );
}
