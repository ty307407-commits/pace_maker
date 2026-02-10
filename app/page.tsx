'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoalTimeline } from '../components/ui/GoalTimeline';
import { AdjustmentModal } from '../components/ui/AdjustmentModal';
import { Milestone } from '../lib/types';
import { differenceInDays, addDays, format } from 'date-fns';
import { FaFire, FaCalendarCheck, FaChartLine, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useGoal } from '../context/GoalContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { goal, setGoal, userProfile, isLoading } = useGoal();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Wait for both auth and goal loading to complete
    if (authLoading || isLoading) return;

    if (!goal) {
      // If no goal, redirect to setup or create
      // If no user profile either, go to setup. If user profile exists but no goal, go to create-goal.
      if (!userProfile) {
        router.push('/setup');
      } else {
        router.push('/create-goal');
      }
    }
  }, [goal, userProfile, isLoading, authLoading, router]);

  if (isLoading || !goal || !userProfile) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading your journey...</div>;
  }

  const handleMilestoneClick = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleComplete = () => {
    if (!selectedMilestone) return;

    const updatedMilestones = goal.milestones.map(m =>
      m.id === selectedMilestone.id ? { ...m, status: 'completed', completedDate: new Date().toISOString(), progress: 100 } : m
    );

    // Update overall progress
    const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    setGoal({ ...goal, milestones: updatedMilestones as Milestone[], progress: newProgress });
    setIsModalOpen(false);
  };

  const handleAdjust = (type: 'extend' | 'squeeze') => {
    if (!selectedMilestone) return;

    let updatedMilestones = [...goal.milestones];
    const currentIndex = updatedMilestones.findIndex(m => m.id === selectedMilestone.id);

    // Simple logic for prototype:
    if (type === 'extend') {
      // Shift all subsequent milestones by 5 days (hardcoded example)
      for (let i = currentIndex; i < updatedMilestones.length; i++) {
        const currentTarget = new Date(updatedMilestones[i].targetDate);
        updatedMilestones[i] = {
          ...updatedMilestones[i],
          targetDate: addDays(currentTarget, 5).toISOString(),
          status: i === currentIndex ? 'pending' : updatedMilestones[i].status // Reset current to pending if it was missed
        };
      }
      // Also extend final deadline
      const newDeadline = addDays(new Date(goal.deadline), 5).toISOString();
      setGoal({ ...goal, milestones: updatedMilestones, deadline: newDeadline });
    } else {
      // Squeeze
      updatedMilestones[currentIndex] = {
        ...updatedMilestones[currentIndex],
        difficulty: 'large',
        description: (selectedMilestone.description || '') + (language === 'ja' ? " 【強化】スケジュール圧縮！" : " (INTENSIFIED: Schedule compressed!)")
      };
      setGoal({ ...goal, milestones: updatedMilestones });
    }

    setIsModalOpen(false);
  };

  const getCategoryBadge = (cat?: string) => {
    if (!cat) return null;
    const colors: Record<string, string> = {
      'WORK': 'bg-blue-500/20 text-blue-400',
      'STUDY': 'bg-purple-500/20 text-purple-400',
      'HOBBY': 'bg-pink-500/20 text-pink-400',
      'HEALTH': 'bg-green-500/20 text-green-400',
      'FINANCE': 'bg-yellow-500/20 text-yellow-400',
      'OTHER': 'bg-slate-500/20 text-slate-400'
    };
    const labelKey = `create.categories.${cat.toLowerCase()}`;
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${colors[cat] || colors['OTHER']}`}>
        {t(labelKey)}
      </span>
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header Section */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {t('app.title')}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            {t('app.welcome')}<span className="text-white font-semibold">{userProfile.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
            className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors"
          >
            <FaGlobe className="text-slate-400" />
            <span className="text-sm font-bold text-white">{language === 'en' ? 'English' : '日本語'}</span>
          </button>

          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
              <FaFire />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t('app.streak')}</div>
              <div className="text-lg font-bold text-white">{userProfile.streak || 0} {t('app.days')}</div>
            </div>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <FaChartLine />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t('app.pace')}</div>
              <div className="text-lg font-bold text-white">{t('app.pace_on_track')}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Stats & Goal Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FaCalendarCheck size={80} />
            </div>

            <div className="mb-4">
              {goal.category && getCategoryBadge(goal.category)}
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{goal.title}</h2>
            <p className="text-slate-400 text-sm mb-6">{goal.description}</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">{t('dashboard.total_progress')}</span>
                  <span className="text-white font-mono">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.deadline')}</div>
                  <div className="text-sm font-semibold text-white">
                    {format(new Date(goal.deadline), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.days_left')}</div>
                  <div className="text-sm font-semibold text-white">
                    {differenceInDays(new Date(goal.deadline), new Date())} {t('app.days')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.daily_focus')}</h3>
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-indigo-300 uppercase">{t('dashboard.todays_micro_goal')}</span>
              </div>
              <p className="text-white font-medium">
                {goal.milestones.find(m => m.status === 'pending')?.title || "All caught up!"}
              </p>
              <button
                onClick={() => {
                  const current = goal.milestones.find(m => m.status === 'pending');
                  if (current) handleMilestoneClick(current);
                }}
                className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('dashboard.mark_complete')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline (Spans 2 cols on Large screens) */}
        <div className="lg:col-span-2">
          <GoalTimeline
            milestones={goal.milestones}
            startDate={goal.startDate}
            deadline={goal.deadline}
            onMilestoneClick={handleMilestoneClick}
          />
        </div>
      </div>

      {/* Modal */}
      {selectedMilestone && (
        <AdjustmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          milestone={selectedMilestone}
          onComplete={handleComplete}
          onAdjust={handleAdjust}
        />
      )}
    </main>
  );
}
