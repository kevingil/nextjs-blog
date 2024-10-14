
import { CommunitySection } from "@/components/home/sections/community";
import { FeaturesSection } from "@/components/home/sections/features";
import { Suspense } from 'react';
import { ArticlesList, ArticlesSkeleton } from '@/components/blog/ArticleList';
import { ServicesSection } from "@/components/home/sections/services";

export const metadata = {
  title: "Kevin Gil",
  description: "Software Engineer in San Francisco.",
  openGraph: {
    type: "website",
    url: "https://kevingil.com",
    title: "Kevin Gil",
    description: "Software Engineer in San Francisco.",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Kevin Gil",
      },
    ],
  },
};


export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto">
      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesList
        pagination={false} />
      </Suspense>
      <FeaturesSection />
      <ServicesSection />
      <CommunitySection />
    </main>
  );
}
