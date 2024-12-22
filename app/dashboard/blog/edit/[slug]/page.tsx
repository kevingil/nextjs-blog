'use server'

import ArticleEditor from '@/components/blog/Editor';

export default async function EditArticlePage({ params }: { params: { slug: string } }) {
  const data = await params;

  return (
    <ArticleEditor params={{ slug: data.slug }} />
  );
}
