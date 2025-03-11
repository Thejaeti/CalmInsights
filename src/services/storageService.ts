import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the structure of an anxiety entry
export interface AnxietyEntry {
  id: string;
  level: number;
  category: string;
  notes: string;
  timestamp: number;
}

const STORAGE_KEY = 'anxiety_entries';

// Get all anxiety entries
export const getAnxietyEntries = async (): Promise<AnxietyEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(STORAGE_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Error getting anxiety entries:', error);
    return [];
  }
};

// Save a new anxiety entry
export const saveAnxietyEntry = async (entry: Omit<AnxietyEntry, 'id' | 'timestamp'>): Promise<AnxietyEntry> => {
  try {
    const entries = await getAnxietyEntries();
    
    const newEntry: AnxietyEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    const updatedEntries = [newEntry, ...entries];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    
    return newEntry;
  } catch (error) {
    console.error('Error saving anxiety entry:', error);
    throw error;
  }
};

// Delete an anxiety entry
export const deleteAnxietyEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getAnxietyEntries();
    const updatedEntries = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error deleting anxiety entry:', error);
    throw error;
  }
};

// Clear all anxiety entries
export const clearAllEntries = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing anxiety entries:', error);
    throw error;
  }
}; 