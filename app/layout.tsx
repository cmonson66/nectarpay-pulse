import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['600', '700', '800'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'NectarPay Arizona — accept crypto, keep the fees',
  description:
    'Zero-fee crypto payments for Arizona businesses. Money settles to your own wallet in seconds. No chargebacks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
