import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Maapkathi Studio',
    template: '%s · Maapkathi Studio',
  },
  description:
    'White-label portfolio & showcase platform for interior and architectural design studios.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
