"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type AIProvider = "openai" | "gemini";

interface LLMProviderContextType {
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
}

const LLMProviderContext = createContext<LLMProviderContextType | undefined>(
  undefined
);

const STORAGE_KEY = "admagic-ai-provider";

export function LLMProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProviderState] = useState<AIProvider>("openai");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "openai" || stored === "gemini") {
      setProviderState(stored);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when changed
  const setProvider = (newProvider: AIProvider) => {
    setProviderState(newProvider);
    localStorage.setItem(STORAGE_KEY, newProvider);
  };

  // Don't render children until we've loaded from localStorage
  // This prevents a flash of wrong provider
  if (!isInitialized) {
    return null;
  }

  return (
    <LLMProviderContext.Provider value={{ provider, setProvider }}>
      {children}
    </LLMProviderContext.Provider>
  );
}

export function useLLMProvider() {
  const context = useContext(LLMProviderContext);
  if (context === undefined) {
    throw new Error("useLLMProvider must be used within a LLMProviderProvider");
  }
  return context;
}
