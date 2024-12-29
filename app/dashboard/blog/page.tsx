'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { getArticles, deleteArticle, ArticleRow } from './actions';
import { generateArticle } from '@/lib/llm/articles';
import { useRouter } from 'next/navigation';
import { Article } from '@/db/schema';
import Link from 'next/link';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"


export default function ArticlesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiArticleTitle, setAiArticleTitle] = useState<string>('');
  const [aiArticlePrompt, setAiArticlePrompt] = useState<string>('');

  useEffect(() => {
    const fetchArticles = async () => {
      const fetchedArticles = await getArticles();
      setArticles(fetchedArticles);
    };
    fetchArticles();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await deleteArticle(id);
    if (result.success && articles) {
      setArticles(articles.filter(article => article.id !== id));
    } else {
      console.error('Failed to delete article');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
  
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }
      const newGeneratedArticle: Article = await generateArticle(aiArticlePrompt, aiArticleTitle, user.id);
      router.push(`/dashboard/blog/edit/${newGeneratedArticle.slug}`);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Drawer>
    <section className="flex-1 p-0 md:p-4">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-white mb-6">
        Articles
      </h1>

      <Card>
        <CardContent>
          <div className="flex justify-end items-center py-4 gap-4">
              <DrawerTrigger asChild>
                <Button >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </DrawerTrigger>
              <DrawerContent className="w-full max-w-3xl mx-auto">
              <DrawerHeader>
                <DrawerTitle>Generate Article</DrawerTitle>
              </DrawerHeader>

              {/* Example of a simple form approach */}
              <form onSubmit={handleGenerate} className="space-y-4 px-4 pb-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Title will be used by the AI to generate the article"
                    value={aiArticleTitle}
                    onChange={(e) => setAiArticleTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                    Prompt
                  </label>
                  <Textarea
                    id="prompt"
                    className="h-48"
                    placeholder="Addidional instructions"
                    value={aiArticlePrompt}
                    onChange={(e) => setAiArticlePrompt(e.target.value)}
                    required
                  />
                </div>

                <DrawerFooter>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </DrawerContent>
            <Link href="/dashboard/blog/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Article
              </Button>
            </Link>
          </div>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              { articles ? articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/blog/edit/${article.slug}`} className="hover:underline">{article.title}</Link>
                  </TableCell>
                  <TableCell>{article.tags.join(', ')}</TableCell>
                  <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{article.isDraft ? 'Draft' : 'Published'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/blog/edit/${article.slug}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(article.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : null }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
    </Drawer>
  );
}
