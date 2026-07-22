import type { Metadata } from 'next';
import './globals.css';
import { ThemeScript } from '@/presentation/theme/ThemeScript';
import { ThemeStyle } from '@/presentation/theme/ThemeStyle';
import { getActiveTheme } from '@/presentation/theme/getActiveTheme';

export const metadata: Metadata = {
  title: {
    default: 'Maapkathi Studio',
    template: '%s · Maapkathi Studio',
  },
  description:
    'White-label portfolio & showcase platform for interior and architectural design studios.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = await getActiveTheme();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <ThemeStyle theme={theme} />
      </head>
      <body>{children}</body>
    </html>
  );
}
