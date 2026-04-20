import { useState } from 'react';
import axios from 'axios';
import { workoutService } from '../services/workoutService';

interface AdminAddWorkoutProps {
  challengeId: string;
  userId: string;
  userName: string;
  initialDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminAddWorkout({
  challengeId,
  userId,
  userName,
  initialDate,
  onSuccess,
  onCancel,
}: AdminAddWorkoutProps) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      let photoUrl: string | undefined;

      if (photo) {
        const presignedResponse = await workoutService.getPresignedUrl(
          challengeId,
          photo.type,
        );
        await workoutService.uploadPhoto(presignedResponse.uploadUrl, photo);
        photoUrl = presignedResponse.key;
      }

      await workoutService.adminCreate(challengeId, {
        userId,
        date,
        photoUrl,
        note: note.trim() || undefined,
      });

      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to add workout entry');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          Add Entry for {userName}
        </h2>
        <button
          onClick={onCancel}
          className="text-sm transition hover:opacity-70"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Cancel
        </button>
      </div>

      <div
        className="rounded-lg p-3 mb-4"
        style={{
          background: 'hsl(var(--secondary) / 0.1)',
          border: '1px solid hsl(var(--secondary) / 0.2)',
        }}
      >
        <p className="text-sm" style={{ color: 'hsl(var(--secondary))' }}>
          This entry will be marked as "Added by Admin"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:outline-none transition"
            style={{
              background: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Photo Proof (Optional)
          </label>
          <div
            className="rounded-lg p-4"
            style={{ border: '2px dashed hsl(var(--border))' }}
          >
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 text-white p-1 rounded-full text-xs"
                  style={{ background: 'hsl(var(--destructive))' }}
                >
                  X
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <span
                  className="text-3xl mb-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  +
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Add photo (optional for admin)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {!photo && (
            <p
              className="text-xs mt-1"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Admin entries don't require photo proof
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adding this entry..."
            className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:outline-none transition"
            style={{
              background: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
            rows={2}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
            style={{
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
            }}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gradient-secondary)' }}
          >
            {submitting ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
