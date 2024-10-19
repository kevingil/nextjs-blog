'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAboutPage } from '@/db/queries';

interface AboutPage {
  id: number;
  title: string;
  content: string;
  profileImage?: string;
  metaDescription?: string;
  lastUpdated: string;
}

export default function AboutPage() {
  const [pageData, setPageData] = useState<AboutPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAboutPage();
        if (!data) {
          return;
        }
        setPageData(data as AboutPage);
      } catch (error) {
        console.error('Failed to load about page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">About</h1>
        <p>Failed to load page content.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{pageData.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pageData.profileImage && (
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <img 
                  src={pageData.profileImage} 
                  alt="Profile"
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className={`${pageData.profileImage ? 'md:col-span-2' : 'md:col-span-3'}`}>
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {pageData.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mt-8 hidden">
        Last updated: {new Date(pageData.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
}
