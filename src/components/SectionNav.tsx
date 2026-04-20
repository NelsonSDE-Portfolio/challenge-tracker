import { useState, useEffect } from 'react';

interface SectionNavProps {
  sections: { id: string; label: string }[];
}

export function SectionNav({ sections }: SectionNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-0 z-30 section-nav">
      <div className="max-w-3xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            style={{
              background: activeSection === id ? 'hsl(var(--primary) / 0.1)' : 'transparent',
              color: activeSection === id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            }}
            onMouseEnter={(e) => {
              if (activeSection !== id) e.currentTarget.style.background = 'hsl(var(--muted))';
            }}
            onMouseLeave={(e) => {
              if (activeSection !== id) e.currentTarget.style.background = 'transparent';
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
