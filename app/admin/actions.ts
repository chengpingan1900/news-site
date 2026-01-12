'use server';

import { prisma } from '@/lib/db';
import { updateFeeds } from '@/lib/rss';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function toggleFeed(id: string, currentState: boolean) {
  await prisma.feed.update({
    where: { id },
    data: { active: !currentState },
  });
  revalidatePath('/admin');
}

export async function triggerUpdate() {
  await updateFeeds();
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function submitArticle(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const category = formData.get('category') as string || 'general';
    const keyword = formData.get('keyword') as string;
    
    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    // Find or create a manual feed for this category
    const feedUrl = `manual-${category}`;
    let feed = await prisma.feed.findUnique({
      where: { url: feedUrl }
    });

    if (!feed) {
      feed = await prisma.feed.create({
        data: {
          name: `Manual ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          url: feedUrl,
          active: true,
          category: category
        }
      });
    }

    // Create a fake link for manual submission or use a slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const link = `/article/${slug}`; // Internal link

    // Strip HTML for snippet
    const plainText = content.replace(/<[^>]*>?/gm, '');

    await prisma.article.create({
      data: {
        title,
        content,
        snippet: plainText.substring(0, 200),
        link, // Since link is unique, we generate one.
        author: author || 'Admin',
        publishedAt: new Date(),
        source: 'Editorial',
        isManual: true,
        imageUrl: imageUrl || null,
        keyword: keyword || null,
        feedId: feed.id
      }
    });
    
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Failed to submit article:', error);
    // In Server Actions, we can't easily alert, but we can prevent the crash.
    // Ideally, we'd return a state object { success: false, error: ... }
    // But for now, let's just rethrow if it's a redirect (which is expected) or handle real errors.
    if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
    }
    throw new Error('Failed to submit article. Please check content size or database connection.');
  }
  
  redirect('/');
}

export async function deleteAllArticles() {
  await prisma.article.deleteMany({});
  revalidatePath('/');
  revalidatePath('/admin');
}
