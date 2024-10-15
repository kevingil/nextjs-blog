'use server'

import { eq } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { articles, articleTags, tags } from '@/db/schema';

export async function getArticle(slug: string) {
  const article = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  
  if (article.length === 0) {
    return null;
  }

  const articleTagsData = await db
    .select({ name: tags.name })
    .from(tags)
    .innerJoin(articleTags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, article[0].id));

  return {
    ...article[0],
    tags: articleTagsData,
  };
}

export async function updateArticle({
  slug,
  title,
  content,
  image,
  tags: newTags,
}: {
  slug: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
}) {
  const article = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  
  if (article.length === 0) {
    throw new Error('Article not found');
  }

  const articleId = article[0].id;

  // Update article
  await db.update(articles).set({ title, content, image }).where(eq(articles.id, articleId));

  // Delete existing tags
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));

  // Add new tags
  for (const tagName of newTags) {
    let tag = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
    
    if (tag.length === 0) {
      const [newTag] = await db.insert(tags).values({ name: tagName }).returning();
      tag = [newTag];
    }

    await db.insert(articleTags).values({ articleId, tagId: tag[0].id });
  }
}
