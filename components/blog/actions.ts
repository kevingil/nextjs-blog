'use server'

import { eq, sql, or, like, and, inArray, desc } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { articles, users, articleTags, tags } from '@/db/schema';
import { ArticleListItem, ITEMS_PER_PAGE } from './index';


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


export async function searchArticles(
  query: string,
  page: number = 1,
): Promise<{ articles: ArticleListItem[], totalPages: number }> {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  let searchResults: Set<number> = new Set();
  
  /* Try embedding search first if query is long enough
  if (query.length > 3) {
    try {
      const embedding = await createEmbedding(query);
      const embeddingResults = await db.run(
        sql`
          SELECT id, vector_distance_cos(embedding, vector32(${JSON.stringify(embedding)})) as distance
          FROM articles
          WHERE embedding IS NOT NULL
          AND is_draft = 0
          AND vector_distance_cos(embedding, vector32(${JSON.stringify(embedding)})) > 0.7
          ORDER BY distance DESC
          LIMIT ${itemsPerPage}
        `
      ) as { id: number; distance: number }[];

      embeddingResults.forEach(result => searchResults.add(result.id));
    } catch (error) {
      console.error('Embedding search failed:', error);
      // Continue with text search only
    }
      
  }*/

  // Perform text search
  //const embededQuery = getEmbeddings(query);
  //console.log(embededQuery);
  const textSearchResults = await db
    .select({
      id: articles.id,
    })
    .from(articles)
    .where(
      and(
        eq(articles.isDraft, false),
        or(
          like(articles.title, `%${query}%`),
          like(articles.content, `%${query}%`)
        )
      )
    )
    .limit(ITEMS_PER_PAGE);

  // Combine results
  textSearchResults.forEach(result => searchResults.add(result.id));

  // Get full article data for all found IDs
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
    .where(
      and(
        eq(articles.isDraft, false),
        inArray(articles.id, Array.from(searchResults))
      )
    )
    .orderBy(desc(articles.createdAt))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  // Get total count for pagination
  const totalArticles = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(
      and(
        eq(articles.isDraft, false),
        or(
          like(articles.title, `%${query}%`),
          like(articles.content, `%${query}%`)
        )
      )
    );

  const totalPages = Math.ceil(Number(totalArticles[0].count) / ITEMS_PER_PAGE);

  // Add tags to articles
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
