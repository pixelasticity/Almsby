import React from 'react';
import { StoryBlock } from './StoryStudio';

interface BlockComposerProps {
  blocks: StoryBlock[];
  updateBlock: (index: number, block: StoryBlock) => void;
  removeBlock: (index: number) => void;
  addBlock: (type: 'heading' | 'paragraph' | 'image') => void;
}

export default function BlockComposer({ blocks, updateBlock, removeBlock, addBlock }: BlockComposerProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div key={index} className="group relative bg-white p-4 rounded-xl border border-black/5 shadow-sm hover:border-[#734753]/30 transition-colors">
          <button 
            onClick={() => removeBlock(index)}
            className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 bg-white text-red-500 rounded-full p-1 shadow-sm border border-black/5 transition-all hover:bg-red-50"
            title="Remove block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {block.type === 'heading' && (
            <div className="space-y-2">
              <select 
                value={block.level}
                onChange={(e) => updateBlock(index, { ...block, level: parseInt(e.target.value) as 1 | 2 })}
                className="text-xs font-bold uppercase tracking-tighter text-[#827376] bg-transparent outline-none cursor-pointer"
              >
                <option value={1}>H1 - Hero</option>
                <option value={2}>H2 - Section</option>
              </select>
              <input 
                type="text" 
                value={block.text}
                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                placeholder="Enter headline..."
                className="w-full text-lg font-bold font-display-section bg-transparent outline-none placeholder:text-[#d4c2c5]"
              />
            </div>
          )}

          {block.type === 'paragraph' && (
            <textarea 
              value={block.text}
              onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
              placeholder="Tell the story..."
              rows={3}
              className="w-full text-sm font-body-base bg-transparent outline-none resize-none placeholder:text-[#d4c2c5]"
            />
          )}

          {block.type === 'image' && (
            <div className="space-y-3">
              <div className="aspect-video bg-[#f1e6e0] rounded-lg flex items-center justify-center border-2 border-dashed border-[#d4c2c5] overflow-hidden">
                {block.url ? (
                  <img src={block.url} alt="Story asset" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-[#827376]">No image uploaded</span>
                )}
              </div>
              <input 
                type="text" 
                value={block.url}
                onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                placeholder="R2 Image URL..."
                className="w-full text-xs font-body-base bg-transparent outline-none border-b border-black/5 pb-1 placeholder:text-[#d4c2c5]"
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-center gap-3 pt-4">
        <button 
          onClick={() => addBlock('heading')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 text-xs font-bold text-[#504446] hover:border-[#734753] transition-all shadow-sm"
        >
          <span className="text-[#734753]">+</span> Heading
        </button>
        <button 
          onClick={() => addBlock('paragraph')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 text-xs font-bold text-[#504446] hover:border-[#734753] transition-all shadow-sm"
        >
          <span className="text-[#734753]">+</span> Paragraph
        </button>
        <button 
          onClick={() => addBlock('image')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 text-xs font-bold text-[#504446] hover:border-[#734753] transition-all shadow-sm"
        >
          <span className="text-[#734753]">+</span> Photo
        </button>
      </div>
    </div>
  );
}
