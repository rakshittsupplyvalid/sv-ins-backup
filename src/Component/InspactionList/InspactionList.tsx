import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Button
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';
import { DrawerParamList } from '../../Type/DrawerParam';
import { useRoute, RouteProp } from '@react-navigation/native';


interface InspectionItem {
    id: number;
    locationName: string;
    vendorName: string;
    createdOn: string;
    totalPhysicalQuantity: number;
    totalProcuerQuantity: number;
    additionalComments?: string;
}


type RouteParams = {
    params: {
        id: string;


    };
};

const PAGE_SIZE = 5;

type InspactionListRouteProp = RouteProp<DrawerParamList, 'InspectionList'>;

const InspectionList = ({ navigation }: { navigation: any }) => {
    const { state, updateState } = useForm();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const route = useRoute<InspactionListRouteProp>();
    const storageId = route.params?.storageId;
    const [showButton, setShowButton] = useState(false);


    useEffect(() => {
        if (storageId) {
            setShowButton(true); // Show button only if storageId exists
        } else {
            setShowButton(false); // Hide button if no storageId
        }
    }, [storageId]); // Re-run effect whenever storageId changes

    const handleButtonPress = () => {
        if (storageId) {
            navigation.navigate('Review Form', { storageId });
        }
    };




    const navigateToDrawer = (item: InspectionItem) => {
        navigation.navigate('Inspection List Details', {
            id: item.id,
            locationName: item.locationName,
            vendorName: item.vendorName,
        });


    };


    const fetchInspectionList = async (pageNumber: number, isRefreshing = false) => {
        if (!hasMore && !isRefreshing) return;

        try {
            if (isRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // Build the base URL
            let url = `/api/InspectionReport/list?PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;

            // Add StorageLocationId to the URL if it exists
            if (storageId) {
                url = `/api/InspectionReport/list?StorageLocationId=${storageId}&PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;
            }

            const response = await apiClient.get(url);

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


            <View style={styles.buttonContainer}>
                {showButton && (
                    // <Button
                    //   title="Go to Review Form"
                    //   onPress={handleButtonPress}
                    // />

                    <TouchableOpacity
                        style={styles.inspectionButton}
                        onPress={handleButtonPress}
                        activeOpacity={0.7}
                    > <Text style={styles.buttonTexti}>Go to Review Form</Text>
                        <MaterialIcons name="search" size={20} color="#fff" style={styles.icon} /></TouchableOpacity>
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
});

export default InspectionList;