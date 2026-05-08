import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeroActionCard } from './HeroActionCard';
import type { MyStats } from '../types/stats';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('../services/workoutService', () => ({
  workoutService: {
    create: vi.fn(),
    getPresignedUrl: vi.fn(),
    uploadPhoto: vi.fn(),
    share: vi.fn(),
  },
}));

const baseStats: MyStats = {
  totalWorkouts: 5,
  weeklyWorkouts: 2,
  currentStreak: 3,
  debt: 0,
  loggedToday: false,
};

describe('HeroActionCard', () => {
  it('shows "Log Today\'s Workout" CTA when current user has not logged today', () => {
    render(
      <HeroActionCard
        challengeId="c1"
        myStats={{ ...baseStats, loggedToday: false }}
        minWorkoutsPerWeek={3}
        onWorkoutLogged={() => {}}
      />,
    );

    expect(screen.getByText("Log Today's Workout")).toBeInTheDocument();
    expect(screen.queryByText('You crushed it today!')).toBeNull();
  });

  it('shows "You crushed it today!" success state when current user has logged today', () => {
    render(
      <HeroActionCard
        challengeId="c1"
        myStats={{ ...baseStats, loggedToday: true }}
        minWorkoutsPerWeek={3}
        onWorkoutLogged={() => {}}
      />,
    );

    expect(screen.getByText('You crushed it today!')).toBeInTheDocument();
    expect(screen.queryByText("Log Today's Workout")).toBeNull();
  });
});
