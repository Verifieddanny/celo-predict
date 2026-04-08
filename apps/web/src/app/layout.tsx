import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next"
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import { WalletProvider } from "@/components/wallet-provider"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'my-minipay-app',
  description: 'A new Celo blockchain project',
  verification: {
    other: {
      "talentapp:project_verification":
        "6a368db1fd3f1d17f2e13079b423c795680adad0a0ef39096784b7216db16a8d0ad9de7a42b0a0476ed43ca2a0a91d6cbc2503f5c9c3b4a7a661e8f0fb33931c",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Analytics />
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <WalletProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </WalletProvider>
        </div>
      </body>
    </html>
  );
}
