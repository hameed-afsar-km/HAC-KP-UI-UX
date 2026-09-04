import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import AppLayoutShell from '@/components/navigation/AppLayoutShell';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'T7 Cross-Device Entity Resolution & Network Mapping',
  description: 'Forensic Intelligence & AML Investigation Platform for Multi-Modal Entity Extraction, Quality Review, Cross-Device Resolution, and Network Graphs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#F9F9F9] dark:bg-[#000000] text-[#000000] dark:text-[#F9F9F9] selection:bg-[#E85002] selection:text-white">
        <ThemeProvider>
          <AppLayoutShell>
            {children}
          </AppLayoutShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
