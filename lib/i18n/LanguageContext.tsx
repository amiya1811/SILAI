"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/translations/en.json";
import hi from "@/translations/hi.json";
import kn from "@/translations/kn.json";
import ta from "@/translations/ta.json";
import te from "@/translations/te.json";
import ml from "@/translations/ml.json";
import or from "@/translations/or.json";
import bn from "@/translations/bn.json";
import gu from "@/translations/gu.json";
import mr from "@/translations/mr.json";
import pa from "@/translations/pa.json";
import as from "@/translations/as.json";

export type SupportedLanguage =
  | "en"
  | "hi"
  | "kn"
  | "ta"
  | "te"
  | "ml"
  | "or"
  | "bn"
  | "gu"
  | "mr"
  | "pa"
  | "as";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
];

const DICTIONARIES: Record<SupportedLanguage, Record<string, any>> = {
  en,
  hi,
  kn,
  ta,
  te,
  ml,
  or,
  bn,
  gu,
  mr,
  pa,
  as,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (k, fb) => fb || k,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

function resolveKeyPath(dict: Record<string, any>, key: string): string | undefined {
  if (!dict) return undefined;
  // 1. Direct flat key match
  if (typeof dict[key] === "string") {
    return dict[key];
  }

  // 2. Dot-separated nested path resolution
  if (key.includes(".")) {
    const parts = key.split(".");
    let current: any = dict;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    if (typeof current === "string") {
      return current;
    }
  }

  return undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    try {
      // 1. Check localStorage first
      const saved = localStorage.getItem("silai_language") as SupportedLanguage;
      if (saved && DICTIONARIES[saved]) {
        setLanguageState(saved);
        return;
      }

      // 2. Check document cookie
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)silai_language=([^;]+)/);
        if (match && DICTIONARIES[match[1] as SupportedLanguage]) {
          setLanguageState(match[1] as SupportedLanguage);
        }
      }
    } catch (e) {
      // Graceful fallback if storage or cookies are blocked
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    if (!DICTIONARIES[lang]) return;
    setLanguageState(lang);
    try {
      localStorage.setItem("silai_language", lang);
      if (typeof document !== "undefined") {
        document.cookie = `silai_language=${lang};path=/;max-age=31536000;SameSite=Lax`;
      }
    } catch (e) {
      // Ignore
    }
  };

  const t = (key: string, fallback?: string): string => {
    const activeDict = DICTIONARIES[language] || DICTIONARIES.en;
    const value = resolveKeyPath(activeDict, key);
    if (value !== undefined) return value;

    // Fall back to English dictionary if translation is missing in selected language
    if (language !== "en") {
      const enValue = resolveKeyPath(DICTIONARIES.en, key);
      if (enValue !== undefined) return enValue;
    }

    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
