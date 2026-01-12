'use client';

import { useRef, useState, useEffect } from 'react';
import { Article } from '@prisma/client';

export default function ArticleForm({ submitAction, updateAction }: { submitAction: (formData: FormData) => void, updateAction?: (id: string, formData: FormData) => void }) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  useEffect(() => {
    const handleEdit = (e: any) => {
      setEditingArticle(e.detail);
      // Fill form values (simple way for uncontrolled inputs)
      if (formRef.current) {
        const form = formRef.current;
        const article = e.detail as Article;
        (form.elements.namedItem('title') as HTMLInputElement).value = article.title;
        (form.elements.namedItem('category') as HTMLSelectElement).value = article.feed?.category || 'general'; // This might be tricky if feed not included
        (form.elements.namedItem('author') as HTMLInputElement).value = article.author || '';
        (form.elements.namedItem('imageUrl') as HTMLInputElement).value = article.imageUrl || '';
        (form.elements.namedItem('keyword') as HTMLInputElement).value = article.keyword || '';
        (form.elements.namedItem('content') as HTMLTextAreaElement).value = article.content || '';
      }
    };

    window.addEventListener('edit-article', handleEdit);
    return () => window.removeEventListener('edit-article', handleEdit);
  }, []);

  const handleSubmit = async (formData: FormData) => {
      if (editingArticle && updateAction) {
          await updateAction(editingArticle.id, formData);
          setEditingArticle(null); // Reset after update
          formRef.current?.reset();
      } else {
          await submitAction(formData);
          formRef.current?.reset();
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g., limit to 2MB to avoid huge DB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please use an image smaller than 2MB.');
        return;
    }

    setIsUploading(true);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const imageUrl = reader.result as string;

            // Insert into textarea
            if (contentRef.current) {
                const textarea = contentRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                const before = text.substring(0, start);
                const after = text.substring(end);
                
                // Insert HTML image tag
                const insertion = `\n<img src="${imageUrl}" alt="Inserted Image" class="w-full h-auto my-4" />\n`;
                
                textarea.value = before + insertion + after;
                
                // Reset cursor
                const newPos = start + insertion.length;
                textarea.setSelectionRange(newPos, newPos);
                textarea.focus();
            }
            setIsUploading(false);
        };
        reader.onerror = (error) => {
            console.error('Error converting file to base64:', error);
            alert('Failed to process image');
            setIsUploading(false);
        };
    } catch (error) {
      console.error(error);
      alert('Failed to upload image');
      setIsUploading(false);
    } finally {
      // Clear input
      e.target.value = '';
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4 bg-gray-50 p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold text-lg">{editingArticle ? `Editing: ${editingArticle.title}` : 'New Article'}</h3>
         {editingArticle && (
             <button 
                type="button" 
                onClick={() => {
                    setEditingArticle(null);
                    formRef.current?.reset();
                }}
                className="text-xs text-red-600 hover:underline"
            >
                Cancel Edit
            </button>
         )}
      </div>
      <div>
        <label className="block font-sans text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
        <input name="title" required className="w-full border border-gray-300 p-2 font-serif focus:border-black outline-none" placeholder="Enter headline..." />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block font-sans text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
            <select name="category" className="w-full border border-gray-300 p-2 font-sans text-sm focus:border-black outline-none bg-white">
              <option value="general">General</option>
              <option value="world">World</option>
              <option value="business">Business</option>
              <option value="tech">Tech</option>
              <option value="opinion">Opinion</option>
            </select>
         </div>
         <div>
            <label className="block font-sans text-xs font-bold uppercase text-gray-500 mb-1">Author</label>
            <input name="author" className="w-full border border-gray-300 p-2 font-serif focus:border-black outline-none" placeholder="Staff Reporter" />
         </div>
      </div>

      <div>
        <label className="block font-sans text-xs font-bold uppercase text-gray-500 mb-1">Cover Image (Optional)</label>
        {/* Hidden file input for cover image */}
        <input 
          type="file" 
          id="cover-image-upload" 
          className="hidden" 
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) {
              alert('Image is too large. Please use an image smaller than 2MB.');
              return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              const base64 = reader.result as string;
              // Find the text input and set its value
              const urlInput = document.getElementById('cover-image-url-input') as HTMLInputElement;
              if (urlInput) urlInput.value = base64;
            };
          }}
        />
        
        <div className="flex gap-2">
            <input 
                id="cover-image-url-input"
                name="imageUrl" 
                className="flex-1 border border-gray-300 p-2 font-sans text-sm focus:border-black outline-none" 
                placeholder="https://... or upload local image ->" 
            />
            <label 
                htmlFor="cover-image-upload" 
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 text-xs font-bold uppercase cursor-pointer flex items-center"
            >
                Upload
            </label>
        </div>
      </div>

      <div>
        <label className="block font-sans text-xs font-bold uppercase text-gray-500 mb-1">Keyword (Optional, for AI Placeholder)</label>
        <input name="keyword" className="w-full border border-gray-300 p-2 font-sans text-sm focus:border-black outline-none" placeholder="e.g. Economy, AI, Space" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
            <label className="block font-sans text-xs font-bold uppercase text-gray-500">Content</label>
            <div className="relative">
                <input 
                    type="file" 
                    id="content-image-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                />
                <label 
                    htmlFor="content-image-upload" 
                    className={`cursor-pointer text-xs font-bold uppercase text-blue-600 hover:text-blue-800 ${isUploading ? 'opacity-50' : ''}`}
                >
                    {isUploading ? 'Uploading...' : '+ Insert Image'}
                </label>
            </div>
        </div>
        <textarea 
            ref={contentRef}
            name="content" 
            required 
            rows={25} 
            className="w-full border border-gray-300 p-2 font-serif focus:border-black outline-none min-h-[600px]" 
            placeholder="Write your article here... Use the '+ Insert Image' button to add images into the text." 
        />
      </div>
      <button className="w-full bg-black text-white px-4 py-3 font-sans text-sm font-bold uppercase hover:bg-gray-800 transition">
        {editingArticle ? 'Update Article' : 'Publish Article'}
      </button>
    </form>
  );
}
