import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {deleteAnxietyEntry, AnxietyEntry} from '../services/storageService';
import {LineChart} from 'react-native-chart-kit';

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
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
    });
  };

  const getLevelColor = (level: number) => {
    if (level <= 1) return '#4CAF50'; // Green
    if (level <= 2.5) return '#FFC107'; // Yellow
    if (level <= 4) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (entries.length < 1) {
      // Default data if there are no entries
      return {
        labels: [''],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    // Sort entries by timestamp (oldest first)
    const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    
    // Take only the last 7 entries (or fewer if we don't have 7)
    const recentEntries = sortedEntries.slice(-7);
    
    return {
      labels: recentEntries.map(entry => formatShortDate(entry.timestamp)),
      datasets: [
        {
          data: recentEntries.map(entry => entry.level),
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4A90E2',
    },
  };

  const renderItem = ({item}: {item: AnxietyEntry}) => (
    <View style={styles.entryCard} key={item.id}>
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
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>Your Anxiety History</Text>
        
        {entries.length >= 2 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Anxiety Levels Over Time</Text>
            <LineChart
              data={prepareChartData()}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No anxiety entries yet</Text>
            <Text style={styles.emptySubtext}>
              Your recorded anxiety levels will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>
              Add more entries to see your anxiety trend chart
            </Text>
          </View>
        )}
        
        {entries.length > 0 && (
          <View style={styles.entriesContainer}>
            <Text style={styles.sectionTitle}>All Entries</Text>
            {entries.map(item => renderItem({item}))}
          </View>
        )}
      </ScrollView>
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
    marginBottom: 8,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF5252',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  entriesContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
});

export default InsightsView; 