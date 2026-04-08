import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { BackToPortfolioButton } from '../components/BackToPortfolioButton';

// After sign-in/sign-up, redirect back to the current page
const getRedirectUrl = () => window.location.href;

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Group Accountability',
    description: 'Challenge your friends and hold each other accountable. Track progress together and stay motivated.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Financial Stakes',
    description: 'Put money on the line. Miss your workout? Pay the penalty. Hit your goals? Split the pot.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Track Progress',
    description: 'Log workouts, view leaderboards, and watch your consistency grow week over week.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Stay Motivated',
    description: 'Streaks, achievements, and friendly competition keep you coming back day after day.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Create a Challenge',
    description: 'Set the rules: workouts per week, penalty amount, and duration.',
  },
  {
    number: '2',
    title: 'Invite Friends',
    description: 'Share your invite code and get your accountability partners on board.',
  },
  {
    number: '3',
    title: 'Log Workouts',
    description: 'Track your sessions and watch your progress on the leaderboard.',
  },
  {
    number: '4',
    title: 'Settle Up',
    description: 'At the end, those who missed pay up. Winners take all!',
  },
];

export function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
    >
      <BackToPortfolioButton />

      {/* Ambient background glows */}
      <div
        className="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'hsl(186 100% 50%)', opacity: 0.15 }}
      />
      <div
        className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'hsl(270 60% 55%)', opacity: 0.1 }}
      />

      {/* Hero Section */}
      <header className="relative">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <span className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Challenge Tracker
              </span>
            </div>
            <div className="flex items-center gap-4">
              <SignInButton mode="modal" forceRedirectUrl={getRedirectUrl()}>
                <button
                  className="px-4 py-2 text-sm font-medium rounded-lg transition"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={getRedirectUrl()}>
                <button
                  className="px-4 py-2 text-sm font-bold rounded-lg transition hover:opacity-90"
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}
                >
                  Sign Up Free
                </button>
              </SignUpButton>
            </div>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                background: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
                border: '1px solid hsl(var(--primary) / 0.2)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Accountability meets competition
            </div>

            <h1
              className="text-5xl md:text-6xl font-black mb-6 leading-tight"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Turn Fitness Goals Into
              <span
                className="block"
                style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Friendly Competition
              </span>
            </h1>

            <p
              className="text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Challenge your friends to workout consistently. Miss a session? Pay the price.
              Stay accountable with financial stakes and friendly competition.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <SignUpButton mode="modal" forceRedirectUrl={getRedirectUrl()}>
                <button
                  className="px-8 py-4 text-lg font-bold rounded-xl transition hover:scale-105 hover:shadow-lg"
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}
                >
                  Start a Challenge
                </button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl={getRedirectUrl()}>
                <button
                  className="px-8 py-4 text-lg font-medium rounded-xl transition hover:scale-105"
                  style={{
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  I Have an Invite
                </button>
              </SignInButton>
            </div>

            {/* Hero Stats */}
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  100%
                </p>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Free to use
                </p>
              </div>
              <div
                className="w-px h-12"
                style={{ background: 'hsl(var(--border))' }}
              />
              <div>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  4+
                </p>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Friends per challenge
                </p>
              </div>
              <div
                className="w-px h-12"
                style={{ background: 'hsl(var(--border))' }}
              />
              <div>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  3x
                </p>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  More consistent
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Everything You Need to Stay Accountable
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Built for groups who are serious about their fitness goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 transition hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="relative py-20"
        style={{ background: 'hsl(var(--muted) / 0.3)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              How It Works
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Get started in minutes, stay accountable for weeks
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}
                >
                  {step.number}
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {step.title}
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Ready to Get Accountable?
          </h2>
          <p
            className="text-lg mb-8 max-w-2xl mx-auto"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Join Challenge Tracker today and start your journey towards consistent fitness habits.
          </p>
          <SignUpButton mode="modal" forceRedirectUrl={getRedirectUrl()}>
            <button
              className="px-8 py-4 text-lg font-bold rounded-xl transition hover:scale-105 hover:shadow-lg"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              Create Your First Challenge
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8"
        style={{ borderTop: '1px solid hsl(var(--border))' }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            Built with React, NestJS, and MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}
