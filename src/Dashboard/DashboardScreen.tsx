import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../service/api/apiInterceptors';
import { useDisableBackHandler } from '../service/useDisableBackHandler';





const Dashboard = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [pendingData, setPendingData] = useState<any>(null);

  const [rejectedData, setRejectedData] = useState<any>(null);
  const [insepectionData, setInsepectionData] = useState<any>(null);
  const [remainingData, setRemainingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDisableBackHandler(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [approvedRes, pendingRes, rejectedRes] = await Promise.all([
        apiClient('/api/procurement/count/total?ApprovalStatus=APPROVED'),
        apiClient('/api/procurement/count/total?ApprovalStatus=PENDING'),
        apiClient('/api/procurement/count/total?ApprovalStatus=REJECTED')
      ]);

      setData(approvedRes.data);
      setPendingData(pendingRes.data);
      setRejectedData(rejectedRes.data);

    } catch (err) {
      setError('Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const Inspectiondata = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/InspectionReport/Count');
      if (response.status === 200) {
        setInsepectionData(response.data);
      } else {
        setError('Failed to fetch inspection count');
      }
    } catch (err) {
      setError('Failed to fetch inspection count');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };


  const remainingcount
    = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get('/api/InspectionReport/remainingcount');
        if (response.status === 200) {
          setRemainingData(response.data);
        } else {
          setError('Failed to fetch inspection count');
        }
      } catch (err) {
        setError('Failed to fetch inspection count');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
    Inspectiondata();
    remainingcount();
  }, []);

  const handleCardPress = (status: string) => {
    if (status === 'ALL') {
      navigation.navigate('InspectionList');
    } else if (status === 'Remaining') {
      navigation.navigate('RemainingInspectionReport');
    }

    else {
      navigation.navigate('Procurement List', { status });
    }
  };

  const cards = [
    {
      id: 1,
      title: 'Approved Procurements',
      value: data || '0',
      icon: 'check-circle',
      color: '#4CAF50',
      bgColor: '#ffffff',
      status: 'APPROVED'
    },
    {
      id: 2,
      title: 'Pending Procurements',
      value: pendingData || '0',
      icon: 'pending',
      color: '#FF9800',
      bgColor: '#ffffff',
      status: 'PENDING'
    },
    {
      id: 3,
      title: 'Rejected Procurements',
      value: rejectedData || '0',
      icon: 'cancel',
      color: '#F44336',
      bgColor: '#ffffff',
      status: 'REJECTED'
    },
    {
      id: 4,
      title: 'Total Inspection',
      value: insepectionData || '0',
      icon: 'remove-red-eye',
      color: '#2196F3',
      bgColor: '#ffffff',
      status: 'ALL'
    },


    {
      id: 5,
      title: 'Remaining Inspection Report',
      value: remainingData,
      icon: 'pending-actions',
      color: '#F44336',
      bgColor: '#ffffff',
      status: 'Remaining'
    }

  ];

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => { fetchData(); Inspectiondata(); }} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { width: cardWidth, backgroundColor: card.bgColor }]}
            onPress={() => handleCardPress(card.status)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                <MaterialIcons name={card.icon} size={24} color={card.color} />

              </View>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.viewText}>View Details</Text>
              <MaterialIcons name="chevron-right" size={20} color={card.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',

    minHeight: '100%',
    justifyContent: 'center'
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 17,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: 'red',

    height: 200, // Adjust height as needed

  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',

    fontWeight: '500',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Dashboard