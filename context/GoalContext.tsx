'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Goal, Milestone, UserProfile } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { differenceInCalendarDays, format } from 'date-fns';

interface GoalContextProps {
    goal: Goal | null;
    userProfile: UserProfile | null;
    setGoal: (goal: Goal) => Promise<void>;
    setUserProfile: (profile: UserProfile) => Promise<void>;
    isLoading: boolean;
}

const GoalContext = createContext<GoalContextProps | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [goal, setGoalState] = useState<Goal | null>(null);
    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load profile and goal from Supabase when user is authenticated
    useEffect(() => {
        if (!user) {
            setGoalState(null);
            setUserProfileState(null);
            setIsLoading(false);
            return;
        }

        loadUserData();
    }, [user]);

    const loadUserData = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            console.log('🔄 Loading user data for:', user.id);

            // 1. Load profile (using limit(1) instead of single to prevent errors)
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .limit(1);

            if (profileError) {
                console.error('❌ Error loading profile:', profileError);
            }

            let profile = null;
            if (profiles && profiles.length > 0) {
                profile = profiles[0];
                console.log('✅ Profile found:', profile);
            } else {
                console.log('⚠️ No profile found for user:', user.id);
            }

            if (profile) {
                // Update streak logic
                const today = format(new Date(), 'yyyy-MM-dd');
                let updatedProfile = { ...profile };

                if (profile.last_login_date !== today) {
                    const lastLogin = profile.last_login_date ? new Date(profile.last_login_date) : new Date();
                    const diff = differenceInCalendarDays(new Date(), lastLogin);

                    if (diff === 1) {
                        updatedProfile.streak = (profile.streak || 0) + 1;
                    } else if (diff > 1) {
                        updatedProfile.streak = 1;
                    }
                    if (!profile.streak) updatedProfile.streak = 1;

                    updatedProfile.last_login_date = today;

                    // Update in database silently
                    await supabase
                        .from('profiles')
                        .update({
                            streak: updatedProfile.streak,
                            last_login_date: updatedProfile.last_login_date
                        })
                        .eq('id', user.id);
                }

                setUserProfileState({
                    name: updatedProfile.name,
                    personalityType: updatedProfile.personality_type,
                    pacingMultiplier: updatedProfile.pacing_multiplier,
                    notifications: updatedProfile.notifications,
                    streak: updatedProfile.streak,
                    lastLoginDate: updatedProfile.last_login_date
                });
            } else {
                setUserProfileState(null);
            }

            // 2. Load goal
            const { data: goals, error: goalError } = await supabase
                .from('goals')
                .select(`
                    *,
                    milestones (*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (goalError) {
                console.error('❌ Error loading goal:', goalError);
            }

            if (goals && goals.length > 0) {
                const goalData = goals[0];
                console.log('✅ Goal found:', goalData);

                setGoalState({
                    id: goalData.id,
                    title: goalData.title,
                    category: goalData.category,
                    description: goalData.description,
                    startDate: goalData.start_date,
                    deadline: goalData.deadline,
                    progress: goalData.progress,
                    color: goalData.color,
                    milestones: (goalData.milestones || []).map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        description: m.description,
                        targetDate: m.target_date,
                        completedDate: m.completed_date,
                        status: m.status,
                        difficulty: m.difficulty,
                        progress: m.progress
                    })).sort((a: any, b: any) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                });
            } else {
                console.log('⚠️ No goals found');
                setGoalState(null);
            }

        } catch (error) {
            console.error('🔥 Critical Error in loadUserData:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setGoal = async (newGoal: Goal) => {
        if (!user) return;

        try {
            // Insert or update goal (let database generate UUID if id is not valid UUID)
            const goalPayload: any = {
                user_id: user.id,
                title: newGoal.title,
                category: newGoal.category,
                description: newGoal.description,
                start_date: newGoal.startDate,
                deadline: newGoal.deadline,
                progress: newGoal.progress,
                color: newGoal.color
            };

            // Check if this is an update (valid UUID) or new goal
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newGoal.id);

            let actualGoalId = newGoal.id;

            if (isValidUUID) {
                // Update existing goal
                goalPayload.id = newGoal.id;
                const { data: goalData, error: goalError } = await supabase
                    .from('goals')
                    .upsert(goalPayload)
                    .select()
                    .single();

                if (goalError) {
                    console.error('Supabase goal error details:', goalError);
                    throw new Error(`Failed to save goal: ${goalError.message}`);
                }
                actualGoalId = goalData.id;
            } else {
                // Insert new goal (database will generate UUID)
                const { data: goalData, error: goalError } = await supabase
                    .from('goals')
                    .insert(goalPayload)
                    .select()
                    .single();

                if (goalError) {
                    console.error('Supabase goal error details:', goalError);
                    throw new Error(`Failed to save goal: ${goalError.message}`);
                }
                actualGoalId = goalData.id;
            }

            // Delete existing milestones and insert new ones
            await supabase.from('milestones').delete().eq('goal_id', actualGoalId);

            if (newGoal.milestones.length > 0) {
                const { error: milestonesError } = await supabase
                    .from('milestones')
                    .insert(
                        newGoal.milestones.map(m => ({
                            goal_id: actualGoalId,
                            title: m.title,
                            description: m.description,
                            target_date: m.targetDate,
                            completed_date: m.completedDate,
                            status: m.status,
                            difficulty: m.difficulty,
                            progress: m.progress
                        }))
                    );

                if (milestonesError) {
                    console.error('Supabase milestones error details:', milestonesError);
                    throw new Error(`Failed to save milestones: ${milestonesError.message}`);
                }
            }

            // Update local state with actual ID from database
            setGoalState({ ...newGoal, id: actualGoalId });
        } catch (error: any) {
            console.error('Error saving goal:', error);
            throw error;
        }
    };

    const setUserProfile = async (profile: UserProfile) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    name: profile.name,
                    personality_type: profile.personalityType,
                    pacing_multiplier: profile.pacingMultiplier,
                    notifications: profile.notifications,
                    streak: profile.streak,
                    last_login_date: profile.lastLoginDate
                });

            if (error) throw error;

            setUserProfileState(profile);
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    };

    return (
        <GoalContext.Provider value={{ goal, userProfile, setGoal, setUserProfile, isLoading }}>
            {children}
        </GoalContext.Provider>
    );
}

export function useGoal() {
    const context = useContext(GoalContext);
    if (context === undefined) {
        throw new Error('useGoal must be used within a GoalProvider');
    }
    return context;
}
