'use server'

import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { articles, users, articleTags, tags } from '@/db/schema';

const ITEMS_PER_PAGE = 6;

export type ArticleListItem = {
  id: number;
  title: string | null;
  slug: string | null;
  createdAt: number;
  image: string | null;
  content: string | null;
  author: string | null;
  tags: (string | null)[];
}

export async function getArticles(page: number): Promise<{ articles: ArticleListItem[], totalPages: number }> {
  const offset = (page - 1) * ITEMS_PER_PAGE;

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
    .where(eq(articles.isDraft, false))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  const totalArticles = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.isDraft, false));

  const totalPages = Math.ceil(Number(totalArticles[0].count) / ITEMS_PER_PAGE);

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

  return { articles: articlesWithTags, totalPages };
}
