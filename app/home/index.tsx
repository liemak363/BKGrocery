import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Button, StatusBar } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { AppDispatch } from "../../store/globalStore";
import { useDispatch } from "react-redux";
import { resetFirstInstall } from "../../store/globalAction";

import Header from '@/components/ui/header';
import UserInfoCard from '@/components/ui/UserInfo';
import InfoCard from '@/components/ui/InfoCard';
import WeeklyRevenueCard from '@/components/ui/WeeklyRevenueCard';
import FeatureItem from '@/components/ui/FeatureItem';
import BottomNavBar from '@/components/ui/BottomNavBar';

export default function explore() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState('Home');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    // Handle navigation here
  };

  return (
    <View>
    <ScrollView style={styles.container}>
      {/* Làm trong suốt thanh trạng thái */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Header />

      {/* User Info */}
      <View style={styles.subcontainer} >
        <View style={styles.userSection}>
          <UserInfoCard
            name="John Wick"
            role="Owner"
            initial="J"
            onPress={() => console.log('User card tapped')}
          />

          <View style={styles.statsRow}>
            <InfoCard 
              value="30657 $"
              label="Total revenue"
              onPress={() => console.log('Revenue card pressed')}
            />

            <InfoCard 
              value={1004}
              label="Total item"
              onPress={() => console.log('Total item card pressed')}
            />
          </View>
        </View>

        {/* Week's Revenue Graph (Mocked)
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>Week's revenue</Text>
            <View style={styles.revenueGrowth}>
              <Text style={styles.growthValue}>1.3%</Text>
              <Ionicons name="arrow-up" size={14} color="green" />
              <Text style={styles.growthLabel}>VS LAST WEEK</Text>
            </View>
          </View>
          <Text style={styles.revenueAmount}>6,345 $</Text>
          <Image source={require('./mock-graph.png')} style={styles.graphImage} />
        </View> */}

        <WeeklyRevenueCard
          title="Week’s Revenue"
          total="16,345 $"
          percentageChange="1.3%"
          changeLabel="VS LAST WEEK"
          data={[3900, 600, 950, 500, 1900, 900, 2900]}
        />

      <View style={{marginBottom: 100}}>
        <Text style={styles.mainFeatureTitle}>Main feature</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>

          <FeatureItem image={require('../../assets/images/warehouse.png')} label="Warehouse" />
          <FeatureItem image={require('../../assets/images/import.png')} label="Import" />
          <FeatureItem image={require('../../assets/images/historyicon.png')} label="History" />
          <FeatureItem image={require('../../assets/images/scanicon.png')} label="Scan item" />
          <FeatureItem image={require('../../assets/images/receipicon.png')} label="Receipt" />
          <FeatureItem image={require('../../assets/images/settingicon.png')} label="Setting" />
          {/* Add more as needed */}
        </View>
      </View>

        
      </View>
    </ScrollView>
    <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const FeatureIcon = ({ name, label }: { name: string; label: string }) => (
  <View style={styles.featureIcon}>
    <FontAwesome5 name={name} size={20} color="#4CAF50" />
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

const NavIcon = ({ name, active }: { name: string; active: boolean }) => (
  <TouchableOpacity style={active ? styles.navIconActive : styles.navIcon}>
    <FontAwesome5 name={name} size={20} color={active ? '#fff' : '#4CAF50'} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECFCCB',
  },
  subcontainer: {
    backgroundColor: '#ECFCCB',
    flex: 1,
    // padding: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#76AB56',
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
  },
  userSection: {
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F6C9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#76AB56',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userRole: {
    color: 'gray',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#E3F6C9',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  statLabel: {
    color: 'gray',
    fontSize: 12,
  },
  revenueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revenueTitle: {
    fontWeight: 'bold',
  },
  revenueGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthValue: {
    color: 'green',
    fontWeight: 'bold',
  },
  growthLabel: {
    fontSize: 10,
    color: 'gray',
  },
  revenueAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  graphImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  featureSection: {
    marginBottom: 24,
  },
  mainFeatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureIcon: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  featureLabel: {
    marginTop: 6,
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  navIcon: {
    padding: 8,
  },
  navIconActive: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
  },
});
