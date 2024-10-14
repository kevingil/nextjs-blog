import { Button } from '../components/ui/button';
import { ArrowRight, CreditCard, Database } from 'lucide-react';
import { CommunitySection } from "@/components/layout/sections/community";
import { FeaturesSection } from "@/components/layout/sections/features";
import { ServicesSection } from "@/components/layout/sections/services";



export const metadata = {
  title: "Shadcn - Landing template",
  description: "Free Shadcn landing page for developers",
  openGraph: {
    type: "website",
    url: "https://github.com/nobruf/shadcn-landing-page.git",
    title: "Shadcn - Landing template",
    description: "Free Shadcn landing page for developers",
    images: [
      {
        url: "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/shadcn-vue.jpg",
        width: 1200,
        height: 630,
        alt: "Shadcn - Landing template",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://github.com/nobruf/shadcn-landing-page.git",
    title: "Shadcn - Landing template",
    description: "Free Shadcn landing page for developers",
    images: [
      "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/shadcn-vue.jpg",
    ],
  },
};


export default function HomePage() {
  return (
    <main>
      <FeaturesSection />
      <ServicesSection />
      <CommunitySection />
    </main>
  );
}
