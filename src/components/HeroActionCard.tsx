import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { workoutService } from '../services/workoutService';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL, ACTIVITY_TYPES, MUSCLE_GROUPS, getMetadataFields } from '../constants';
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
  const [activityType, setActivityType] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, number>>({});
  const [customActivity, setCustomActivity] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [lastWorkoutId, setLastWorkoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
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

  // Close modal on Escape key
  useEffect(() => {
    if (!expanded) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        if (showSuccess) handleCloseSuccess();
        else resetForm();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [expanded, loading, showSuccess]);

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
        const { uploadUrl, fileUrl } = await workoutService.getPresignedUrl(challengeId, photo.type);
        setUploadProgress(30);
        await workoutService.uploadPhoto(uploadUrl, photo);
        setUploadProgress(70);
        photoUrl = fileUrl;
      } else {
        setUploadProgress(50);
      }

      const fullMetadata: Record<string, unknown> = { ...metadata };
      if (muscleGroups.length > 0) {
        fullMetadata.muscleGroups = muscleGroups;
      }

      const createdWorkout = await workoutService.create(challengeId, {
        date,
        photoUrl,
        note: activityType === 'other' ? customActivity || note : note || undefined,
        activityType: activityType || undefined,
        metadata: Object.keys(fullMetadata).length > 0 ? fullMetadata as Record<string, number> : undefined,
      });
      setLastWorkoutId(createdWorkout._id);
      setUploadProgress(100);

      // Show success state with confetti
      setShowSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF6B35', '#1DB954', '#FF3B30', '#00C49A'],
      });
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
    setActivityType('');
    setMetadata({});
    setCustomActivity('');
    setDate(getLocalDateString());
    setError(null);
  };

  const [shareLoading, setShareLoading] = useState(false);

  const handleShare = async () => {
    if (!lastWorkoutId) return;
    setShareLoading(true);

    const weeklyCount = myStats.weeklyWorkouts + 1;
    const weeklyGoal = minWorkoutsPerWeek;

    try {
      const { shareToken } = await workoutService.share(challengeId, lastWorkoutId);
      const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL || window.location.origin;
      const shareUrl = `${portfolioUrl}/projects/challenge-tracker/share/${shareToken}`;
      const message = `Go check my workout, ${weeklyCount}/${weeklyGoal} ${shareUrl}`;

      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch {
      const message = `Go check my workout, ${weeklyCount}/${weeklyGoal}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setExpanded(false);

    setPhoto(null);
    setPhotoPreview(null);
    setNote('');
    setActivityType('');
    setMetadata({});
    setCustomActivity('');
    setMuscleGroups([]);
    setDate(getLocalDateString());
    onWorkoutLogged();
  };

  // Already logged today - show success state
  if (hasLoggedToday && !expanded) {
    return (
      <div className="glass rounded-2xl p-6 gradient-border glow-accent fade-in-up">
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
      </div>
    );
  }

  return (
    <>
      <div className={`glass rounded-2xl overflow-hidden gradient-border transition-all duration-300 fade-in-up ${!hasLoggedToday ? 'animate-pulse-glow' : ''}`}>
        {/* Collapsed State - Big Log Button */}
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
      </div>

      {/* Modal Overlay */}
      {expanded && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}
          onClick={() => {
            if (loading) return;
            if (showSuccess) { handleCloseSuccess(); return; }
            resetForm();
          }}
        >
          <div
            className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 fade-in-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold gradient-text-primary mb-1">Workout logged!</h3>
                <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {ACTIVITY_TYPES.find((a) => a.value === activityType)
                    ? `${ACTIVITY_TYPES.find((a) => a.value === activityType)!.icon} ${ACTIVITY_TYPES.find((a) => a.value === activityType)!.label}`
                    : 'Great job showing up!'}
                  {metadata.durationMinutes ? ` · ${metadata.durationMinutes} min` : ''}
                  {metadata.distanceKm ? ` · ${metadata.distanceKm} km` : ''}
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleShare}
                    disabled={shareLoading}
                    className="btn-press flex-1 px-4 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: '#25D366',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {shareLoading ? 'Sharing...' : 'Share on WhatsApp'}
                  </button>
                  <button
                    onClick={handleCloseSuccess}
                    className="btn-press px-4 py-3 text-sm font-medium"
                    style={{
                      background: 'hsl(var(--muted))',
                      color: 'hsl(var(--muted-foreground))',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                    Log Workout — {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </h3>
                  <button
                    onClick={resetForm}
                    aria-label="Close workout form"
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

                  {/* Activity Type Selector */}
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      What did you do?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ACTIVITY_TYPES.map((activity) => (
                        <button
                          key={activity.value}
                          type="button"
                          className="btn-press flex flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium transition-all duration-200 hover:scale-105"
                          style={{
                            background: activityType === activity.value ? 'var(--gradient-primary)' : 'hsl(var(--muted))',
                            color: activityType === activity.value ? 'white' : 'hsl(var(--muted-foreground))',
                            borderRadius: 'var(--radius)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setActivityType(activityType === activity.value ? '' : activity.value);
                            setMetadata({});
                          }}
                        >
                          <span className="text-lg leading-none">{activity.icon}</span>
                          <span className="leading-tight text-center" style={{ fontSize: '0.65rem' }}>{activity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Activity Name (when "Other" is selected) */}
                  {activityType === 'other' && (
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Activity Name
                      </label>
                      <input
                        type="text"
                        value={customActivity}
                        onChange={(e) => setCustomActivity(e.target.value)}
                        placeholder="What activity did you do?"
                        className="w-full px-4 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                        style={{
                          background: 'hsl(var(--muted))',
                          color: 'hsl(var(--foreground))',
                          border: 'none',
                        }}
                      />
                    </div>
                  )}

                  {/* Details section */}
                  <div className="space-y-4">
                      {/* Metadata Fields */}
                      {activityType && (
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            Details (optional)
                          </label>
                          <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(getMetadataFields(activityType).length, 3)}, 1fr)` }}>
                            {getMetadataFields(activityType).map((field) => (
                              <div key={field.key} className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={metadata[field.key] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMetadata((prev) => {
                                      if (val === '') {
                                        const next = { ...prev };
                                        delete next[field.key];
                                        return next;
                                      }
                                      return { ...prev, [field.key]: parseFloat(val) };
                                    });
                                  }}
                                  placeholder={field.label}
                                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                                  style={{
                                    background: 'hsl(var(--muted))',
                                    color: 'hsl(var(--foreground))',
                                    border: 'none',
                                  }}
                                />
                                {field.unit && (
                                  <span
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                                    style={{ color: 'hsl(var(--muted-foreground))' }}
                                  >
                                    {field.unit}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Muscle Groups — only for gym */}
                          {activityType === 'gym' && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                Muscle Groups
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {MUSCLE_GROUPS.map((group) => {
                                  const selected = muscleGroups.includes(group.value);
                                  return (
                                    <button
                                      key={group.value}
                                      type="button"
                                      onClick={() => {
                                        setMuscleGroups((prev) =>
                                          selected
                                            ? prev.filter((g) => g !== group.value)
                                            : [...prev, group.value]
                                        );
                                      }}
                                      className="btn-press px-3 py-1.5 text-xs font-medium transition-all"
                                      style={{
                                        background: selected ? 'var(--gradient-primary)' : 'hsl(var(--muted))',
                                        color: selected ? 'white' : 'hsl(var(--muted-foreground))',
                                        borderRadius: 'var(--radius)',
                                      }}
                                    >
                                      {group.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Photo Upload */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      {photoPreview ? (
                        <div
                          className="relative w-full overflow-hidden"
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          <img
                            src={photoPreview}
                            alt="Workout proof"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 flex items-end justify-between p-3" style={{ background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5))' }}>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="btn-press px-3 py-1.5 text-xs font-medium text-white"
                              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius)' }}
                            >
                              Change photo
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPhoto(null);
                                setPhotoPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              aria-label="Remove photo"
                              className="btn-press w-8 h-8 flex items-center justify-center text-white"
                              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius)' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'hsl(var(--primary))'; }}
                          onDragLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'hsl(var(--border))';
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                              const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                              handlePhotoSelect(fakeEvent);
                            }
                          }}
                          className="btn-press w-full py-8 flex flex-col items-center gap-3 transition-colors"
                          style={{
                            border: '2px dashed hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            background: 'hsl(var(--muted) / 0.5)',
                          }}
                        >
                          <div
                            className="w-12 h-12 flex items-center justify-center"
                            style={{
                              background: 'hsl(var(--primary) / 0.1)',
                              borderRadius: 'var(--radius)',
                              color: 'hsl(var(--primary))',
                            }}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                              Tap to take a photo or drop one here
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              Prove your workout (optional)
                            </p>
                          </div>
                        </button>
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
