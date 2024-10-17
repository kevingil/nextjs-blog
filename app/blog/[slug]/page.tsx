import { Suspense } from 'react';
import { eq, ne } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

import { db } from '@/db/drizzle';
import { Article, articles, users, articleTags, tags } from '@/db/schema';
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

interface PostPageProps {
  params: {
    slug: string;
  };
}


type TagData = { 
  articleId: number,
  tagId: number,
  tagName: string | null,
}

type ArticleData = {
  article: Article,
  tags: TagData[] | null,
  author_name: string,
}

type RecommendedArticle = {
  id: number,
  title: string,
  slug: string,
  image: string | null,
  createdAt: number,
  author: string | null,
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = params;
  const article = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);

  if (article.length === 0) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article[0].title,
    description: article[0].content.substring(0, 160),
  };
}

async function getArticleData(slug: string): Promise<ArticleData | null> {
  const results = await db.select().
    from(articles)
    .where(eq(articles.slug, slug));

  if (results.length === 0) { notFound(); }

  const content: Article = results[0];

  const tagData = await db
    .select({ articleId: articleTags.articleId, tagId: articleTags.tagId, tagName: tags.name })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, content.id));

  const author = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, content.author));

  return {
    article: content,
    tags: tagData,
    author_name: author[0].name,
  }
}

async function getRecommendedArticles(currentArticleId: number): Promise<RecommendedArticle[] | null> {
  return await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      image: articles.image,
      createdAt: articles.createdAt,
      author: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author, users.id))
    .where((eq(articles.isDraft, false) && ne(articles.id, currentArticleId)))
    .limit(3);
}

function ArticleSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-12 w-3/4 mb-4" />
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10 rounded-full mr-4" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-64 w-full mb-6" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6 mb-6" />
      <div className="flex flex-wrap gap-2 mb-8">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

function RecommendedArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <Skeleton className="h-48 rounded-t-lg" />
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function Page({ params }: PostPageProps) {
  const { slug } = params;

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent slug={slug} />
      </Suspense>

      <Separator className="my-12" />

      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Recommended</h2>
        <Suspense fallback={<RecommendedArticlesSkeleton />}>
          <RecommendedArticles slug={slug} />
        </Suspense>
      </section>
    </div>
  );
}

async function ArticleContent({ slug }: { slug: string }) {
  const articleData = await getArticleData(slug);
  const content = articleData?.article;
  if (!content) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
      {content.image && (
        <img
          src={content.image}
          alt={content.title}
          width={800}
          height={400}
          className="rounded-lg mb-6 object-cover"
        />
      )}
      <div className="flex items-center mb-6">
        <div>
          <p className="font-semibold">{articleData.author_name}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(content.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>
      <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: content.content }} />
      <div className="flex flex-wrap gap-2 mb-8">
        {articleData.tags?.map((tag) => (
          <Badge key={tag.tagId} variant="secondary">{tag.tagName}</Badge>
        ))}
      </div>
    </article>
  );
}

async function RecommendedArticles({ slug }: { slug: string }) {
  const content = await getArticleData(slug);
  if (!content) {
    return null;
  }
  const recommendedArticles = await getRecommendedArticles(content.article.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recommendedArticles?.map((article: RecommendedArticle) => (
        <a href={`/blog/${article.slug}`} key={article.id} >
        <Card className="p-0">
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              width={400}
              height={200}
              className="rounded-t-lg object-cover h-48 w-full"
            />
          )}
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {format(new Date(article.createdAt), 'MMMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
        </a>
      ))}
    </div>
  );
}
