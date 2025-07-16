// Add these imports at the top
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// Add these state variables to your component
const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);
const [startDate, setStartDate] = useState<Date | null>(null);
const [endDate, setEndDate] = useState<Date | null>(null);

// Modify your fetchStatusData function to include date filters
const fetchStatusData = async (status: string, pageNumber: number, query: string = '') => {
  if ((!hasMore && pageNumber !== 1) || loading) return;

  setLoading(true);
  try {
    let url = `/api/mobile/procurement/list?PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;

    // Handle special case for PARTIALLYREJECTED
    if (selectedPartialStatus.includes('PARTIALLYREJECTED')) {
      url += `&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`;
      url += `&PartialStatus=PARTIALLYAPPROVED&PartialStatus=FULLYREJECT`;
    } 
    // Normal case for other filters
    else {
      if (status !== 'ALL') {
        url += `&ApprovalStatus=${status}`;
      }
      
      // Add partial status filters if any
      if (selectedPartialStatus.length > 0) {
        selectedPartialStatus.forEach(partialStatus => {
          url += `&PartialStatus=${partialStatus}`;
        });
      }
    }

    if (query) {
      url += `&Search=${encodeURIComponent(query)}`;
    }

    // Add date filters if they exist
    if (startDate) {
      url += `&StartDate=${format(startDate, 'yyyy-MM-dd')}`;
    }
    if (endDate) {
      url += `&EndDate=${format(endDate, 'yyyy-MM-dd')}`;
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

// Add these date picker handlers
const handleStartDateChange = (event: any, selectedDate?: Date) => {
  setShowStartDatePicker(false);
  if (selectedDate) {
    setStartDate(selectedDate);
    setPage(1);
    setHasMore(true);
    fetchStatusData(selectedStatus, 1, isSearching ? searchQuery : '');
  }
};

const handleEndDateChange = (event: any, selectedDate?: Date) => {
  setShowEndDatePicker(false);
  if (selectedDate) {
    setEndDate(selectedDate);
    setPage(1);
    setHasMore(true);
    fetchStatusData(selectedStatus, 1, isSearching ? searchQuery : '');
  }
};

const clearDateFilters = () => {
  setStartDate(null);
  setEndDate(null);
  setPage(1);
  setHasMore(true);
  fetchStatusData(selectedStatus, 1, isSearching ? searchQuery : '');
};

// Add this to your render method, just before the FlatList
<View style={styles.dateFilterContainer}>
  <Text style={styles.filterLabel}>FILTER BY DATE</Text>
  <View style={styles.datePickerRow}>
    <TouchableOpacity 
      style={styles.dateInput} 
      onPress={() => setShowStartDatePicker(true)}
    >
      <Text style={startDate ? styles.dateText : styles.datePlaceholder}>
        {startDate ? format(startDate, 'dd MMM yyyy') : 'Start Date'}
      </Text>
      <Icon name="calendar-today" size={18} color="#495057" />
    </TouchableOpacity>
    
    <Text style={styles.dateSeparator}>to</Text>
    
    <TouchableOpacity 
      style={styles.dateInput} 
      onPress={() => setShowEndDatePicker(true)}
    >
      <Text style={endDate ? styles.dateText : styles.datePlaceholder}>
        {endDate ? format(endDate, 'dd MMM yyyy') : 'End Date'}
      </Text>
      <Icon name="calendar-today" size={18} color="#495057" />
    </TouchableOpacity>
    
    {(startDate || endDate) && (
      <TouchableOpacity 
        style={styles.clearDateButton}
        onPress={clearDateFilters}
      >
        <Icon name="clear" size={18} color="#dc3545" />
      </TouchableOpacity>
    )}
  </View>
  
  {showStartDatePicker && (
    <DateTimePicker
      value={startDate || new Date()}
      mode="date"
      display="default"
      onChange={handleStartDateChange}
      maximumDate={endDate || new Date()}
    />
  )}
  
  {showEndDatePicker && (
    <DateTimePicker
      value={endDate || new Date()}
      mode="date"
      display="default"
      onChange={handleEndDateChange}
      minimumDate={startDate}
      maximumDate={new Date()}
    />
  )}
</View>





dateFilterContainer: {
  marginBottom: 16,
},
datePickerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 8,
},
dateInput: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: '#dee2e6',
},
dateText: {
  fontSize: 14,
  color: '#212529',
},
datePlaceholder: {
  fontSize: 14,
  color: '#adb5bd',
},
dateSeparator: {
  marginHorizontal: 8,
  color: '#6c757d',
},
clearDateButton: {
  marginLeft: 8,
  padding: 8,
},