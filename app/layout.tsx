import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/db/queries';
import { FooterSection } from "@/components/home/sections/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/home/theme-provider";

export const metadata: Metadata = {
  title: 'Kevin Gil',
  description: 'Software Engineer in San Francisco.',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  let userPromise = getUser();
  

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh]">
        <UserProvider userPromise={userPromise}>


          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />

            <main className="max-w-6xl mx-auto px-2 sm:px-6">
              {children}
            </main>

            <FooterSection />

          </ThemeProvider>

        </UserProvider>
      </body>
    </html>
  );
}
