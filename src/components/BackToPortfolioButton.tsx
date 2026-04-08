// Check if running inside portfolio (embedded via Module Federation)
export const isEmbedded = () => {
  try {
    return window.location.pathname.includes('/projects/challenge-tracker');
  } catch {
    return false;
  }
};

export function BackToPortfolioButton() {
  if (!isEmbedded()) return null;

  return (
    <a
      href="/"
      className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition glass"
      style={{
        color: 'hsl(var(--muted-foreground))',
      }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Portfolio
    </a>
  );
}
