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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';

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
  rejectQuantityMT: number;
  subSeasonId: string;
  subSeasonName: string;
  latitude: number;
  longitude: number;
  isDispute: boolean;
  quality: string;
  partialStatus?: string;
};

type RouteParams = {
  params: {
    status: string;
  };
};

type RootStackParamList = {
  Dashboard: undefined;
  // add other route names if needed
};

const ProcurementList = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { status } = route.params;
  const [selectedStatus, setSelectedStatus] = useState(status || 'ALL');
  const [selectedPartialStatus, setSelectedPartialStatus] = useState<string[]>([]);
  const [data, setData] = useState<ProcurementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Date formatting utilities
  const formatDateForAPI = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString; // fallback if parsing fails
    }
  };

  const openMapWithDirections = async (destLat: number, destLon: number) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destLat},${destLon}`);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.coords.latitude},${location.coords.longitude}&destination=${destLat},${destLon}&travelmode=driving`;
      Linking.openURL(url);
    } catch (error) {
      console.error('Error getting location:', error);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destLat},${destLon}`);
    }
  };

  const fetchStatusData = async (status: string, pageNumber: number, query: string = '', date: Date | null = null) => {
    if ((!hasMore && pageNumber !== 1) || loading) return;

    setLoading(true);
    try {
      let url = `/api/mobile/procurement/list?PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;

      if (selectedPartialStatus.includes('PARTIALLYREJECTED')) {
        url += `&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`;
        url += `&PartialStatus=PARTIALLYAPPROVED&PartialStatus=FULLYREJECT`;
      } else {
        if (status !== 'ALL') {
          url += `&ApprovalStatus=${status}`;
        }

        if (selectedPartialStatus.length > 0) {
          selectedPartialStatus.forEach(partialStatus => {
            url += `&PartialStatus=${partialStatus}`;
          });
        }
      }

      if (query) {
        url += `&Search=${encodeURIComponent(query)}`;
      }

      if (date) {
        const dateStr = formatDateForAPI(date);
        url += `&Search=${dateStr}`;
      }

      console.log('API URL:', url);
      const response = await apiClient.get(url);

      if (response.data.length > 0) {
        if (pageNumber === 1) {
          setData(response.data);
        } else {
          setData(prev => [...prev, ...response.data]);
        }
        setHasMore(response.data.length === PAGE_SIZE);
      } else {
        if (pageNumber === 1) setData([]);
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
      fetchStatusData(selectedStatus, 1, query, selectedDate);
    } else {
      setIsSearching(false);
      setPage(1);
      setHasMore(true);
      fetchStatusData(selectedStatus, 1, '', selectedDate);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStatusData(selectedStatus, nextPage, isSearching ? searchQuery : '', selectedDate);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setIsSearching(false);
    setSearchQuery('');
    fetchStatusData(selectedStatus, 1, '', selectedDate);
  };

  const handlePartialStatusChange = (status: string) => {
    setSelectedPartialStatus(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
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

  const getPartialStatusText = (status?: string) => {
    if (!status) return '';
    switch (status) {
      case 'FULLYAPPROVED': return 'FULLY APPROVED';
      case 'PARTIALLYAPPROVED': return 'PARTIALLY APPROVED';
      case 'FULLYREJECT': return 'FULLY REJECT';
      case 'PARTIALLYREJECTED': return 'PARTIALLY REJECTED';
      default: return status;
    }
  };

  const getPartialStatusColor = (status?: string) => {
    if (!status) return '#6c757d';
    switch (status) {
      case 'FULLYAPPROVED': return '#28a745';
      case 'PARTIALLYAPPROVED': return '#ffc107';
      case 'FULLYREJECT': return '#dc3545';
      case 'PARTIALLYREJECTED': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const renderItem = ({ item }: { item: ProcurementItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.approvalStatus) }]}>
          <Text style={styles.statusText}>{item.approvalStatus}</Text>
        </View>
        {item.partialStatus && (
          <View style={[styles.partialStatusBadge, {
            backgroundColor: getPartialStatusColor(item.partialStatus)
          }]}>
            <Text style={styles.partialStatusText}>
              {getPartialStatusText(item.partialStatus)}
            </Text>
          </View>
        )}
        <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(item.quality) }]}>
          <Text style={styles.qualityText}>{item.quality} Quality</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Procurement Details</Text>
          <View style={styles.infoRow}>
            <Icon name="person" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Farmer</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
              {item.farmerName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="business" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Federation</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
              {item.federationName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="store" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Vendor</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
              {item.vendorName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Center</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
              {item.procureCenterName}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity Details (MT)</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantity Mt</Text>
              <Text style={styles.detailValue}>{formatNumber(item.quantityMT)}</Text>
            </View>

            {item.approvalStatus === 'APPROVED' && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Approved QuantityMT</Text>
                <Text style={styles.detailValue}>{formatNumber(item.remainingStoredMT)}</Text>
              </View>
            )}

            {item.approvalStatus === 'REJECTED' && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Reject Quantity</Text>
                <Text style={styles.detailValue}>{formatNumber(item.rejectQuantityMT)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Details</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rate/Kg (₹)</Text>
              <Text style={styles.detailValue}>{formatNumber(item.ratePerKg)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Value (₹)</Text>
              <Text style={styles.detailValue}>{formatNumber(item.purchaseValue)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Details</Text>
          <View style={styles.infoRow}>
            <Icon name="date-range" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Date</Text>
            <Text style={styles.infoValue}>{formatDateForDisplay(item.procureDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="ac-unit" size={16} color="#6c757d" />
            <Text style={styles.infoText}>Season</Text>
            <Text style={styles.infoValue}>{item.subSeasonName}</Text>
          </View>
        </View>

        {item.latitude && item.longitude && (
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => openMapWithDirections(item.latitude, item.longitude)}
          >
            <Icon name="map" size={18} color="#fff" />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  useEffect(() => {
    if (status) {
      setSelectedStatus(status);
    }
  }, [status]);

  useEffect(() => {
    if ((selectedStatus === 'APPROVED' || selectedStatus === 'REJECTED') && selectedPartialStatus.length > 0) {
      setPage(1);
      setHasMore(true);
      fetchStatusData(selectedStatus, 1, isSearching ? searchQuery : '', selectedDate);
    }
  }, [selectedPartialStatus]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMore(true);
      setData([]);
      setSearchQuery('');
      setIsSearching(false);
      setSelectedPartialStatus([]);
      setSelectedDate(null);
      fetchStatusData(selectedStatus, 1, '', null);
    }, [selectedStatus])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
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
              setSelectedPartialStatus([]);
              setSelectedDate(null);
              fetchStatusData(itemValue, 1, '', null);
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

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar-today" size={18} color="#495057" />
          <Text style={styles.datePickerButtonText}>Select Date</Text>
        </TouchableOpacity>

        {selectedDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.selectedDateText}>
              Selected Date: {formatDateForDisplay(selectedDate.toISOString())}
            </Text>
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => {
                setSelectedDate(null);
                setPage(1);
                fetchStatusData(selectedStatus, 1, isSearching ? searchQuery : '', null);
              }}
            >
              <Text style={styles.clearDateText}>Clear Date</Text>
            </TouchableOpacity>
          </View>
        )}



        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type === 'set' && date) {
                // Create a new Date object with just the date components (UTC)
                const utcDate = new Date(Date.UTC(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate()
                ));
                setSelectedDate(utcDate);
                setPage(1);
                fetchStatusData(selectedStatus, 1, isSearching ? searchQuery : '', utcDate);
              }
            }}
          />
        )}

        {selectedStatus === 'APPROVED' && (
          <View style={styles.partialStatusContainer}>
            <Text style={styles.filterLabel}>FILTER BY APPROVAL TYPE</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  selectedPartialStatus.includes('FULLYAPPROVED') && styles.checkboxSelected,
                  selectedPartialStatus.includes('PARTIALLYAPPROVED') && styles.checkboxDisabled
                ]}
                onPress={() => !selectedPartialStatus.includes('PARTIALLYAPPROVED') && handlePartialStatusChange('FULLYAPPROVED')}
                disabled={selectedPartialStatus.includes('PARTIALLYAPPROVED')}
              >
                <Text style={[
                  styles.checkboxText,
                  selectedPartialStatus.includes('PARTIALLYAPPROVED') && styles.disabledText
                ]}>Fully Approved</Text>
                {selectedPartialStatus.includes('FULLYAPPROVED') && (
                  <Icon name="check" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  selectedPartialStatus.includes('PARTIALLYAPPROVED') && styles.checkboxSelected,
                  selectedPartialStatus.includes('FULLYAPPROVED') && styles.checkboxDisabled
                ]}
                onPress={() => !selectedPartialStatus.includes('FULLYAPPROVED') && handlePartialStatusChange('PARTIALLYAPPROVED')}
                disabled={selectedPartialStatus.includes('FULLYAPPROVED')}
              >
                <Text style={[
                  styles.checkboxText,
                  selectedPartialStatus.includes('FULLYAPPROVED') && styles.disabledText
                ]}>Partially Approved</Text>
                {selectedPartialStatus.includes('PARTIALLYAPPROVED') && (
                  <Icon name="check" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedStatus === 'REJECTED' && (
          <View style={styles.partialStatusContainer}>
            <Text style={styles.filterLabel}>FILTER BY REJECTION TYPE</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  selectedPartialStatus.includes('FULLYREJECT') && styles.checkboxSelected,
                  selectedPartialStatus.includes('PARTIALLYREJECTED') && styles.checkboxDisabled
                ]}
                onPress={() => !selectedPartialStatus.includes('PARTIALLYREJECTED') && handlePartialStatusChange('FULLYREJECT')}
                disabled={selectedPartialStatus.includes('PARTIALLYREJECTED')}
              >
                <Text style={[
                  styles.checkboxText,
                  selectedPartialStatus.includes('PARTIALLYREJECTED') && styles.disabledText
                ]}>Fully Rejected</Text>
                {selectedPartialStatus.includes('FULLYREJECT') && (
                  <Icon name="check" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
    flexShrink: 1,
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
  partialStatusContainer: {
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  checkboxSelected: {
    backgroundColor: '#4361ee',
  },
  checkboxText: {
    marginRight: 8,
    color: '#212529',
  },
  partialStatusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  partialStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxDisabled: {
    backgroundColor: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
  disabledText: {
    color: '#a0a0a0',
  },
 
    datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 8,
  },
  datePickerButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  selectedDateText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  clearDateButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  clearDateText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '500',
  },
});



// ... (keep the same styles as in your original code)

export default ProcurementList;