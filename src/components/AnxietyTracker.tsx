import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {saveAnxietyEntry} from '../services/storageService';

const QUICK_LEVELS = [
  {value: 0, label: 'None'},
  {value: 1, label: 'Mild'},
  {value: 2.5, label: 'Moderate'},
  {value: 4, label: 'High'},
  {value: 5, label: 'Extreme'},
];

const TRIGGER_CATEGORIES = [
  'Work',
  'Relationships',
  'Health',
  'Environment',
  'Other',
];

interface AnxietyTrackerProps {
  onSave?: () => Promise<void>;
}

export const AnxietyTracker: React.FC<AnxietyTrackerProps> = ({onSave}) => {
  const [anxietyLevel, setAnxietyLevel] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const handleQuickLevel = (level: number) => {
    setAnxietyLevel(level);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleSave = async () => {
    if (anxietyLevel === 0 && !selectedCategory && !notes) {
      Alert.alert('Empty Entry', 'Please add some information before saving.');
      return;
    }

    try {
      setSaving(true);
      await saveAnxietyEntry({
        level: anxietyLevel,
        category: selectedCategory,
        notes,
      });
      
      // Reset form
      setAnxietyLevel(0);
      setSelectedCategory('');
      setNotes('');
      
      Alert.alert('Success', 'Your anxiety entry has been saved.');
      
      // Call the onSave callback if provided
      if (onSave) {
        await onSave();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How anxious are you feeling?</Text>
        <Text style={styles.levelText}>{anxietyLevel.toFixed(1)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={5}
          step={0.5}
          value={anxietyLevel}
          onValueChange={setAnxietyLevel}
          minimumTrackTintColor="#4A90E2"
          maximumTrackTintColor="#DEDEDE"
        />
        <View style={styles.quickLevels}>
          {QUICK_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.quickButton,
                anxietyLevel === level.value && styles.quickButtonActive,
              ]}
              onPress={() => handleQuickLevel(level.value)}>
              <Text
                style={[
                  styles.quickButtonText,
                  anxietyLevel === level.value && styles.quickButtonTextActive,
                ]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's triggering these feelings?</Text>
        <View style={styles.categories}>
          {TRIGGER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategorySelect(category)}>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any notes about how you're feeling..."
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginVertical: 20,
  },
  slider: {
    height: 40,
  },
  quickLevels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  quickButtonActive: {
    backgroundColor: '#4A90E2',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#666',
  },
  quickButtonTextActive: {
    color: 'white',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4A90E2',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  notesInput: {
    height: 100,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnxietyTracker; 