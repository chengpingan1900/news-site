'use client';

import { useState } from 'react';
import { Article } from '@prisma/client';

interface ArticleListProps {
  articles: Article[];
  deleteAction: (id: string) => Promise<void>;
}

export default function ArticleList({ articles, deleteAction }: ArticleListProps) {
  const handleEdit = (article: Article) => {
    // Dispatch a custom event that ArticleForm listens to
    // This is a simple way to communicate between sibling components without context
    const event = new CustomEvent('edit-article', { detail: article });
    window.dispatchEvent(event);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (articles.length === 0) {
    return <p className="text-gray-500 text-sm italic">No manual articles found.</p>;
  }

  return (
    <ul className="space-y-4">
      {articles.map((article) => (
        <li key={article.id} className="bg-white border border-gray-200 p-4 rounded shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-serif font-bold text-lg">{article.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(article.publishedAt).toLocaleDateString()} • {article.author || 'Admin'}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(article)}
                className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase rounded hover:bg-blue-200"
              >
                Edit
              </button>
              <form action={deleteAction.bind(null, article.id)}>
                <button className="bg-red-100 text-red-700 px-3 py-1 text-xs font-bold uppercase rounded hover:bg-red-200">
                  Delete
                </button>
              </form>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
