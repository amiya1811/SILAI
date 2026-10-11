"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key to close dropdown
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const currentOption =
    supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <div
      className="relative inline-block text-left"
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Icon-only trigger: [ Globe Icon ] [ Dropdown Arrow ] */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Select language. Currently selected: ${currentOption.name}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1 p-2 rounded-full bg-burgundy/40 dark:bg-dark-surface border border-sand/30 hover:border-sand/70 text-sand hover:text-sand-light transition cursor-pointer"
        title={`Language: ${currentOption.name} (${currentOption.nativeName})`}
      >
        <Globe className="w-4 h-4 text-sand" />
        <ChevronDown
          className={`w-3 h-3 text-sand/80 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Language selection"
          className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] max-h-80 overflow-y-auto rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/30 dark:border-sand/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-wine dark:text-champagne scrollbar-thin"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-maroon/80 dark:text-sand/80 font-bold border-b border-burgundy/15 dark:border-burgundy/30 pb-1.5 mb-1.5 flex items-center justify-between">
            <span>{t("nav.selectLanguage", "Select Language")}</span>
            <span className="text-[9px] opacity-70">{t("nav.languagesCount", "12 Languages")}</span>
          </div>

          <div className="space-y-0.5">
            {supportedLanguages.map((option) => {
              const isSelected = option.code === language;
              return (
                <button
                  key={option.code}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setLanguage(option.code);
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-burgundy via-maroon to-burgundy text-sand-light font-bold shadow-sm"
                      : "hover:bg-sand/30 dark:hover:bg-burgundy/30 text-wine dark:text-champagne font-medium"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold">{option.nativeName}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected
                          ? "text-sand-light/80"
                          : "text-maroon/70 dark:text-champagne/70"
                      }`}
                    >
                      {option.name}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sand flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
