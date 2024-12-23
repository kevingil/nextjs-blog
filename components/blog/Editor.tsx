'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { updateArticle, getArticle, createArticle } from './actions';
import Link from 'next/link';
import { Article } from '@/db/schema';
import { Switch } from '@/components/ui/switch';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  image: z.union([z.string().url(), z.literal('')]).optional(),
  tags: z.string(),
  isDraft: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function ArticleEditor({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useUser();
  const isNew = params.slug === 'new';
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  useEffect(() => {
    async function fetchArticle() {
      if (isNew) {
        setValue('title', '');
        setValue('content', '');
        setValue('image', '');
        setValue('tags', '');
        setValue('isDraft', false);
        return;
      }

      if (params.slug) {
        const article = await getArticle(params.slug);
        if (article) {
          setArticle(article);
          console.log("is draft", article.isDraft);
          setValue('title', article.title);
          setValue('content', article.content);
          setValue('image', article.image || '');
          setValue('tags', article.tags ? article.tags.map(tag => tag.name).join(', ') : '');
          setValue('isDraft', article.isDraft);
        }
      }
    }
    fetchArticle();
  }, [params.slug, setValue, isNew]);

  const onSubmit = async (data: ArticleFormData) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to edit an article." });
      return;
    }

    setIsLoading(true);
    try {
      if (isNew) {
        const newArticle: Article = await createArticle({
          title: data.title,
          content: data.content,
          image: data.image,
          tags: data.tags.split(',').map(tag => tag.trim()),
          isDraft: data.isDraft,
          authorId: user.id,
        });
        toast({ title: "Success", description: "Article created successfully." });
        router.push(`/dashboard/blog`);
      } else {
        await updateArticle({
          slug: params.slug,
          title: data.title,
          content: data.content,
          image: data.image,
          tags: data.tags.split(',').map(tag => tag.trim()),
          isDraft: data.isDraft,
        });
        toast({ title: "Success", description: "Article updated successfully." });
        router.push(`/dashboard/blog`);
      }

    } catch (error) {
      console.error('Failed to update article:', error);
      toast({ title: "Error", description: "Failed to update article. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to edit articles.</div>;
  }

  return (
    <section className="flex-1 p-0 md:p-4">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-white mb-6">
        Edit Article
      </h1>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Title</label>
              <Input
                {...register('title')}
                placeholder="Article Title"
              />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Image URL</label>
            <div>
              <Input
                {...register('image')}
                placeholder="Optional, for header"
              />
              {errors.image && <p className="text-red-500">{errors.image.message}</p>}
            </div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Content</label>
            <div>
              <Textarea
                {...register('content')}
                placeholder="Article Content"
                rows={10}
              />
              {errors.content && <p className="text-red-500">{errors.content.message}</p>}
            </div>
            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">Tags</label>
            <div>
              <Input
                {...register('tags')}
                placeholder="Tags (comma-separated)"
              />
              {errors.tags && <p className="text-red-500">{errors.tags.message}</p>}
            </div>
            <div className='flex items-center gap-2 py-2'>
              <label htmlFor="isDraft">Published </label>
              <Switch {...register('isDraft')} checked={!article?.isDraft} onCheckedChange={(checked) => {
                if (article) {
                  setArticle({...article, isDraft: !checked});
                }
                setValue('isDraft', !checked);
              }} /> 
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="secondary">
              <Link href="/dashboard/blog">
              Cancel
              </Link>
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Updating...' : isNew ? 'Create Article' : 'Update Article'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
}
