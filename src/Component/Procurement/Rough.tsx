import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
  TextInput,
    BackHandler
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, RouteProp ,  useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 5;

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
    const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { status } = route.params;
  const [selectedStatus, setSelectedStatus] = useState(status || 'ALL');
  const [data, setData] = useState<ProcurementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);



    const openMapWithDirections = async (destLat: number, destLon: number) => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission denied');
          // Fallback to just showing destination
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destLat},${destLon}`);
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        const url = `https://www.google.com/maps/dir/?api=1&origin=${location.coords.latitude},${location.coords.longitude}&destination=${destLat},${destLon}&travelmode=driving`;
        Linking.openURL(url);
      } catch (error) {
        console.error('Error getting location:', error);
        // Fallback if location access fails
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destLat},${destLon}`);
      }
    };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMore(true);
      setData([]);
      setSearchQuery('');
      setIsSearching(false);
      fetchStatusData(selectedStatus, 1, '');
    }, [selectedStatus])
  );


    useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true; // Prevent default behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
  );


  useEffect(() => {
    if (status) {
      setSelectedStatus(status);
    }
  }, [status]);

  useEffect(() => {
    console.log("Received status from Dashboard:", status);
    fetchStatusData(selectedStatus, 1);
  }, [status]);

  const fetchStatusData = async (status: string, pageNumber: number, query: string = '') => {
    if ((!hasMore && pageNumber !== 1) || loading) return;

    setLoading(true);
    try {
      let url = `/api/mobile/procurement/list?ApprovalStatus=${status}&PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;
      
      if (query) {
        url += `&Search=${encodeURIComponent(query)}`;
      }

      const response = await apiClient.get(url);

      if (response.data.length > 0) {
        if (pageNumber === 1) {
          setData(response.data);
        } else {
          setData(prevData => [...prevData, ...response.data]);
        }
        setHasMore(response.data.length === PAGE_SIZE);
      } else {
        if (pageNumber === 1) {
          setData([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setIsSearching(true);
      setPage(1);
      setHasMore(true);
      fetchStatusData(selectedStatus, 1, query);
    } else {
      setIsSearching(false);
      setPage(1);
      setHasMore(true);
      fetchStatusData(selectedStatus, 1);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStatusData(selectedStatus, nextPage, isSearching ? searchQuery : '');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setIsSearching(false);
    setSearchQuery('');
    fetchStatusData(selectedStatus, 1);
  };

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
      case 'APPROVED': return '#28a745';
      case 'PENDING': return '#ff9500';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
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
                  onPress={() => openMapWithDirections(item.latitude, item.longitude)}
                >
                  <Icon name="map" size={18} color="#fff" />
                  <Text style={styles.mapButtonText}>Get Directions</Text>
                </TouchableOpacity>

      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by farmer, federation, vendor, center..."
          placeholderTextColor="#adb5bd"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        <Icon name="search" size={20} color="#495057" style={styles.searchIcon} />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>FILTER BY STATUS</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(itemValue) => {
              setSelectedStatus(itemValue);
              setPage(1);
              setHasMore(true);
              setSearchQuery('');
              setIsSearching(false);
              fetchStatusData(itemValue, 1);
            }}
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

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={40} color="#adb5bd" />
              <Text style={styles.emptyText}>
                {isSearching ? 'No matching records found' : 'No procurement records found'}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator size="large" color="#4361ee" />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
    fontSize: 14,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
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
    borderWidth: 2,
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