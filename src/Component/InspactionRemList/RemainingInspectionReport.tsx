import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';

const RemainingInspectionReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await apiClient.get('/api/mobile/InspectionReport/remaininglist');
        if (response.status === 200) {
          setReports(response.data);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const openMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(err => console.error('Failed to open maps:', err));
  };

  const renderStatusBadge = (status: any) => {
    let backgroundColor = '#FFA500'; // Orange for pending
    if (status === 'APPROVED') backgroundColor = '#4CAF50'; // 
    if (status === 'REJECTED') backgroundColor = '#F44336'; // Red

    return (
      <View style={[styles.badge, { backgroundColor }]}>
        <Text style={styles.badgeText}>{status}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {renderStatusBadge(item.approvalStatus)}
      </View>

      <View style={styles.infoRow}>
        <Icon name="location-on" size={18} color="#4285F4" style={styles.icon} />
        <Text style={styles.infoText}>{item.location}</Text>
      </View>

      <TouchableOpacity
        style={styles.coordinatesContainer}
        onPress={() => openMaps(item.latitude, item.longitude)}
      >
        <View style={styles.infoRow}>
          <Icon name="map" size={18} color="#4285F4" style={styles.icon} />
          <Text style={styles.coordinatesText}>
            View on Map
          </Text>
          <Icon name="open-in-new" size={16} color="#4285F4" style={styles.mapIcon} />
        </View>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Shade Count</Text>
          <Text style={styles.statValue}>{item.shadeCount}</Text>
        </View>

        <View style={[styles.statItem, styles.statItemMiddle]}>
          <Text style={styles.statLabel}>Chamber Capacity</Text>
          <Text style={styles.statValue}>{item.chamberCapacityMT} MT</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Stock</Text>
          <Text style={styles.statValue}>{item.totalStockMT} MT</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Icon name="business" size={18} color="#5F6368" style={styles.icon} />
        <Text style={styles.infoLabel}>Vendor</Text>
        <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
        <Text style={styles.infoValue}>{item.vendorName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="account-balance" size={18} color="#5F6368" style={styles.icon} />
        <Text style={styles.infoLabel}>Federation</Text>
        <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
        <Text style={styles.infoValue}>{item.federationName}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Icon name="event" size={16} color="#757575" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {new Date(item.createdDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="error-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Pending Storage Inspection</Text>
        <Text style={styles.headerSubtitle}>
          {reports.length} {reports.length === 1 ? 'report' : 'reports'} pending inspection
        </Text>
      </View>

      {reports.length === 0 ? (
        <View style={styles.centeredEmptyContainer}>
          <Icon name="check-circle" size={48} color="#4CAF50" />
          <Text style={styles.emptyText}>All inspections completed!</Text>
          <Text style={styles.emptySubtext}>No pending reports found</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5F6368',
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 4,
    fontFamily: 'Roboto-Medium',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#3C4043',
    flexShrink: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6c757d',
    marginRight: 8,
  },
  arrowIcon: {
    marginHorizontal: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  }
  ,
  infoValue: {
    fontSize: 15,
    color: '#4a6da7',
    fontWeight: '500',
    flexShrink: 1,
  },
  coordinatesContainer: {
    marginBottom: 12,
  },
  coordinatesText: {
    fontSize: 15,
    color: '#4285F4',
    fontWeight: '500',
  },
  mapIcon: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    backgroundColor: '#f1f5fe',
    borderRadius: 10,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 12,
    color: '#5F6368',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  statValue: {
 fontSize: 14,
        fontWeight: '500',
        color: '#4a6da7',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginVertical: 12,
    textAlign: 'center',
    maxWidth: '80%',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#4CAF50',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5F6368',
    marginTop: 8,
  },
});

export default RemainingInspectionReport;