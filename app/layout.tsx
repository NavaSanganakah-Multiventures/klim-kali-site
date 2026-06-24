import type {Metadata} from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'श्री काली माता मंदिर | Shri Kali Mata Mandir',
  description: 'काली माता मंदिर की आधिकारिक वेबसाइट। आरती, पूजा-पाठ, विशेष अनुष्ठान और आचार्य पंडित धीरेंद्र त्रिपाठी जी से परामर्श।',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
