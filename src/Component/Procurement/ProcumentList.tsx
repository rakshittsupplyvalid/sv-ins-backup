import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';

const { width } = Dimensions.get('window');

type ProcurementItem = {
  id: string;
  federationName: string;
  vendorName: string;
  farmerName: string;
  procureCenterName: string;
  procureDate: string;
  quantityMT: number;
  purchaseValue: number;
  ratePerKg: number;
  approvalStatus: string;
  quantityStoredMT: number;
  quantityDispatchedMT: number;
  remainingStoredMT: number;
  subSeasonId: string;
  subSeasonName: string;
  latitude: number;
  longitude: number;
  isDispute: boolean;
  quality: string;
};

type RouteParams = {
  params: {
    status: string;
  };
};

const ProcumentList = () => {
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { status } = route.params;
  const [selectedStatus, setSelectedStatus] = useState(status || 'ALL');
  const [data, setData] = useState<ProcurementItem[]>([]);
  const [loading, setLoading] = useState(false);


  
    useEffect(() => {
    if (status) {
      setSelectedStatus(status);
    }
  }, [status]);

  useEffect(() => {
    console.log("Received status from Dashboard:", status);
    fetchStatusData(status);
  }, [status]);

  const fetchStatusData = async (status: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/procurement/list?ApprovalStatus=${status}`);
      setData(response.data);
      console.log('Fetched data:', response.data);
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusData(selectedStatus);
  }, [selectedStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#28a745'; // Green
      case 'PENDING': return '#ff9500';  // Orange
      case 'REJECTED': return '#dc3545'; // Red
      default: return '#6c757d';         // Gray
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'High': return '#28a745';
      case 'Medium': return '#ffc107';
      case 'Low': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderItem = ({ item }: { item: ProcurementItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.approvalStatus) }]}>
          <Text style={styles.statusText}>{item.approvalStatus}</Text>
        </View>
        <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(item.quality) }]}>
          <Text style={styles.qualityText}>{item.quality} Quality</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}>
            <Icon name="business" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Procure Center</Text>
            <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
            <Text style={styles.infoValue}>{item.procureCenterName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="people" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Federation</Text>
            <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
            <Text style={styles.infoValue}>{item.federationName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="person" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Farmer</Text>
            <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
            <Text style={styles.infoValue}>{item.farmerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="date-range" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Date</Text>
            <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
            <Text style={styles.infoValue}>{formatDate(item.procureDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Procurement Details</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantity (MT)</Text>
              <Text style={styles.detailValue}>{item.quantityMT.toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rate (₹/kg)</Text>
              <Text style={styles.detailValue}>{item.ratePerKg}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Value</Text>
              <Text style={styles.detailValue}>₹{formatNumber(item.purchaseValue)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Information</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stored (MT)</Text>
              <Text style={styles.detailValue}>{item.quantityStoredMT.toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Dispatched (MT)</Text>
              <Text style={styles.detailValue}>{item.quantityDispatchedMT.toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Remaining (MT)</Text>
              <Text style={[styles.detailValue, { color: '#28a745' }]}>{item.remainingStoredMT.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.infoRow}>
            <Icon name="agriculture" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Season</Text>
            <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
            <Text style={styles.infoValue}>{item.subSeasonName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="warning" size={16} color={item.isDispute ? '#dc3545' : '#6c757d'} />
            <Text style={styles.infoText}>Status</Text>
            <Icon name="arrow-forward" size={16} color="#6c757d" style={styles.arrowIcon} />
            <Text style={[styles.infoValue, { color: item.isDispute ? '#dc3545' : '#495057' }]}>
              {item.isDispute ? 'Dispute Reported' : 'No Dispute'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
            Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
          }}
        >
          <Icon name="map" size={18} color="#fff" />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>FILTER BY STATUS</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedStatus}
               onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            style={styles.picker}
            dropdownIconColor="#495057"
          >
                <Picker.Item label="All" value="ALL" />
            <Picker.Item label="Approved" value="APPROVED" />
            <Picker.Item label="Pending" value="PENDING" />
            <Picker.Item label="Rejected" value="REJECTED" />
          </Picker>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={40} color="#adb5bd" />
              <Text style={styles.emptyText}>No procurement records found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
   
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#212529',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    
    borderWidth : 2,
    borderColor: '#e9ecef',
    
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  qualityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
 
    fontFamily: 'Poppins-Regular',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    width: 100,
     fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
    flexShrink: 1,
      fontFamily: 'Poppins-Regular',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  mapButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F79B00',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#adb5bd',
    marginTop: 16,
  },
});

export default ProcumentList;