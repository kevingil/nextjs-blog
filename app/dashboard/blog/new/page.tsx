'use server'

import ArticleEditor from '@/components/blog/Editor';


export default async function NewArticlePage() {
  const slug = 'new';

  return (
    <ArticleEditor params={{ slug: slug }} />
  );
}
