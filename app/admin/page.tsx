import { prisma } from '@/lib/db';
import { toggleFeed, triggerUpdate, submitArticle, deleteAllArticles } from './actions';
import { logout } from '@/app/login/actions';
import ArticleForm from '@/components/ArticleForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let feeds: Awaited<ReturnType<typeof prisma.feed.findMany>> = [];

  try {
    feeds = await prisma.feed.findMany();
  } catch {
    feeds = [];
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex justify-between items-center mb-8 border-b border-black pb-4">
        <h1 className="text-4xl font-serif font-bold">Admin Dashboard</h1>
        <form action={logout}>
          <button className="text-sm font-sans font-bold uppercase hover:underline text-red-600">
            Logout
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold">RSS Feeds</h2>
            <form action={triggerUpdate}>
              <button className="bg-black text-white px-4 py-2 font-sans text-xs font-bold uppercase hover:bg-gray-800 transition">
                Update All Feeds Now
              </button>
            </form>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <ul className="space-y-4">
              {feeds.map((feed) => (
                <li
                  key={feed.id}
                  className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0"
                >
                  <div>
                    <div className="font-bold font-serif">{feed.name}</div>
                    <div className="text-xs text-gray-500 truncate w-64">{feed.url}</div>
                  </div>
                  <form action={toggleFeed.bind(null, feed.id, feed.active)}>
                    <button
                      className={`px-3 py-1 text-xs font-sans font-bold uppercase rounded ${
                        feed.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {feed.active ? 'Active' : 'Inactive'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-red-200 pt-6">
             <h3 className="text-xl font-serif font-bold text-red-700 mb-4">Danger Zone</h3>
             <form action={deleteAllArticles}>
               <button className="w-full bg-red-600 text-white px-4 py-3 font-sans font-bold uppercase hover:bg-red-700 transition rounded">
                 Delete All Articles
               </button>
               <p className="text-xs text-gray-500 mt-2 text-center">This will remove all articles from the database. Feeds will be preserved.</p>
             </form>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold mb-6">Submit Article</h2>
          <ArticleForm action={submitArticle} />
        </div>
      </div>
    </div>
  );
}

