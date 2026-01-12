import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import NewsImage from '@/components/NewsImageComponent';

export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let article = null;
  let recommendedArticles = [];
  
  try {
    article = await prisma.article.findUnique({
      where: { id },
      include: { feed: true }
    });

    if (article) {
        // Fetch random recommended articles (excluding current)
        recommendedArticles = await prisma.article.findMany({
            where: { 
                id: { not: id },
                // Try to match category if possible, otherwise random
                feed: { category: article.feed?.category }
            },
            take: 4,
            orderBy: { publishedAt: 'desc' }
        });
        
        // Fallback if not enough category matches
        if (recommendedArticles.length < 4) {
             const more = await prisma.article.findMany({
                where: { id: { notIn: [id, ...recommendedArticles.map(a => a.id)] } },
                take: 4 - recommendedArticles.length,
                orderBy: { publishedAt: 'desc' }
             });
             recommendedArticles = [...recommendedArticles, ...more];
        }
    }
  } catch (error) {
    console.error('Failed to fetch article:', error);
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Article Content (Centered, wider) */}
        <article className="lg:col-span-8 lg:col-start-3">
            <header className="mb-10 text-center">
                <div className="mb-4 flex justify-center">
                <span className="font-sans font-bold text-xs uppercase tracking-widest text-red-700 border border-red-700 px-3 py-1">
                    {article.source}
                </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6 text-gray-900">
                {article.title}
                </h1>
                <div className="flex justify-center items-center gap-4 text-sm font-sans text-gray-500 uppercase tracking-wide border-y border-gray-100 py-4">
                <span className="font-bold text-black">By {article.author || 'Staff'}</span>
                <span>•</span>
                <time>{format(article.publishedAt, 'MMMM d, yyyy h:mm a')}</time>
                </div>
            </header>

            {article.imageUrl && (
                <div className="mb-12 w-full overflow-hidden shadow-sm">
                <NewsImage 
                    src={article.imageUrl} 
                    alt={article.title}
                    category={article.feed?.category}
                    keyword={article.keyword}
                    className="w-full h-auto object-cover max-h-[600px]"
                />
                </div>
            )}

            <div className="prose prose-xl prose-serif max-w-none text-gray-800 leading-loose">
                {/* Custom CSS for spacing and drop cap */}
                <style dangerouslySetInnerHTML={{__html: `
                    .prose p { margin-bottom: 1.5em; line-height: 1.8; }
                    .prose img { margin: 2rem auto; border-radius: 4px; }
                    .prose p:first-of-type::first-letter {
                        font-size: 4em;
                        font-weight: bold;
                        float: left;
                        line-height: 1;
                        margin-right: 0.25em;
                        margin-top: 0.1em;
                        font-family: serif;
                    }
                `}} />
                <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
            </div>

            <div className="mt-16 pt-10 border-t border-black text-center">
                {!article.isManual && (
                <div className="mb-8">
                    <p className="font-sans text-sm text-gray-500 mb-3">This article was syndicated from {article.source}.</p>
                    <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-black text-white hover:bg-gray-800 font-sans text-xs font-bold uppercase px-6 py-3 transition"
                    >
                    Read Full Article on Source
                    </a>
                </div>
                )}
            </div>
        </article>

        {/* Right Sidebar: Recommended Stories */}
        <aside className="lg:col-span-2 hidden lg:block border-l border-gray-100 pl-8 mt-20">
            <h3 className="font-sans font-bold text-xs uppercase tracking-widest mb-6 border-b border-black pb-2">
                Read Next
            </h3>
            <div className="space-y-8">
                {recommendedArticles.map(rec => (
                    <div key={rec.id} className="group">
                        <Link href={`/article/${rec.id}`}>
                            <div className="mb-2 relative w-full aspect-video overflow-hidden bg-gray-50">
                                <NewsImage 
                                    src={rec.imageUrl} 
                                    alt={rec.title}
                                    category={rec.feed?.category}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <h4 className="font-serif font-bold text-sm leading-snug group-hover:text-blue-800 transition-colors">
                                {rec.title}
                            </h4>
                        </Link>
                        <div className="text-[10px] font-sans text-gray-400 mt-1 uppercase">
                            {format(rec.publishedAt, 'MMM d')}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    </div>
  );
}
