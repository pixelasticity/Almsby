import React from 'react';
import { StoryBlock } from './StoryStudio';

interface MobilePreviewProps {
  blocks: StoryBlock[];
  isPublished: boolean;
}

export default function MobilePreview({ blocks, isPublished }: MobilePreviewProps) {
  return (
    <div className="w-[375px] h-[667px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-[#201a17] overflow-hidden relative ring-4 ring-black/5">
      {/* Status Bar */}
      <div className="h-6 bg-white px-6 flex justify-between items-center text-[10px] font-bold text-black/40">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-black/20 rounded-full" />
          <div className="w-3 h-3 bg-black/20 rounded-full" />
        </div>
      </div>

      {/* Page Content */}
      <div className="h-full overflow-y-auto bg-[#fff8f5] text-[#201a17] font-body-base">
        {!isPublished && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 bg-[#fdf1ec] rounded-full flex items-center justify-center mb-4 text-[#734753]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold font-display-section text-[#734753] mb-2">Coming Soon</h3>
            <p className="text-xs text-[#504446] leading-relaxed">The maker is still crafting this story. Check back soon for a glimpse into the process.</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {blocks.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <p className="text-sm italic">Start adding blocks to see the story unfold...</p>
            </div>
          ) : (
            blocks.map((block, index) => {
              if (block.type === 'heading') {
                return (
                  <h2 
                    key={index} 
                    className={`font-display-section font-bold text-[#734753] leading-tight ${block.level === 1 ? 'text-3xl' : 'text-xl'}`}
                  >
                    {block.text || 'Untitled Heading'}
                  </h2>
                );
              }
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className="text-sm leading-relaxed text-[#504446]">
                    {block.text || 'Paragraph content goes here...'}
                  </p>
                );
              }
              if (block.type === 'image') {
                return (
                  <div key={index} className="space-y-2">
                    <div className="aspect-square bg-[#ece0db] rounded-2xl overflow-hidden shadow-inner">
                      {block.url ? (
                        <img src={block.url} alt="Story asset" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#827376] uppercase tracking-widest font-bold">
                          Image Asset
                        </div>
                      )}
                    </div>
                    {block.caption && (
                      <p className="text-[10px] text-center italic text-[#827376]">{block.caption}</p>
                    )}
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      </div>
    </div>
  );
}
