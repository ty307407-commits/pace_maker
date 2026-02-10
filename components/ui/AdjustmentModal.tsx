'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Milestone } from '../../lib/types';
import { format } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { useState } from 'react';
import { FaCalendarAlt, FaRunning, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

interface AdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    milestone: Milestone | null;
    onAdjust: (type: 'extend' | 'squeeze') => void;
    onComplete: () => void;
}

export function AdjustmentModal({ isOpen, onClose, milestone, onAdjust, onComplete }: AdjustmentModalProps) {
    const { t, language } = useLanguage();
    const [mode, setMode] = useState<'view' | 'adjust'>('view');

    if (!isOpen || !milestone) return null;

    const isLate = new Date() > new Date(milestone.targetDate) && milestone.status !== 'completed';

    const getDateFormat = (dateStr: string) => {
        if (language === 'ja') {
            return format(new Date(dateStr), 'yyyy年M月d日', { locale: ja });
        }
        return format(new Date(dateStr), 'MMMM d, yyyy', { locale: enUS });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-[#1E1E28] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{milestone.title}</h2>
                                <p className="text-sm text-slate-400">{getDateFormat(milestone.targetDate)}</p>
                            </div>
                            <div className={`
                px-3 py-1 rounded-full text-xs font-bold border
                ${milestone.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    milestone.status === 'missed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        'bg-blue-500/20 text-blue-400 border-blue-500/30'}
              `}>
                                {t(`timeline.status.${milestone.status}`)}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        <p className="text-slate-300 leading-relaxed">
                            {milestone.description || (language === 'ja' ? '詳細説明はありません。' : "No detailed description provided.")}
                        </p>

                        {/* Actions for Late/Pending items */}
                        {isLate && milestone.status !== 'completed' && (
                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <div className="flex items-center gap-3 mb-3 text-orange-400">
                                    <FaExclamationTriangle />
                                    <span className="font-semibold text-sm">{t('modal.behind_schedule')}</span>
                                </div>

                                {mode === 'view' ? (
                                    <button
                                        onClick={() => setMode('adjust')}
                                        className="w-full py-2.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-sm font-medium transition-colors border border-orange-500/30"
                                    >
                                        {t('modal.adjust_plan')}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => onAdjust('extend')}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A35] hover:bg-[#323240] border border-white/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30">
                                                    <FaCalendarAlt />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-white">{t('modal.extend_deadline')}</div>
                                                    <div className="text-xs text-slate-400">{t('modal.extend_desc')}</div>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => onAdjust('squeeze')}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A35] hover:bg-[#323240] border border-white/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30">
                                                    <FaRunning />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-white">{t('modal.increase_intensity')}</div>
                                                    <div className="text-xs text-slate-400">{t('modal.increase_desc')}</div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Complete Button */}
                        {milestone.status !== 'completed' && (
                            <button
                                onClick={onComplete}
                                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <FaCheckCircle className="text-lg" />
                                {t('modal.mark_as_completed')}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
