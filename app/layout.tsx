
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/db/queries';
import { FooterSection } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/home/theme-provider";
import Aurora from "@/components/home/aurora";
import 'highlight.js/styles/base16/snazzy.css';


export const metadata: Metadata = {
  title: 'Kevin Gil',
  description: 'Software Engineer in San Francisco.',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const userPromise = getUser();

  return (
    <html
      lang="en" suppressHydrationWarning
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] flex flex-col relative">

        <UserProvider userPromise={userPromise}>


          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
              <Navbar />

              <Aurora />
              <main className="w-full max-w-6xl mx-auto px-2 sm:px-6 z-[1]" data-vaul-drawer-wrapper="">
                {children}
              </main>

              <FooterSection />
          </ThemeProvider>

        </UserProvider>

      </body>
    </html>
  );
}
