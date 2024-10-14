
import { CommunitySection } from "@/components/layout/sections/community";
import { FeaturesSection } from "@/components/layout/sections/features";
import { ServicesSection } from "@/components/layout/sections/services";

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
    <main>
      <FeaturesSection />
      <ServicesSection />
      <CommunitySection />
    </main>
  );
}
