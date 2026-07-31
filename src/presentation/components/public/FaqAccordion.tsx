'use client';

import { useState } from 'react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Single-open accordion with animated height and FAQPage JSON-LD for SEO. */
export function FaqAccordion({
  faqs,
  eyebrow = 'Questions',
  title = 'FAQ',
}: {
  faqs: FaqItem[];
  eyebrow?: string;
  title?: string;
}) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  if (!faqs.length) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-10 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">{eyebrow}</p>
        <h2
          className="text-[clamp(1.8rem,4vw,3rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {title}
        </h2>
      </div>
      <ul className="flex flex-col divide-y divide-current/10 border-y border-current/10">
        {faqs.map((f) => {
          const isOpen = open === f.id;
          return (
            <li key={f.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="font-medium">{f.question}</span>
                <span aria-hidden className="shrink-0 opacity-60">
                  {isOpen ? '–' : '+'}
                </span>
              </button>
              <div
                className="grid overflow-hidden"
                style={{
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows var(--motion-duration) var(--motion-ease)',
                }}
              >
                <div className="min-h-0">
                  <p className="pb-4 opacity-70">{f.answer}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
