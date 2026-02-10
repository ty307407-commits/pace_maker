'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoal } from '../../context/GoalContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheck, FaArrowLeft, FaMapMarkedAlt, FaTrash } from 'react-icons/fa';
import { format, addDays } from 'date-fns';
import { GoalCategory } from '../../lib/types';
import { GoalTimeline } from '../../components/ui/GoalTimeline';

export default function CreateGoalPage() {
    const router = useRouter();
    const { setGoal, isLoading } = useGoal();
    const { t, language } = useLanguage();
    const [saveLoading, setSaveLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<GoalCategory>('WORK');

    // Dates
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [deadline, setDeadline] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));

    // Milestones
    const [milestones, setMilestones] = useState<{ id: string, title: string, date: string, difficulty: 'micro' | 'small' | 'medium' | 'large', status: 'pending' | 'completed' | 'missed' | 'adjusted', targetDate: string, description?: string, progress: number }[]>([]);

    // Milestone Input State
    const [msTitle, setMsTitle] = useState('');
    const [msDesc, setMsDesc] = useState('');
    const [msDate, setMsDate] = useState('');
    const [msDiff, setMsDiff] = useState<'micro' | 'small' | 'medium' | 'large'>('medium');

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-white font-outfit">Loading...</div>;
    }

    const addMilestone = () => {
        if (!msTitle || !msDate) return;
        const newMs = {
            id: `temp-${Date.now()}`,
            title: msTitle,
            date: msDate,
            targetDate: new Date(msDate).toISOString(),
            difficulty: msDiff,
            status: 'pending' as const,
            progress: 0,
            description: msDesc
        };
        setMilestones([...milestones, newMs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setMsTitle('');
        setMsDesc('');
        setMsDate('');
        setMsDiff('medium');
    };

    const removeMilestone = (id: string) => {
        if (confirm(t('create.delete_confirm'))) {
            setMilestones(milestones.filter(m => m.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveLoading(true);

        const newGoalId = `goal-${Date.now()}`;
        const newGoal: any = {
            id: newGoalId,
            title,
            category,
            description,
            startDate: new Date(startDate).toISOString(),
            deadline: new Date(deadline).toISOString(),
            milestones: milestones.map((ms, index) => ({
                ...ms,
                id: `ms-${newGoalId}-${index}`,
            })),
            progress: 0,
            color: category === 'WORK' ? "hsl(220, 80%, 60%)" :
                category === 'STUDY' ? "hsl(280, 70%, 60%)" :
                    category === 'HEALTH' ? "hsl(140, 70%, 50%)" : "hsl(250, 80%, 60%)"
        };

        try {
            await setGoal(newGoal);
            router.push('/');
        } catch (error) {
            console.error('Failed to save goal:', error);
            alert('Failed to save goal. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0C15] text-white overflow-y-auto">

            <div className="max-w-5xl mx-auto p-4 md:p-12">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                        <FaArrowLeft className="text-slate-400" />
                    </button>
                    <h1 className="text-3xl font-bold font-outfit">{t('create.title')}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Section 1: Core Info - Centered Table Layout */}
                    {/* Background panel for the table */}
                    <div className="bg-[#12121A] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">

                        <div className="flex flex-col">

                            {/* Row 1: Title */}
                            <div className="flex flex-col md:flex-row min-h-[5rem] border-b border-white/5">
                                <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                    <label className="text-base font-bold text-slate-300 w-full text-left">
                                        {t('create.goal_title')}
                                    </label>
                                </div>
                                <div className="flex-1 flex items-center p-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-lg placeholder-slate-600"
                                        placeholder="Enter title..."
                                    />
                                </div>
                            </div>

                            {/* Row 2: Description */}
                            <div className="flex flex-col md:flex-row min-h-[5rem] border-b border-white/5">
                                <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                    <label className="text-base font-bold text-slate-300 w-full text-left">
                                        {t('create.desc')}
                                    </label>
                                </div>
                                <div className="flex-1 flex items-center p-4">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base resize-none placeholder-slate-600"
                                        placeholder="What is this goal about?"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Category */}
                            <div className="flex flex-col md:flex-row min-h-[5rem] border-b border-white/5">
                                <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                    <label className="text-base font-bold text-slate-300 w-full text-left">
                                        {t('create.category')}
                                    </label>
                                </div>
                                <div className="flex-1 flex items-center p-4">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as GoalCategory)}
                                        className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base appearance-none cursor-pointer"
                                    >
                                        <option value="WORK" className="bg-[#12121A]">{t('create.categories.work')}</option>
                                        <option value="STUDY" className="bg-[#12121A]">{t('create.categories.study')}</option>
                                        <option value="HOBBY" className="bg-[#12121A]">{t('create.categories.hobby')}</option>
                                        <option value="HEALTH" className="bg-[#12121A]">{t('create.categories.health')}</option>
                                        <option value="FINANCE" className="bg-[#12121A]">{t('create.categories.finance')}</option>
                                        <option value="OTHER" className="bg-[#12121A]">{t('create.categories.other')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 4: Start Date */}
                            <div className="flex flex-col md:flex-row min-h-[5rem] border-b border-white/5">
                                <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                    <label className="text-base font-bold text-slate-300 w-full text-left">
                                        {t('create.start_date')}
                                    </label>
                                </div>
                                <div className="flex-1 flex items-center p-4">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base"
                                    />
                                </div>
                            </div>

                            {/* Row 5: End Date */}
                            <div className="flex flex-col md:flex-row min-h-[5rem]">
                                <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                    <label className="text-base font-bold text-slate-300 w-full text-left">
                                        {t('create.end_date')}
                                    </label>
                                </div>
                                <div className="flex-1 flex items-center p-4">
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>


                    {/* Section 2: Milestones - Centered below */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                            {t('create.milestones')}
                        </h3>

                        <div className="bg-[#12121A] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                            <div className="flex flex-col">
                                {/* Row 1: Milestone Title */}
                                <div className="flex flex-col md:flex-row min-h-[5rem] border-b border-white/5">
                                    <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                        <label className="text-base font-bold text-slate-300 w-full text-left">
                                            {t('create.ms_title')}
                                        </label>
                                    </div>
                                    <div className="flex-1 flex items-center p-4">
                                        <input
                                            type="text"
                                            value={msTitle}
                                            onChange={(e) => setMsTitle(e.target.value)}
                                            className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base placeholder-slate-600"
                                            placeholder="Milestone title..."
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Date */}
                                <div className="flex flex-col md:flex-row min-h-[5rem] border-b border-white/5">
                                    <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                        <label className="text-base font-bold text-slate-300 w-full text-left">
                                            {t('create.ms_date')}
                                        </label>
                                    </div>
                                    <div className="flex-1 flex items-center p-4">
                                        <input
                                            type="date"
                                            value={msDate}
                                            onChange={(e) => setMsDate(e.target.value)}
                                            className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Difficulty */}
                                <div className="flex flex-col md:flex-row min-h-[5rem] border-b border-white/5">
                                    <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                        <label className="text-base font-bold text-slate-300 w-full text-left">
                                            {t('create.ms_difficulty')}
                                        </label>
                                    </div>
                                    <div className="flex-1 flex items-center p-4">
                                        <select
                                            value={msDiff}
                                            onChange={(e: any) => setMsDiff(e.target.value)}
                                            className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base appearance-none cursor-pointer"
                                        >
                                            <option value="micro" className="bg-[#12121A]">{t('create.difficulty_opts.micro')}</option>
                                            <option value="small" className="bg-[#12121A]">{t('create.difficulty_opts.small')}</option>
                                            <option value="medium" className="bg-[#12121A]">{t('create.difficulty_opts.medium')}</option>
                                            <option value="large" className="bg-[#12121A]">{t('create.difficulty_opts.large')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 4: Description */}
                                <div className="flex flex-col md:flex-row min-h-[5rem]">
                                    <div className="w-full md:w-64 flex items-center p-6 bg-white/5 md:border-r border-white/5">
                                        <label className="text-base font-bold text-slate-300 w-full text-left">
                                            {t('create.ms_desc')}
                                        </label>
                                    </div>
                                    <div className="flex-1 flex items-center p-4">
                                        <textarea
                                            value={msDesc}
                                            onChange={(e) => setMsDesc(e.target.value)}
                                            rows={2}
                                            className="w-full bg-transparent px-2 py-1 text-white focus:outline-none text-base resize-none placeholder-slate-600"
                                            placeholder="Details..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end p-4">
                                <button
                                    type="button"
                                    onClick={addMilestone}
                                    disabled={!msTitle || !msDate}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaPlus /> {t('create.add_milestone')}
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Section 3: Timeline Preview - Bottom, Full Width */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                            {t('create.roadmap')}
                        </h3>
                        <div className="bg-[#12121A] rounded-3xl border border-white/5 overflow-hidden">
                            {milestones.length > 0 ? (
                                <div className="p-8">
                                    <GoalTimeline
                                        milestones={milestones}
                                        startDate={startDate}
                                        deadline={deadline}
                                        onMilestoneClick={(ms) => removeMilestone(ms.id)}
                                    />
                                </div>
                            ) : (
                                <div className="p-16 text-center border-2 border-dashed border-white/5 m-8 rounded-2xl">
                                    <FaMapMarkedAlt className="text-slate-600 text-3xl mx-auto mb-4" />
                                    <p className="text-slate-500">{t('create.no_milestones')}</p>
                                    <p className="text-slate-600 text-sm mt-2">{t('create.preview_instruction')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-8 pb-20">
                        <button
                            type="submit"
                            disabled={saveLoading}
                            className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-xl font-bold rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveLoading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                    {language === 'ja' ? '保存中...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <FaCheck /> {t('create.create_btn')}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
