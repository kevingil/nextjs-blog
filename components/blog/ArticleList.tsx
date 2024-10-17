'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { getArticles, ArticleListItem } from './actions';

type ArticleListProps = {
  pagination: boolean;
}

function ArticleCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex items-center mb-4">
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ArticlesList({ pagination }: ArticleListProps) {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [searchTag, setSearchTag] = useState<string | null>(searchParams.get('tag'));
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [recentTags, setRecentTags] = useState<string[]>([]);

  useEffect(() => {
    setRecentTags(['React', 'Next.js', 'TypeScript', 'JavaScript', 'Web Development']);
  }, []);


  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { articles, totalPages } = await getArticles(page);
      setArticles(articles);
      setTotalPages(totalPages);
      setLoading(false);
    };

    fetchArticles();
  }, [page]);

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (loading) {
    return <ArticlesSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:py-8">

      {pagination ? (
        <div>
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const params = new URLSearchParams(searchParams);
              if (e.target.value) {
                params.set('search', e.target.value);
              } else {
                params.delete('search');
              }
              window.history.replaceState({}, '', `?${params.toString()}`);
            }}
            className="w-full p-4 py-6 rounded-full"
          />
          <div className='flex flex-wrap gap-2 my-4'>
          {recentTags.map((tag) => (
            <Badge
              key={tag}
              variant={searchTag === tag ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/90"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (searchTag === tag) {
                  params.delete('tag');
                  setSearchTag(null);
                } else {
                  params.set('tag', tag);
                  setSearchTag(tag);
                }
                params.set('page', '1');
                window.history.replaceState({}, '', `?${params.toString()}`);
              }}
            >
              {tag}
            </Badge>
          ))}
          </div>

        </div>
      ) : (
        <div className="flex justify-between p-4 items-center">

          <h2 className="font-semibold text-muted-foreground">
            Recent Articles
          </h2>
          <Link href="/blog"
            className="flex items-center font-medium text-primary transition-colors duration-200 
            border border-gray-300 dark:border-gray-800 bg-card hover:border-primary dark:hover:border-primary rounded-lg px-4 py-2 shadow-sm">
            <p className="text-md text-muted-foreground">See all</p>
          </Link>
        </div>
      )}

      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="p-0">
            <Link href={`/blog/${article.slug}`}
              className='w-full h-full flex flex-row justify-between'>
              <div className='p-4 w-full'>
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <div className="flex items-center mb-4">
                  <span className="text-sm text-muted-foreground">{article.author}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {article.content?.substring(0, 160)}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {format(new Date(article.createdAt), 'MMMM d, yyyy')}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-primary">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className='w-1/3 p-4 flex items-center'>
                {article.image !== null && article.image !== '' ? (
                  <img src={article.image} alt={article.title ? article.title : ''}
                    className="rounded-lg object-cover h-full w-full bg-gray-300/10 dark:bg-gray-100/10" />
                ) :
                  <ImageIcon className='h-2/3 w-full text-zinc-200 dark:text-zinc-600' />
                }
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
      {pagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={page > 1 ? createPageURL(page - 1) : '#'} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink href={createPageURL(pageNumber)} isActive={pageNumber === page}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={page < totalPages ? createPageURL(page + 1) : '#'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
