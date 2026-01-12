import { prisma } from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import NewsImage from '@/components/NewsImageComponent';

export const revalidate = 60; // Revalidate every minute
export const dynamic = 'force-dynamic';

async function getArticles() {
  try {
    return await prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: { feed: true }
    });
  } catch (error) {
    console.error('Failed to fetch articles (DB might not be initialized):', error);
    return [];
  }
}

export default async function Home() {
  const allArticles = await getArticles();

  // Reorder logic: Move manual articles to the bottom
  const manualArticles = allArticles.filter(a => a.isManual);
  const rssArticles = allArticles.filter(a => !a.isManual);
  
  // Shuffle manual articles to satisfy "random" requirement if there are multiple
  // (Fisher-Yates shuffle for small array)
  for (let i = manualArticles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [manualArticles[i], manualArticles[j]] = [manualArticles[j], manualArticles[i]];
  }

  // Combine: RSS first, then Manual at the very bottom
  const articles = [...rssArticles, ...manualArticles];

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif">No news available yet.</h2>
        <p className="font-sans text-gray-500 mt-2">Please go to Admin to trigger an update.</p>
        <Link href="/admin" className="mt-4 inline-block bg-black text-white px-4 py-2 font-sans text-sm font-bold uppercase">
          Go to Admin
        </Link>
      </div>
    );
  }

  const leadStory = articles[0];
  const subLeadStories = articles.slice(1, 4);
  const sideBarStories = articles.slice(4, 12);
  const centerListStories = articles.slice(12, 20);
  const bottomStories = articles.slice(20);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-black pt-4">
      
      {/* Left Sidebar: What's News */}
      <div className="lg:col-span-3 border-r border-gray-200 pr-6 hidden lg:block">
        <h3 className="font-sans font-bold text-xs uppercase tracking-widest mb-4 border-b border-black pb-1">
          What's News
        </h3>
        <div className="space-y-6">
          {sideBarStories.map((article) => (
            <div key={article.id} className="group">
              <div className="flex items-baseline gap-2 mb-1">
                 <span className="text-[10px] font-sans font-bold text-gray-500 uppercase">{article.source}</span>
                 <span className="text-[10px] font-sans text-gray-400">{formatDistanceToNow(article.publishedAt)} ago</span>
              </div>
              <div className="mb-2 relative w-full aspect-video overflow-hidden bg-gray-100 block">
                <NewsImage 
                  src={article.imageUrl} 
                  alt={article.title}
                  category={article.feed?.category}
                  keyword={article.keyword}
                  className="w-full h-full object-cover"
                />
              </div>
              <Link href={`/article/${article.id}`} className="block">
                <h4 className="font-serif font-bold text-sm leading-tight group-hover:text-blue-800 transition-colors">
                  {article.title}
                </h4>
              </Link>
              <p className="font-serif text-xs text-gray-600 mt-1 line-clamp-2">
                {(article.snippet || '').replace(/<[^>]*>/g, '')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Center Main Content */}
      <div className="lg:col-span-6 px-0 lg:px-4">
        {/* Lead Story */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex justify-center items-center gap-2">
             <span className="text-xs font-sans font-bold uppercase text-red-700">{leadStory.source}</span>
          </div>
          <Link href={`/article/${leadStory.id}`}>
            <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight hover:text-gray-700 transition-colors mb-4">
              {leadStory.title}
            </h2>
          </Link>
          <div className="mb-6 relative w-full overflow-hidden">
            <NewsImage 
              src={leadStory.imageUrl} 
              alt={leadStory.title}
              category={leadStory.feed?.category}
              keyword={leadStory.keyword}
              className="w-full h-auto object-cover max-h-[400px]"
            />
          </div>
          <p className="font-serif text-lg text-gray-600 leading-relaxed mb-4">
            {(leadStory.snippet || '').replace(/<[^>]*>/g, '').substring(0, 200)}...
          </p>
          <div className="text-xs font-sans text-gray-400 uppercase tracking-wider">
             By {leadStory.author || 'Staff'} • {formatDistanceToNow(leadStory.publishedAt)} ago
          </div>
        </div>

        <div className="border-t border-gray-200 my-8"></div>

        {/* Sub Lead Stories (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subLeadStories.map((article) => (
            <div key={article.id} className="text-center md:text-left">
               <div className="mb-1 text-[10px] font-sans font-bold text-gray-500 uppercase">{article.source}</div>
               <div className="mb-3 relative w-full aspect-video overflow-hidden bg-gray-100">
                 <NewsImage 
                   src={article.imageUrl} 
                   alt={article.title}
                   category={article.feed?.category}
                   keyword={article.keyword}
                   className="w-full h-full object-cover"
                 />
               </div>
               <Link href={`/article/${article.id}`}>
                 <h3 className="font-serif font-bold text-lg leading-tight mb-2 hover:underline">
                   {article.title}
                 </h3>
               </Link>
               <p className="font-serif text-sm text-gray-600 line-clamp-4">
                 {(article.snippet || '').replace(/<[^>]*>/g, '')}
               </p>
            </div>
          ))}
        </div>

        {/* More Top Stories List */}
        <div className="mt-12 pt-8 border-t border-gray-200">
           <h3 className="font-sans font-bold text-sm uppercase tracking-widest mb-6">More Top Stories</h3>
           <div className="space-y-8">
             {centerListStories.map((article) => (
               <div key={article.id} className="grid grid-cols-12 gap-6 group">
                  <div className="col-span-4 md:col-span-3">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                      <NewsImage 
                        src={article.imageUrl} 
                        alt={article.title}
                        category={article.feed?.category}
                        keyword={article.keyword}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="col-span-8 md:col-span-9">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] font-sans font-bold text-gray-500 uppercase">{article.source}</span>
                      <span className="text-[10px] font-sans text-gray-400">{formatDistanceToNow(article.publishedAt)} ago</span>
                    </div>
                    <Link href={`/article/${article.id}`}>
                      <h3 className="font-serif font-bold text-xl leading-tight mb-2 group-hover:text-blue-800 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="font-serif text-sm text-gray-600 line-clamp-2 md:line-clamp-3">
                      {(article.snippet || '').replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Right Sidebar: Opinion / More */}
      <div className="lg:col-span-3 border-l border-gray-200 pl-6">
         <h3 className="font-sans font-bold text-xs uppercase tracking-widest mb-4 border-b border-black pb-1">
          Latest Feed
        </h3>
        <div className="space-y-4 divide-y divide-gray-100">
           {bottomStories.map((article) => (
            <div key={article.id} className="pt-4 first:pt-0">
               <Link href={`/article/${article.id}`}>
                 <h4 className="font-serif font-medium text-base leading-snug hover:text-gray-600 mb-1">
                   {article.title}
                 </h4>
               </Link>
               <div className="text-[10px] font-sans text-gray-400 uppercase">
                 {article.source} • {formatDistanceToNow(article.publishedAt)} ago
               </div>
            </div>
           ))}
        </div>
      </div>

    </div>
  );
}
