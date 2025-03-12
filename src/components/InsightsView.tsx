import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {deleteAnxietyEntry, AnxietyEntry} from '../services/storageService';
import {LineChart} from 'react-native-chart-kit';
import {COLORS} from '../theme/colors';

interface InsightsViewProps {
  entries: AnxietyEntry[];
  onRefresh: () => Promise<void>;
}

const InsightsView: React.FC<InsightsViewProps> = ({entries, onRefresh}) => {
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
    if (level <= 1) return COLORS.teal;     // Calm
    if (level <= 2.5) return COLORS.blue;   // Mild
    if (level <= 4) return COLORS.orange;   // Moderate
    return COLORS.red;                      // Severe
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.navy,
    backgroundGradientTo: COLORS.navy,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(90, 175, 176, ${opacity})`, // COLORS.teal
    labelColor: (opacity = 1) => `rgba(242, 208, 164, ${opacity})`, // COLORS.cream
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.blue,
    },
  };

  // Prepare data for chart if we have entries
  const prepareChartData = () => {
    if (entries.length < 2) return null;

    // Sort entries by timestamp
    const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    
    // Take up to the last 7 entries
    const recentEntries = sortedEntries.slice(-7);
    
    // Format data for the chart
    return {
      labels: recentEntries.map(entry => {
        const date = new Date(entry.timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: recentEntries.map(entry => entry.level),
          color: (opacity = 1) => `rgba(90, 175, 176, ${opacity})`, // COLORS.teal
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = prepareChartData();

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
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Loading entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Anxiety History</Text>
      
      {chartData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Recent Anxiety Levels</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}
      
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No anxiety entries yet</Text>
          <Text style={styles.emptySubtext}>
            Your recorded anxiety levels will appear here
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Your Entries</Text>
          <FlatList
            data={entries.sort((a, b) => b.timestamp - a.timestamp)} // Sort newest first
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={COLORS.teal} 
              />
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.lightText,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
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
    borderWidth: 2,
    borderColor: COLORS.cream,
  },
  levelText: {
    color: COLORS.lightText,
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 1,
  },
  dateText: {
    color: COLORS.cream,
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryLabel: {
    fontWeight: '600',
    marginRight: 4,
    color: COLORS.teal,
  },
  categoryText: {
    color: COLORS.lightText,
  },
  notesText: {
    color: COLORS.lightText,
    marginTop: 8,
    marginBottom: 16,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.red,
    borderWidth: 1,
    borderColor: COLORS.cream,
  },
  deleteButtonText: {
    color: COLORS.lightText,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.cream,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.teal,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.cream,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.lightText,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartPlaceholder: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: COLORS.cream,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.teal,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default InsightsView; 