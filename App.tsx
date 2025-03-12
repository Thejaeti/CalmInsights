/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect, useCallback} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AnxietyTracker from './src/components/AnxietyTracker';
import InsightsView from './src/components/InsightsView';
import {getAnxietyEntries, AnxietyEntry} from './src/services/storageService';
import {AppContext} from './src/context/AppContext';
import {COLORS} from './src/theme/colors';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const [entries, setEntries] = useState<AnxietyEntry[]>([]);
  
  const refreshEntries = useCallback(async () => {
    try {
      const data = await getAnxietyEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }, []);
  
  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const AnxietyTrackingScreen = () => (
    <SafeAreaView style={styles.screen}>
      <AnxietyTracker onSave={refreshEntries} />
    </SafeAreaView>
  );
  
  const InsightsScreen = () => (
    <SafeAreaView style={styles.screen}>
      <InsightsView entries={entries} onRefresh={refreshEntries} />
    </SafeAreaView>
  );

  const SettingsScreen = () => (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Coming soon: Customize your experience</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <AppContext.Provider value={{entries, refreshEntries}}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName = '';
              if (route.name === 'Track') {
                iconName = 'add-circle-outline';
              } else if (route.name === 'Insights') {
                iconName = 'bar-chart-outline';
              } else if (route.name === 'Settings') {
                iconName = 'settings-outline';
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.teal,
            tabBarInactiveTintColor: COLORS.cream,
            tabBarStyle: {
              backgroundColor: COLORS.navy,
              borderTopColor: COLORS.blue,
              borderTopWidth: 2,
              height: 60,
              paddingBottom: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerShown: false,
          })}>
          <Tab.Screen name="Track" component={AnxietyTrackingScreen} />
          <Tab.Screen name="Insights" component={InsightsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.darkBg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.lightText,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.cream,
    textAlign: 'center',
  },
});

export default App;
