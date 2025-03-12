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
import {COLORS} from '../theme/colors';
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

const AnxietyTracker: React.FC<AnxietyTrackerProps> = ({onSave}) => {
  const [anxietyLevel, setAnxietyLevel] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleQuickLevel = (level: number) => {
    setAnxietyLevel(level);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleSave = async () => {
    if (anxietyLevel === 0 && !selectedCategory && !notes.trim()) {
      Alert.alert('Empty Entry', 'Please add some information about your anxiety level, trigger, or notes.');
      return;
    }

    try {
      setIsSaving(true);
      await saveAnxietyEntry({
        level: anxietyLevel,
        category: selectedCategory,
        notes: notes.trim(),
      });
      
      // Reset form after successful save
      setAnxietyLevel(0);
      setSelectedCategory('');
      setNotes('');
      
      // Call the onSave callback to refresh entries in the parent component
      if (onSave) {
        await onSave();
      }
      
      Alert.alert('Success', 'Your anxiety entry has been saved.');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'There was a problem saving your entry. Please try again.');
    } finally {
      setIsSaving(false);
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
          minimumTrackTintColor={COLORS.teal}
          maximumTrackTintColor={COLORS.border}
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
          placeholderTextColor={COLORS.cream}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color={COLORS.cream} />
        ) : (
          <Text style={styles.saveButtonText}>Save Entry</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.lightText,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.teal,
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: COLORS.blue,
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 1,
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
    backgroundColor: COLORS.navy,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  quickButtonActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.cream,
  },
  quickButtonText: {
    fontSize: 12,
    color: COLORS.cream,
  },
  quickButtonTextActive: {
    color: COLORS.lightText,
    fontWeight: 'bold',
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
    backgroundColor: COLORS.navy,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.cream,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.cream,
  },
  categoryButtonTextActive: {
    color: COLORS.lightText,
    fontWeight: 'bold',
  },
  notesInput: {
    height: 100,
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.lightText,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  saveButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.cream,
  },
  saveButtonText: {
    color: COLORS.lightText,
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default AnxietyTracker; 