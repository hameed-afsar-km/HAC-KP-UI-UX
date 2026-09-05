'use client';

import React, { useState } from 'react';
import { Question, X, CaretLeft, CaretRight } from '@phosphor-icons/react';

const HELP_PAGES = [
  { 
    title: 'Overview', 
    desc: 'The starting point. See all active cases, quick metrics, and latest activities across your investigations.' 
  },
  { 
    title: 'Case Files', 
    desc: 'Your secure evidence vault. Upload logs, documents, and reports. All files are tamper-proofed.' 
  },
  { 
    title: 'Analysis Jobs', 
    desc: 'The extraction engine. ARGUS AI processes your files to pull out people, devices, transactions, and locations.' 
  },
  { 
    title: 'Officer Verification', 
    desc: 'The human-in-the-loop audit step. Review and approve the AI\'s findings before they enter the case database.' 
  },
  { 
    title: 'Match People', 
    desc: 'Identity resolution. ARGUS AI suggests when different aliases or devices might belong to the same real-world person.' 
  },
  { 
    title: 'Connections Map', 
    desc: 'The visual network graph. See how every entity connects, spot hidden rings, and find central targets.' 
  },
  { 
    title: 'Ontology', 
    desc: 'The ontology dictionary. See all the categories and relationship types ARGUS AI uses to classify data.' 
  }
];

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => setCurrentIndex((p) => (p + 1) % HELP_PAGES.length);
  const handlePrev = () => setCurrentIndex((p) => (p - 1 + HELP_PAGES.length) % HELP_PAGES.length);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 h-12 w-12 rounded-full bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] shadow-lg flex items-center justify-center text-[#555E6D] dark:text-[#A7A7A7] hover:text-[#0D0F14] dark:hover:text-[#F9F9F9] hover:border-[#CBD5E1] dark:hover:border-[#646464] hover:scale-105 transition-all duration-300 cursor-pointer"
        aria-label="Help"
      >
        <Question size={24} weight="bold" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#111111] border border-[#E2E6F0] dark:border-[#333333] shadow-2xl p-8 overflow-hidden animate-slide-in-up">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#8B95AD] dark:text-white/50 hover:text-[#0D0F14] dark:hover:text-white hover:bg-[#F6F7FB] dark:hover:bg-white/10 transition-colors"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Gallery Content */}
            <div className="text-center mt-2 mb-6 min-h-[140px] flex flex-col justify-center">
              <span className="inline-block px-2.5 py-1 mb-4 rounded-lg bg-[#E85002]/10 text-[#E85002] border border-[#E85002]/30 text-[10px] font-mono font-bold uppercase tracking-widest self-center">
                Page {currentIndex + 1} of {HELP_PAGES.length}
              </span>
              <h3 className="text-2xl font-bold text-[#0D0F14] dark:text-[#F9F9F9] mb-3">
                {HELP_PAGES[currentIndex].title}
              </h3>
              <p className="text-[14px] text-[#555E6D] dark:text-[#A7A7A7] leading-relaxed">
                {HELP_PAGES[currentIndex].desc}
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between gap-4 mt-6">
              <button 
                onClick={handlePrev}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-[#F6F7FB] dark:bg-white/5 border border-[#E2E6F0] dark:border-white/10 text-[#0D0F14] dark:text-white hover:bg-[#ECEFF5] dark:hover:bg-white/20 hover:scale-110 transition-all cursor-pointer"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {HELP_PAGES.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-[#E85002]' : 'w-1.5 bg-[#E2E6F0] dark:bg-white/20'}`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-[#F6F7FB] dark:bg-white/5 border border-[#E2E6F0] dark:border-white/10 text-[#0D0F14] dark:text-white hover:bg-[#ECEFF5] dark:hover:bg-white/20 hover:scale-110 transition-all cursor-pointer"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
