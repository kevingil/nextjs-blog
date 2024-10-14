import { eq } from 'drizzle-orm';
import { format } from 'date-fns';

import { db } from '@/db/drizzle';
import { articles, users, articleTags, tags } from '@/db/schema';
import { Card, CardContent } from "@/components/ui/card"
import { Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type ArticleListProps = {
  pagination: boolean
}

type ArticleListItem = {
  id: number;
  title: string | null;
  slug: string | null;
  createdAt: number;
  image: string | null;
  content: string | null;
  author: string | null;
  tags: (string | null)[];
}

async function getArticles(): Promise<ArticleListItem[]> {
  const articlesData = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      image: articles.image,
      content: articles.content,
      createdAt: articles.createdAt,
      author: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author, users.id))
    .where(eq(articles.isDraft, false));

  const articlesWithTags = await Promise.all(
    articlesData.map(async (article) => {
      const tagData = await db
        .select({ tagName: tags.name })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, article.id));

      return {
        ...article,
        tags: tagData.map((tag) => tag.tagName),
      };
    })
  );

  return articlesWithTags;
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

export async function ArticlesList({ pagination }: ArticleListProps) {
  const articles = await getArticles();

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:py-8">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="p-0">
            <a href={`/article/${article.slug}`}
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
                    <Badge key={tag} variant="secondary">{tag}</Badge>
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
            </a>
          </CardContent>
        </Card>
      ))}
      {pagination ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : 
      <div className="flex justify-end p-4">
        <Link href="/articles"
          className="flex items-center font-medium text-primary transition-colors duration-200 
          border border-gray-300 dark:border-gray-800 bg-card hover:border-primary dark:hover:border-primary rounded-lg px-4 py-2 shadow-sm">
          <p className="text-md text-muted-foreground">See all</p>
        </Link>
      </div>}
    </div>
  );
}
