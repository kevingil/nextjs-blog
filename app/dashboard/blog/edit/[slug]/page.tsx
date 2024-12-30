'use server'

import ArticleEditor from '@/components/blog/Editor';
import { getUser } from '@/db/queries';
import { redirect } from 'next/navigation';

export default async function EditArticlePage({ params }: { params: { slug: string } }) {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const data = await params;

  return (
    <ArticleEditor params={{ slug: data.slug }} />
  );
}
