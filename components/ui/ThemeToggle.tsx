"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full border border-sand/30 bg-maroon/30" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative flex items-center justify-center w-8 h-8 rounded-full border border-sand/40 bg-burgundy/40 dark:bg-dark-surface hover:bg-burgundy/70 dark:hover:bg-dark-surface/90 text-sand hover:text-sand-light transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 group"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-sand transition-transform duration-300 group-hover:rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-sand transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>
    </button>
  );
}
