export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_LABEL = '10MB';

export const ACTIVITY_TYPES = [
  { value: 'running', label: 'Running', icon: '🏃' },
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'cycling', label: 'Cycling', icon: '🚴' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'gym', label: 'Gym / Weights', icon: '🏋️' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'pilates', label: 'Pilates', icon: '🤸' },
  { value: 'hiking', label: 'Hiking', icon: '⛰️' },
  { value: 'dance', label: 'Dance', icon: '💃' },
  { value: 'martial_arts', label: 'Martial Arts', icon: '🥋' },
  { value: 'crossfit', label: 'CrossFit', icon: '🔥' },
  { value: 'stretching', label: 'Stretching', icon: '🙆' },
  { value: 'other', label: 'Other', icon: '⚡' },
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number]['value'];

export const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'legs', label: 'Legs' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
] as const;

interface MetadataField {
  key: string;
  label: string;
  unit: string;
  type: 'number';
}

export function getMetadataFields(activityType: string): MetadataField[] {
  switch (activityType) {
    case 'running':
    case 'walking':
    case 'hiking':
    case 'cycling':
      return [
        { key: 'distanceKm', label: 'Distance', unit: 'km', type: 'number' },
        { key: 'durationMinutes', label: 'Duration', unit: 'min', type: 'number' },
      ];
    case 'swimming':
      return [
        { key: 'distanceM', label: 'Distance', unit: 'm', type: 'number' },
        { key: 'durationMinutes', label: 'Duration', unit: 'min', type: 'number' },
      ];
    case 'gym':
      return [
        { key: 'durationMinutes', label: 'Duration', unit: 'min', type: 'number' },
      ];
    default:
      return [
        { key: 'durationMinutes', label: 'Duration', unit: 'min', type: 'number' },
      ];
  }
}
