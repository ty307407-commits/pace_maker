import { Goal, UserProfile, Milestone } from './types';

export const MOCK_USER: UserProfile = {
    name: "Taro",
    personalityType: "PROCRASTINATOR", // Matches the "summer homework last minute" example
    pacingMultiplier: 1.5, // Back-loaded effort
    notifications: {
        enabled: false,
        method: 'NONE',
        time: '09:00'
    },
    streak: 12,
    lastLoginDate: new Date().toISOString().split('T')[0]
};

export const MOCK_GOAL_ID = "goal-1";

// Helper to generate dates relative to today
const today = new Date();
const addDays = (days: number) => new Date(today.getTime() + days * 86400000).toISOString();

export const MOCK_MILESTONES: Milestone[] = [
    {
        id: "m-1",
        title: "Project Kickoff & Setup",
        description: "Initialize repo, set up database, basic planning.",
        targetDate: addDays(-5), // 5 days ago (Completed)
        completedDate: addDays(-4), // 1 day late
        status: 'completed',
        difficulty: 'small',
        progress: 100
    },
    {
        id: "m-2",
        title: "Core Feature: Backend API",
        description: "Implement all CRUD endpoints for managing tasks.",
        targetDate: addDays(2), // In 2 days (Pending)
        status: 'pending',
        difficulty: 'medium',
        progress: 40
    },
    {
        id: "m-3",
        title: "UI Implementation (Web)",
        description: "Complete the main dashboard and settings page.",
        targetDate: addDays(10),
        status: 'pending',
        difficulty: 'large',
        progress: 0
    },
    {
        id: "m-4",
        title: "Beta Testing",
        description: "Release to internal team for bug hunting.",
        targetDate: addDays(20),
        status: 'pending',
        difficulty: 'medium',
        progress: 0
    },
    {
        id: "m-5",
        title: "Official Release",
        description: "Deploy to production store.",
        targetDate: addDays(30),
        status: 'pending',
        difficulty: 'large',
        progress: 0
    }
];

export const MOCK_GOAL: Goal = {
    id: MOCK_GOAL_ID,
    title: "Launch 'PaceMaker' MVP",
    category: "WORK",
    description: "Build and release the initial version of the adaptive goal tracking app.",
    startDate: addDays(-10),
    deadline: addDays(30),
    milestones: MOCK_MILESTONES,
    progress: 25, // Overall progress
    color: "hsl(250, 80%, 60%)"
};
