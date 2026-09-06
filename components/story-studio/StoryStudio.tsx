import React, { useState } from 'react';
import BlockComposer from './BlockComposer';
import MobilePreview from './MobilePreview';
import PassportSummary from './PassportSummary';

export type StoryBlock = 
  | { type: 'heading'; text: string; level: 1 | 2 }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; caption?: string };

export default function StoryStudio({ product }: { product: any }) {
  const [blocks, setBlocks] = useState<StoryBlock[]>(product.storyBlocks || []);
  const [isPublished, setIsPublished] = useState(product.published || false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const addBlock = (type: 'heading' | 'paragraph' | 'image') => {
    const newBlock: StoryBlock = {
      type,
      text: type === 'image' ? '' : '',
      url: type === 'image' ? '' : undefined,
      level: type === 'heading' ? 1 : undefined,
    } as any;
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedBlock: StoryBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f2f3] text-[#201a17]">
      <header className="flex items-center justify-between px-6 py-4 bg-[#f7ece6] border-b border-black/5">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold font-display-section">{product.name}</h1>
          <p className="text-sm text-[#504446]">Story Studio</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-bold uppercase tracking-widest ${isPublished ? 'text-[#4b7052]' : 'text-[#827376]'}`}>
            {isPublished ? '● Live' : '○ Draft'}
          </span>
          <button 
            onClick={() => setIsPublished(!isPublished)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              isPublished 
                ? 'bg-[#f1e6e0] text-[#734753] border border-[#734753]' 
                : 'bg-[#734753] text-white shadow-md hover:bg-[#613146]'
            }`}
          >
            {isPublished ? 'Unpublish' : 'Publish Story'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          <div className="max-w-3xl mx-auto space-y-8">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#827376] mb-4">Story Content</h2>
              <div className="space-y-4">
                <BlockComposer 
                  blocks={blocks} 
                  updateBlock={updateBlock} 
                  removeBlock={removeBlock} 
                  addBlock={addBlock} 
                />
              </div>
            </section>
            <section className="pt-8 border-t border-black/5">
              <PassportSummary product={product} />
            </section>
          </div>
        </div>

        <div className={`w-full md:w-[450px] bg-[#ece0db] border-l border-black/5 relative overflow-hidden ${activeTab === 'edit' ? 'hidden md:block' : 'block'}`}>
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <MobilePreview blocks={blocks} isPublished={isPublished} />
          </div>
        </div>
      </main>

      <div className="md:hidden flex bg-white border-t border-black/5">
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-4 text-sm font-bold ${activeTab === 'edit' ? 'text-[#734753] border-t-2 border-[#734753]' : 'text-[#827376]'}`}
        >
          Edit
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-sm font-bold ${activeTab === 'preview' ? 'text-[#734753] border-t-2 border-[#734753]' : 'text-[#827376]'}`}
        >
          Preview
        </button>
      </div>
    </div>
  );
}
