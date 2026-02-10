'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Milestone } from '../../lib/types';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { useLanguage } from '../../context/LanguageContext';
import { FaFlagCheckered, FaRocket, FaChevronDown, FaChevronUp, FaRunning } from 'react-icons/fa';

interface GoalTimelineProps {
    milestones: Milestone[];
    startDate: string;
    deadline: string;
    onMilestoneClick: (milestone: Milestone) => void;
}

export function GoalTimeline({ milestones, startDate, deadline, onMilestoneClick }: GoalTimelineProps) {
    const { t, language } = useLanguage();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Sort milestones by target date
    const sortedMilestones = useMemo(() =>
        [...milestones].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()),
        [milestones]
    );

    const getDateFormat = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            if (language === 'ja') {
                return format(new Date(dateStr), 'yyyy年M月d日', { locale: ja });
            }
            return format(new Date(dateStr), 'MMM d, yyyy', { locale: enUS });
        } catch (e) {
            return dateStr;
        }
    };

    const toggleExpand = (id: string, ms: Milestone) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            // Also trigger the parent handler if needed, though for this UX we might just expand in place
            onMilestoneClick(ms);
        }
    };

    return (
        <div className="w-full glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-12">
                <h3 className="text-2xl font-bold font-outfit text-white mb-2">{t('dashboard.your_journey')}</h3>
                <p className="text-slate-400">
                    <span className="text-indigo-400 font-bold">{getDateFormat(startDate)}</span>
                    <span className="mx-2">→</span>
                    <span className="text-indigo-400 font-bold">{getDateFormat(deadline)}</span>
                </p>
            </div>

            <div className="relative max-w-3xl mx-auto pl-4 md:pl-0">
                {/* Central Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 md:-translate-x-1/2 rounded-full" />

                {/* Start Node */}
                <div className="relative mb-12 flex flex-col md:items-center">
                    <div className="absolute left-0 md:left-1/2 w-9 h-9 md:w-12 md:h-12 bg-indigo-600 rounded-full border-4 border-slate-900 shadow-[0_0_20px_rgba(79,70,229,0.5)] z-10 flex items-center justify-center md:-translate-x-1/2">
                        <FaRocket className="text-white text-sm md:text-lg" />
                    </div>
                    <div className="pl-12 md:pl-0 md:pt-16 text-center">
                        <div className="text-indigo-300 font-bold">START</div>
                        <div className="text-xs text-slate-500">{getDateFormat(startDate)}</div>
                    </div>
                </div>

                {/* Milestones */}
                <div className="space-y-8 md:space-y-0">
                    {sortedMilestones.map((milestone, index) => {
                        const isEven = index % 2 === 0;
                        const isExpanded = expandedId === milestone.id;
                        const isCompleted = milestone.status === 'completed';
                        const isMissed = milestone.status === 'missed';

                        return (
                            <motion.div
                                key={milestone.id}
                                className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Spacer for opposite side */}
                                <div className="hidden md:block flex-1" />

                                {/* Node Dot on Line */}
                                <div
                                    className={`
                                        absolute left-0 md:left-1/2 w-9 h-9 md:w-8 md:h-8 rounded-full border-4 border-slate-900 z-10 transition-colors duration-300 md:-translate-x-1/2 cursor-pointer
                                        ${isCompleted ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' :
                                            isMissed ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' :
                                                'bg-slate-700 hover:bg-white'}
                                    `}
                                    onClick={() => toggleExpand(milestone.id, milestone)}
                                >
                                    {/* Icon inside dot if completed/missed? */}
                                </div>

                                {/* Content Card */}
                                <div
                                    className={`
                                        flex-1 w-full pl-12 md:pl-0 
                                        ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}
                                    `}
                                >
                                    <div
                                        className={`
                                            group relative p-5 rounded-2xl border transition-all cursor-pointer
                                            ${isExpanded ? 'bg-white/10 border-indigo-500/50 shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                        `}
                                        onClick={() => toggleExpand(milestone.id, milestone)}
                                    >
                                        <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'}`}>
                                            <span className="text-xs font-mono text-slate-400 mb-1 block">
                                                {getDateFormat(milestone.targetDate)}
                                            </span>
                                            <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                                                {milestone.title}
                                            </h4>

                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                    ${milestone.difficulty === 'large' ? 'bg-purple-900/50 text-purple-300' :
                                                        milestone.difficulty === 'medium' ? 'bg-blue-900/50 text-blue-300' :
                                                            'bg-green-900/50 text-green-300'}
                                                `}>
                                                    {t(`timeline.difficulty.${milestone.difficulty}`)}
                                                </span>
                                                <span className={`text-xs ${isCompleted ? 'text-green-400' : isMissed ? 'text-red-400' : 'text-slate-500'}`}>
                                                    {isCompleted ? 'Completed' : isMissed ? 'Late' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expandable Details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className={`pt-4 mt-4 border-t border-white/10 text-sm text-slate-300 leading-relaxed ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                                                        <p>{milestone.description || "詳細なし"}</p>
                                                        {/* You could list sub-tasks here later */}
                                                        <div className="mt-4 p-3 bg-black/20 rounded-lg">
                                                            <div className="text-xs text-slate-500 mb-2">Action Items</div>
                                                            <div className="flex items-center gap-2 text-white/80">
                                                                <div className="w-4 h-4 rounded border border-slate-500" />
                                                                <span>Task breakdown...</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Expand Icon */}
                                        <div className={`absolute top-5 right-5 md:hidden text-slate-500`}>
                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Goal Node */}
                <div className="relative mt-12 flex flex-col md:items-center">
                    <div className="absolute left-0 md:left-1/2 w-9 h-9 md:w-12 md:h-12 bg-yellow-500 rounded-full border-4 border-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.6)] z-10 flex items-center justify-center md:-translate-x-1/2 animate-bounce">
                        <FaFlagCheckered className="text-white text-sm md:text-lg" />
                    </div>
                    <div className="pl-12 md:pl-0 md:pt-16 text-center">
                        <div className="text-yellow-400 font-bold text-xl">GOAL</div>
                        <div className="text-slate-300 font-bold mt-1">{getDateFormat(deadline)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper (no need to export if only used here, but keeping clean structure)
