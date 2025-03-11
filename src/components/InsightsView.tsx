import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {deleteAnxietyEntry, AnxietyEntry} from '../services/storageService';

interface InsightsViewProps {
  entries: AnxietyEntry[];
  onRefresh: () => Promise<void>;
}

export const InsightsView: React.FC<InsightsViewProps> = ({entries, onRefresh}) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAnxietyEntry(id);
              await onRefresh(); // Refresh the entries after deletion
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getLevelColor = (level: number) => {
    if (level <= 1) return '#4CAF50'; // Green
    if (level <= 2.5) return '#FFC107'; // Yellow
    if (level <= 4) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const renderItem = ({item}: {item: AnxietyEntry}) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={[styles.levelBadge, {backgroundColor: getLevelColor(item.level)}]}>
          <Text style={styles.levelText}>{item.level.toFixed(1)}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
      </View>
      
      {item.category ? (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Trigger:</Text>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      ) : null}
      
      {item.notes ? (
        <Text style={styles.notesText}>{item.notes}</Text>
      ) : null}
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Anxiety History</Text>
      
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No anxiety entries yet</Text>
          <Text style={styles.emptySubtext}>
            Your recorded anxiety levels will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryLabel: {
    fontWeight: '600',
    marginRight: 4,
    color: '#555',
  },
  categoryText: {
    color: '#333',
  },
  notesText: {
    color: '#333',
    marginTop: 8,
    marginBottom: 16,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default InsightsView; 