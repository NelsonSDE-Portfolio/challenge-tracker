import { useState } from 'react';
import { workoutService } from '../services/workoutService';
import { uploadService } from '../services/uploadService';

interface AdminAddWorkoutProps {
  challengeId: string;
  userId: string;
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminAddWorkout({
  challengeId,
  userId,
  userName,
  onSuccess,
  onCancel,
}: AdminAddWorkoutProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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

      // Upload photo if provided
      if (photo) {
        const presignedResponse = await uploadService.getPresignedUrl(
          challengeId,
          photo.type,
        );
        await uploadService.uploadToS3(presignedResponse.uploadUrl, photo);
        photoUrl = presignedResponse.fileUrl;
      }

      // Create admin workout entry
      await workoutService.adminCreate(challengeId, {
        userId,
        date,
        photoUrl,
        note: note.trim() || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add workout entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Add Entry for {userName}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <div className="bg-purple-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-purple-700">
          This entry will be marked as "Added by Admin"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo Proof (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                >
                  X
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <span className="text-3xl mb-2">+</span>
                <span className="text-sm text-gray-500">
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
            <p className="text-xs text-gray-500 mt-1">
              Admin entries don't require photo proof
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adding this entry..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
