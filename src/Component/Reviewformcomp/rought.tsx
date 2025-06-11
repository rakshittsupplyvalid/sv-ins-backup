import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
  RefreshControl
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

const PAGE_SIZE = 5;

const ProcumentList = () => {
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { status } = route.params;
  const [selectedStatus, setSelectedStatus] = useState(status || 'ALL');
  const [data, setData] = useState<ProcurementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (status) {
      setSelectedStatus(status);
    }
  }, [status]);

  const fetchStatusData = async (status: string, pageNumber: number, isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await apiClient.get(
        `/api/procurement/list?ApprovalStatus=${status}&PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`
      );
      
      // If refreshing or first page, replace the data
      if (isRefreshing || pageNumber === 1) {
        setData(response.data);
      } else {
        // Otherwise append the new data
        setData(prevData => [...prevData, ...response.data]);
      }
      
      // Check if we've reached the end of data
      setHasMore(response.data.length === PAGE_SIZE);
      
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !refreshing) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchStatusData(selectedStatus, 1, true);
  };

  useEffect(() => {
    fetchStatusData(selectedStatus, page);
  }, [selectedStatus, page]);

  const onStatusChange = (itemValue: string) => {
    setSelectedStatus(itemValue);
    setPage(1);
    setData([]);
    setHasMore(true);
  };

  // ... (keep all your existing render methods and styles)

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>FILTER BY STATUS</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={onStatusChange}
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

      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4a6da7']}
              tintColor="#4a6da7"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#4361ee" style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            !loading && !refreshing ? (
              <View style={styles.emptyContainer}>
                <Icon name="info-outline" size={40} color="#adb5bd" />
                <Text style={styles.emptyText}>No procurement records found</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// ... (keep all your existing styles)