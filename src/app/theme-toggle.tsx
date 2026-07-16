"use client";

import { useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "station-desk-theme";
const THEME_CHANGE_EVENT = "station-theme-change";

function subscribeToThemeChange(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToThemeChange, getThemeSnapshot, getServerThemeSnapshot);
  let modeLabel = "Тёмная";
  let indicatorClass = "theme-toggle__indicator";

  if (isDark) {
    modeLabel = "Светлая";
    indicatorClass = "theme-toggle__indicator theme-toggle__indicator--active";
  }

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    let storedTheme = "light";

    if (nextIsDark) {
      storedTheme = "dark";
    }

    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem(THEME_STORAGE_KEY, storedTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button aria-label={`Включить режим: ${modeLabel}`} aria-pressed={isDark} className="theme-toggle" onClick={toggleTheme} type="button">
      <span aria-hidden="true" className={indicatorClass} />
      <span>{modeLabel}</span>
    </button>
  );
}
