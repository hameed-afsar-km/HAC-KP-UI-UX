'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from '@phosphor-icons/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        relative w-14 h-7 rounded-full border transition-all duration-300 cursor-pointer
        flex items-center
        ${isDark
          ? 'bg-[#1E2435] border-[#252D3E]'
          : 'bg-[#F1F3F9] border-[#E2E6F0]'
        }
      `}
    >
      {/* Track icons */}
      <Sun  size={12} className="absolute left-2 text-[#F59E0B] transition-opacity duration-200" style={{ opacity: isDark ? 0.3 : 1 }} />
      <Moon size={12} className="absolute right-2 text-[#8B95AD] transition-opacity duration-200" style={{ opacity: isDark ? 1 : 0.3 }} />

      {/* Thumb */}
      <span
        className={`
          absolute h-5 w-5 rounded-full shadow-sm
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isDark
            ? 'translate-x-7 bg-[#E85002] shadow-[0_0_8px_rgba(232,80,2,0.4)]'
            : 'translate-x-1 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)]'
          }
        `}
      />
    </button>
  );
}
