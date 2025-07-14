import { StyleSheet } from 'react-native';



export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
        justifyContent: 'flex-end',
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
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 12,
       
        
    },
    quantityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5fe',
        padding: 12,
        borderRadius: 8,
        width: '48%',
    },
    quantityLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginLeft: 8,
    },
    quantityValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4a6da7',
        marginLeft: 'auto',
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
});