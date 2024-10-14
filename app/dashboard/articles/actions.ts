'use server'
import { db } from '@/db/drizzle'
import { articles, articleTags, tags } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export type ArticleRow = {
  id: number
  title: string | null
  createdAt: number
  isDraft: boolean  
  slug: string | null
  tags: string[]  
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
