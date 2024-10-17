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
import { updateArticle, getArticle } from './actions';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  image: z.string().url().optional(),
  tags: z.string(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function EditArticlePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  useEffect(() => {
    async function fetchArticle() {
      if (params.slug) {
        const article = await getArticle(params.slug);
        if (article) {
          setValue('title', article.title);
          setValue('content', article.content);
          setValue('image', article.image || '');
          setValue('tags', article.tags ? article.tags.map(tag => tag.name).join(', ') : '');
        }
      }
    }
    fetchArticle();
  }, [params.slug, setValue]);

  const onSubmit = async (data: ArticleFormData) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to edit an article." });
      return;
    }

    setIsLoading(true);
    try {
      await updateArticle({
        slug: params.slug,
        title: data.title,
        content: data.content,
        image: data.image,
        tags: data.tags.split(',').map(tag => tag.trim()),
      });
      toast({ title: "Success", description: "Article updated successfully." });
      router.push(`/blog/${params.slug}`);
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
    <div className="container mx-auto px-4 py-8">
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Input
                {...register('title')}
                placeholder="Article Title"
              />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <Textarea
                {...register('content')}
                placeholder="Article Content"
                rows={10}
              />
              {errors.content && <p className="text-red-500">{errors.content.message}</p>}
            </div>
            <div>
              <Input
                {...register('image')}
                placeholder="Image URL (optional)"
              />
              {errors.image && <p className="text-red-500">{errors.image.message}</p>}
            </div>
            <div>
              <Input
                {...register('tags')}
                placeholder="Tags (comma-separated)"
              />
              {errors.tags && <p className="text-red-500">{errors.tags.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Article'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
