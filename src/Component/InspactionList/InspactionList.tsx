import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Button,
    BackHandler,
    TextInput
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';
import { DrawerParamList } from '../../Type/DrawerParam';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';









interface InspectionItem {
    id: number;
    locationName: string;
    vendorName: string;
    createdOn: string;
    totalPhysicalQuantity: number;
    totalProcuerQuantity: number;
    additionalComments?: string;
     storageLocationId?: string; 
}

type RouteParams = {
    params: {
        id: string;
    };
};

const PAGE_SIZE = 100;

type InspactionListRouteProp = RouteProp<DrawerParamList, 'InspectionList'>;

const InspectionList = ({ navigation }: { navigation: any }) => {
    const { state, updateState } = useForm();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const route = useRoute<InspactionListRouteProp>();
    const InsepectionId = route.params?.storageId;
    const [showButton, setShowButton] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'location' | 'vendor'>('location');
    const isFocused = useIsFocused();



    useEffect(() => {
        if (isFocused && InsepectionId) {
                 console.log('Current storageId:', InsepectionId); // Add this line
            fetchInspectionList(1, true);
        }

    }, [isFocused,InsepectionId]);



    useEffect(() => {
        if (InsepectionId) {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    }, [InsepectionId]);

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

    const handleButtonPress = () => {
        if (InsepectionId) {
            navigation.navigate('Review Form', { InsepectionId });

            // setShowButton(false);
        }
    };

    const navigateToDrawer = (item: InspectionItem) => {
        navigation.navigate('Inspection List Details', {
            id: item.id,
            locationName: item.locationName,
            vendorName: item.vendorName,
            Storage : item.storageLocationId,
           
        });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0) {
            fetchInspectionList(1, true, query, searchType); // Pass the current searchType
        } else {
            fetchInspectionList(1, true); // Fetch fresh data without filters when query is empty
        }
    };


    const fetchInspectionList = async (
        pageNumber: number,
        isRefreshing = false,
        query: string = '',
        type: 'location' | 'vendor' = 'location'
    ) => {
        if (!hasMore && !isRefreshing) return;

        try {
            if (isRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            let url = `/api/mobile/InspectionReport/list?PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;


            if (InsepectionId) {
                url += `&StorageLocationId=${InsepectionId}`;
                console.log('abc' , url);    
           
            }



            // Add search parameters if search query exists
            if (query) {
                if (type === 'location') {
                    url += `&LocationName=${encodeURIComponent(query)}`;
                } else {
                    url += `&VendorName=${encodeURIComponent(query)}`;
                }
            }

            const response = await apiClient.get(url);
            console.log('API Response:', response.data); // Log the response


            const receivedItems = response.data || [];
            setHasMore(receivedItems.length >= PAGE_SIZE);

            updateState({
                fielddata: {
                    ...state.fielddata,
                    InspectionList: isRefreshing || pageNumber === 1
                        ? receivedItems
                        : [...(state.fielddata?.InspectionList || []), ...receivedItems],
                },
            });

            setError(null);
        } catch (err) {
            console.error('API error:', err);
            setError('Failed to fetch inspection reports. Please try again.');
            setHasMore(false);
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
        fetchInspectionList(1, true);
    };



    useEffect(() => {
        fetchInspectionList(page);
    }, [page]);

    useEffect(() => {
        // Reset search when component mounts
        setSearchQuery('');
        setSearchType('location');
    }, []);

    const formatNumber = (num: number) => {
        return num?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) || '0.00';
    };

    const renderItem = ({ item }: { item: InspectionItem }) => (
        <TouchableOpacity
            onPress={() => navigateToDrawer(item)}
            style={styles.card}
            activeOpacity={0.8}
        >
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View style={styles.statusBadge}>
                        <MaterialIcons name="date-range" size={16} color="#856404" />
                        <Text style={styles.statusText}>
                            {new Date(item.createdOn).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={16} color="#6c757d" />
                    <View style={styles.rowContent}>
                        <Text style={styles.labelText}>Location</Text>
                        <Text style={styles.valueText}>{item.locationName}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <MaterialIcons name="business" size={16} color="#6c757d" />
                    <View style={styles.rowContent}>
                        <Text style={styles.labelText}>Vendor</Text>
                        <Text style={styles.valueText}>{item.vendorName}</Text>
                    </View>
                </View>

                <View style={styles.quantityContainer}>
                    <View style={styles.quantityBox}>
                        <View style={styles.quantityIconWrapper}>
                            <MaterialIcons name="check-box" size={16} color="#4a6da7" />
                        </View>
                        <View style={styles.quantityTextWrapper}>
                            <Text style={styles.quantityLabel}>Physical Qty</Text>
                            <Text style={styles.quantityValue} numberOfLines={1} ellipsizeMode="tail">
                                {formatNumber(item.totalPhysicalQuantity)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.quantityBox}>
                        <View style={styles.quantityIconWrapper}>
                            <MaterialIcons name="inventory" size={16} color="#4a6da7" />
                        </View>
                        <View style={styles.quantityTextWrapper}>
                            <Text style={styles.quantityLabel}>Procured Qty</Text>
                            <Text style={styles.quantityValue} numberOfLines={1} ellipsizeMode="tail">
                                {formatNumber(item.totalProcuerQuantity)}
                            </Text>
                        </View>
                    </View>
                </View>

                {item.additionalComments && (
                    <View style={styles.commentsContainer}>
                        <MaterialIcons name="comment" size={16} color="#6c757d" />
                        <Text style={styles.commentsText} numberOfLines={2}>
                            {item.additionalComments}
                        </Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#4a6da7" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="list-alt" size={28} color="#343a40" style={styles.headerIcon} />
                <View>
                    <Text style={styles.title}>Inspection Reports</Text>
                    <Text style={styles.subtitle}>Recent inspection activities</Text>
                </View>
            </View>

            {/* Search Section */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <MaterialIcons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search by ${searchType}...`}  // Dynamic placeholder
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                    />
                </View>

            </View>

            <View style={styles.buttonContainer}>
                {showButton && (
                    <TouchableOpacity
                        style={styles.inspectionButton}
                        onPress={handleButtonPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonTexti}>Go to Review Form</Text>
                        <MaterialIcons name="search" size={20} color="#fff" style={styles.icon} />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={handleRefresh}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={state?.fielddata?.InspectionList || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color="#4a6da7" />
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="find-in-page" size={48} color="#dee2e6" />
                            <Text style={styles.emptyText}>No inspection reports found</Text>
                            {error && (
                                <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                }
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
                        <ActivityIndicator size="small" color="#4a6da7" style={styles.footerLoader} />
                    ) : hasMore && !refreshing && !error && state?.fielddata?.InspectionList?.length > 0 ? (
                        <TouchableOpacity
                            onPress={handleLoadMore}
                            style={styles.loadMoreButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.loadMoreText}>Load More</Text>
                            )}
                        </TouchableOpacity>
                    ) : state?.fielddata?.InspectionList?.length > 0 ? (
                        <Text style={styles.noMoreText}>No more reports to show</Text>
                    ) : null
                }
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerIcon: {
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#343a40',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardContent: {
        borderRadius: 12,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#856404',
        fontWeight: '500',
        marginLeft: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rowContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
        marginLeft: 8,
    },
    labelText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#495057',
    },
    valueText: {
        fontSize: 14,
        color: '#495057',
        maxWidth: '60%',
        textAlign: 'right',
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 12,
    },
    quantityBox: {
        flexDirection: 'row',
        backgroundColor: '#f1f5fe',
        padding: 12,
        borderRadius: 8,
        width: '48%',
        minHeight: 60,
    },
    quantityIconWrapper: {
        justifyContent: 'center',
        marginRight: 8,
    },
    quantityTextWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    quantityLabel: {
        fontSize: 12,
        color: '#6c757d',
    },
    quantityValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4a6da7',
        marginTop: 4,
        flexShrink: 1,
    },
    commentsContainer: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    commentsText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#6c757d',
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 16,
    },
    viewDetailsText: {
        color: '#4a6da7',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#adb5bd',
    },
    errorContainer: {
        padding: 16,
        backgroundColor: '#f8d7da',
        marginHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    errorText: {
        color: '#721c24',
        marginBottom: 8,
    },
    retryText: {
        color: '#721c24',
        fontWeight: 'bold',
    },
    retryButton: {
        marginTop: 16,
        padding: 8,
        backgroundColor: '#dc3545',
        borderRadius: 4,
    },
    retryButtonText: {
        color: 'white',
    },
    footerLoader: {
        marginVertical: 16,
    },
    loadMoreButton: {
        padding: 12,
        backgroundColor: '#4a6da7',
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 16,
        marginHorizontal: 16,
    },
    loadMoreText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noMoreText: {
        textAlign: 'center',
        color: '#6c757d',
        marginVertical: 16,
    },
    buttonContainer: {
        marginVertical: 15,
        alignItems: 'center',
    },
    inspectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF9500',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        shadowColor: '#4a8cff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        width: '90%',
    },
    buttonTexti: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    icon: {
        marginLeft: 5,
    },
    // Search styles
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#495057',
    },
    searchTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    searchTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        backgroundColor: '#e9ecef',
    },
    searchTypeButtonActive: {
        backgroundColor: '#4a6da7',
    },
    searchTypeText: {
        color: '#495057',
        fontWeight: '500',
    },
    searchTypeTextActive: {
        color: 'white',
    },
});

export default InspectionList;
