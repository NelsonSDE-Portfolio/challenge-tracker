import type { Context } from '@netlify/edge-functions';

const API_URL = Deno.env.get('API_URL') || 'https://challenge-tracker-api.onrender.com/api/v1';

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/share\/([^/]+)/);

  if (!match) {
    return context.next();
  }

  const shareToken = match[1];

  // Fetch workout data from the public API
  let workout: {
    userName: string;
    date: string;
    activityType?: string;
    metadata?: Record<string, unknown>;
    note?: string;
    photoUrl?: string;
    challengeName: string;
    weeklyProgress: { current: number; target: number };
  } | null = null;

  try {
    const response = await fetch(`${API_URL}/public/workouts/${shareToken}`);
    if (response.ok) {
      workout = await response.json();
    }
  } catch {
    // API unreachable — fall through to SPA
  }

  // Get the original HTML page from the SPA
  const pageResponse = await context.next();
  const html = await pageResponse.text();

  if (!workout) {
    // No workout data — return SPA as-is, it will show error state
    return new Response(html, {
      headers: { ...Object.fromEntries(pageResponse.headers), 'content-type': 'text/html' },
    });
  }

  // Build OG meta tags
  const activityLabels: Record<string, string> = {
    running: 'Running', walking: 'Walking', cycling: 'Cycling',
    swimming: 'Swimming', gym: 'Gym / Weights', yoga: 'Yoga',
    pilates: 'Pilates', hiking: 'Hiking', dance: 'Dance',
    martial_arts: 'Martial Arts', crossfit: 'CrossFit',
    stretching: 'Stretching', other: 'Workout',
  };

  const activityLabel = workout.activityType
    ? activityLabels[workout.activityType] || 'Workout'
    : 'Workout';

  const ogTitle = `${workout.userName}'s ${activityLabel}`;

  // Build description
  const descParts: string[] = [];
  const meta = workout.metadata as Record<string, unknown> | undefined;
  if (meta?.durationMinutes) descParts.push(`${meta.durationMinutes} min`);
  if (meta?.distanceKm) descParts.push(`${meta.distanceKm} km`);
  if (meta?.distanceM) descParts.push(`${meta.distanceM} m`);
  if (Array.isArray(meta?.muscleGroups)) {
    descParts.push((meta.muscleGroups as string[]).join(', '));
  }
  const { current, target } = workout.weeklyProgress;
  descParts.push(`${current}/${target} this week`);
  const ogDescription = descParts.join(' | ');

  const ogImage = workout.photoUrl || '';
  const ogUrl = url.toString();

  const ogTags = `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription)}" />
    ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
    <meta property="og:url" content="${escapeHtml(ogUrl)}" />
    <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
    ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ''}
  `;

  // Inject OG tags before </head>
  const modifiedHtml = html.replace('</head>', `${ogTags}</head>`);

  return new Response(modifiedHtml, {
    headers: { ...Object.fromEntries(pageResponse.headers), 'content-type': 'text/html' },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const config = {
  path: '/share/*',
};
