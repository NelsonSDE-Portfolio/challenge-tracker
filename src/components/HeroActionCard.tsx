import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { workoutService } from '../services/workoutService';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from '../constants';
import type { MyStats, WeeklyProgress } from '../types/stats';

interface HeroActionCardProps {
  challengeId: string;
  myStats: MyStats;
  minWorkoutsPerWeek: number;
  weeklyProgress: WeeklyProgress;
  onWorkoutLogged: () => void;
}

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function HeroActionCard({
  challengeId,
  myStats,
  minWorkoutsPerWeek,
  weeklyProgress,
  onWorkoutLogged,
}: HeroActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(getLocalDateString());
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getLocalDateString();
  const hasLoggedToday = weeklyProgress.participants.some(p =>
    p.workoutDates.includes(todayStr)
  );

  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`Image must be less than ${MAX_FILE_SIZE_LABEL}`);
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setUploadProgress(10);

    try {
      let photoUrl: string | undefined;

      if (photo) {
        const { uploadUrl, key } = await workoutService.getPresignedUrl(challengeId, photo.type);
        setUploadProgress(30);
        await workoutService.uploadPhoto(uploadUrl, photo);
        setUploadProgress(70);
        photoUrl = key;  // Send the S3 key as photoUrl - backend will sign it on read
      } else {
        setUploadProgress(50);
      }

      await workoutService.create(challengeId, {
        date,
        photoUrl,
        note: note || undefined,
      });
      setUploadProgress(100);

      setExpanded(false);
      setPhoto(null);
      setPhotoPreview(null);
      setNote('');
      setDate(getLocalDateString());
      onWorkoutLogged();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to log workout');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setExpanded(false);
    setPhoto(null);
    setPhotoPreview(null);
    setNote('');
    setDate(getLocalDateString());
    setError(null);
  };

  // Already logged today - show success state
  if (hasLoggedToday && !expanded) {
    return (
      <div className="glass rounded-2xl p-6 gradient-border glow-accent fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold gradient-text-primary">You crushed it today!</h3>
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {myStats.weeklyWorkouts}/{minWorkoutsPerWeek} workouts this week
                {daysLeft > 0 && ` · ${daysLeft} days left`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            Log Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl overflow-hidden gradient-border transition-all duration-300 fade-in-up ${!expanded && !hasLoggedToday ? 'animate-pulse-glow' : ''}`}>
      {/* Collapsed State - Big Log Button */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full p-6 text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon with animated gradient */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center animate-gradient"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  Log Today's Workout
                </h3>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {myStats.weeklyWorkouts}/{minWorkoutsPerWeek} workouts this week · {daysLeft} days left
                </p>
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xl transition-transform group-hover:rotate-45"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
            >
              +
            </div>
          </div>
        </button>
      )}

      {/* Expanded State - Inline Form */}
      {expanded && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: 'hsl(var(--foreground))' }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Log Workout
            </h3>
            <button
              onClick={resetForm}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-4 rounded-xl text-sm"
                style={{
                  background: 'hsl(var(--destructive) / 0.1)',
                  border: '1px solid hsl(var(--destructive) / 0.3)',
                  color: 'hsl(var(--destructive))',
                }}
              >
                {error}
              </div>
            )}

            {/* Date & Photo buttons */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={getLocalDateString()}
                  className="w-full px-4 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    border: 'none',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Photo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors hover:opacity-80"
                  style={{
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  {photo ? 'Change' : 'Photo'}
                </button>
              </div>
            </div>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)' }}
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How was your workout?"
                rows={2}
                className="w-full px-4 py-3 rounded-lg text-sm resize-none transition-all focus:outline-none focus:ring-2"
                style={{
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--foreground))',
                  border: 'none',
                }}
              />
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    background: 'var(--gradient-primary)',
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] animate-gradient flex items-center justify-center gap-2"
              style={{
                background: 'var(--gradient-primary)',
                backgroundSize: '200% 200%',
                color: 'white',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Log Workout'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
