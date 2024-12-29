'use server'
import { db } from '@/db/drizzle'
import { Article, articles, articleTags, tags, users } from '@/db/schema'
import { eq, not, and, sql } from 'drizzle-orm'


export type ArticleRow = {
  id: number
  title: string | null
  createdAt: number
  isDraft: boolean  
  slug: string | null
  tags: string[]  
}

export type TagData = { 
  articleId: number,
  tagId: number,
  tagName: string | null,
}


export type ArticleData = {
  article: Article,
  tags: TagData[] | null,
  author_name: string,
}


export type RecommendedArticle = {
  id: number,
  title: string,
  slug: string,
  image: string | null,
  createdAt: number,
  author: string | null,
}



export async function generateMetadata(slug: string) {
  const article = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);

  if (article.length === 0) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article[0].title,
    description: article[0].content.substring(0, 160),
  };
}


export async function getArticleData(slug: string): Promise<ArticleData | null> {
  const results = await db.select().
    from(articles)
    .where(eq(articles.slug, slug));

  if (results.length === 0) { return null; }

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

export async function getRecommendedArticles(currentArticleId: number): Promise<RecommendedArticle[] | null> {
  return await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      image: articles.image,
      createdAt: articles.createdAt,
      author: users.name,
      isDraft: articles.isDraft
    })
    .from(articles)
    .leftJoin(users, eq(articles.author, users.id))
    .where(and(not(eq(articles.id, currentArticleId)), not(articles.isDraft)))
    .limit(3);
}

export async function getArticles(): Promise<ArticleRow[]> {
  const articlesWithTags = await db
    .select({
      id: articles.id,
      title: articles.title,
      createdAt: articles.createdAt,
      isDraft: articles.isDraft,
      slug: articles.slug,
      tags: sql<string>`group_concat(${tags.name}, ',')`
    })
    .from(articles)
    .leftJoin(articleTags, eq(articles.id, articleTags.articleId))
    .leftJoin(tags, eq(articleTags.tagId, tags.id))
    .groupBy(articles.id)
    .all()

  return articlesWithTags.map(article => ({
    ...article,
    tags: article.tags ? article.tags.split(',') : []
  }))
}

export async function deleteArticle(id: number) {
  await db.delete(articles).where(eq(articles.id, id))
  return { success: true }
}
