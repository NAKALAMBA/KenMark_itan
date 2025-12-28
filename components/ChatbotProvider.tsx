'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Chatbot } from './Chatbot';

interface ChatbotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatbotContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      <Chatbot />
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
}

