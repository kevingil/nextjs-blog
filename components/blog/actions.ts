'use server'

import { eq } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { Article, articles, articleTags, NewArticle, tags } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';


export async function createArticle({
    title,
    content,
    image,
    tags: newTags,
    isDraft,
    authorId,
  }: {
    title: string;
    content: string;
    image?: string;
    tags: string[];
    isDraft: boolean;
    authorId: number;
  }) {

    let slug = title.toLowerCase().replace(/\s+/g, '-');

    const existingArticle = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);

    if (existingArticle.length > 0) {
      slug = slug + '-' + uuidv4().substring(0, 4);
    }

    const newArticle: NewArticle = {
      image: image || null,
      slug: slug,
      title: title,
      content: content,
      isDraft: isDraft,
      embedding: null,
      author: authorId,
    }

    try {
      const postedArticle = await db.insert(articles).values(newArticle).returning();
      return postedArticle[0] as Article;
    } catch (error) {
      console.error('Error creating article', error);
      throw new Error('Failed to create article');
    }
    
}


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
  isDraft,
}: {
  slug: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  isDraft: boolean;
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
