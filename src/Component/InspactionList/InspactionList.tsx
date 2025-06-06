import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';

const InspectionList = ({ navigation }: any) => {
    const { state, updateState } = useForm();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

  const navigateToDrawer = (item: any) => {
    navigation.navigate('Inspection List Details', { 
        id: item.id,
        locationName: item.locationName,
        // Add any other values you want to pass
        vendorName: item.vendorName,
      
        
    });
};

    const fetchInspectionList = async () => {
        try {
            const response = await apiClient.get(`/api/InspectionReport/list`);
            updateState({
                fielddata: {
                    ...state.fielddata,
                    InspectionList: response.data,
                }

            });

            console.log('Inspection List:', response.data);
        } catch (error) {
            console.error('API error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchInspectionList();
    };

    useEffect(() => {
        fetchInspectionList();
    }, []);

    const formatNumber = (num: number) => {
        // Format large numbers with commas and fixed decimal places
        return num?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) || '0.00';
    };

    const renderItem = ({ item }: { item: any }) => (
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a6da7" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="list-alt" size={28} color="#343a40" style={styles.headerIcon} />
                <View>
                    <Text style={styles.title}>Inspection Reports</Text>
                    <Text style={styles.subtitle}>Recent inspection activities</Text>
                </View>
            </View>

            <FlatList
                data={state?.fielddata?.InspectionList || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons name="find-in-page" size={48} color="#dee2e6" />
                        <Text style={styles.emptyText}>No inspection reports found</Text>
                    </View>
                }
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
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#343a40',
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
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#495057',
        backgroundColor: '#f8f9fa',
        width: '50%',

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
        minHeight: 60, // Ensure consistent height
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
        flexShrink: 1, // Allow text to shrink if needed
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
    rowContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
        marginLeft: 8,
        width: '60%', // optional, prevents overflow
    },

    labelText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#495057',
    },

    valueText: {
        fontSize: 14,
        color: '#495057',
        maxWidth: '60%', // optional, prevents overflow
        textAlign: 'right',
    }
});

export default InspectionList;