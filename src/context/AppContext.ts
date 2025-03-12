import React from 'react';
import { AnxietyEntry } from '../services/storageService';

// Create a context to share data between tabs
export const AppContext = React.createContext<{
  entries: AnxietyEntry[];
  refreshEntries: () => Promise<void>;
}>({
  entries: [],
  refreshEntries: async () => {},
}); 