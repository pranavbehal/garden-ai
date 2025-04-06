"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

const SettingsContext = createContext({
  settings: {},
  updateSettings: () => {},
});

const defaultSettings = {
  name: "",
  email: "",
  zipCode: "",
  growingZone: "",
  theme: "light",
  notifications: {
    weather: true,
    plantCare: true,
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const { setTheme } = useTheme();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("garden-ai-settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setTheme(parsed.theme || "light");
    } else {
      setTheme("light");
    }
  }, [setTheme]);

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem("garden-ai-settings", JSON.stringify(updatedSettings));

    // Apply theme when it changes
    if (newSettings.theme) {
      setTheme(newSettings.theme);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
