// 1. Remove the default selectedPartialStatus for REJECTED
const [selectedPartialStatus, setSelectedPartialStatus] = useState<string[]>([]);

// 2. Update the API call logic to only add PartialStatus if filters are selected
const fetchStatusData = async (status: string, pageNumber: number, query: string = '') => {
  // ... existing code ...
  
  let url = `/api/mobile/procurement/list?PageNumber=${pageNumber}&PageSize=${PAGE_SIZE}`;
  
  if (status !== 'ALL') {
    url += `&ApprovalStatus=${status}`;
  }
  
  // Only add PartialStatus if filters are selected
  if (selectedPartialStatus.length > 0) {
    selectedPartialStatus.forEach(status => {
      url += `&PartialStatus=${status}`;
    });
  }
  
  // ... rest of the function ...
};

// 3. Update the filter UI sections to show all options
{selectedStatus === 'APPROVED' && (
  <View style={styles.partialStatusContainer}>
    <Text style={styles.filterLabel}>FILTER BY APPROVAL TYPE</Text>
    <View style={styles.checkboxContainer}>
      <TouchableOpacity
        style={[styles.checkbox, selectedPartialStatus.includes('FULLYAPPROVED') && styles.checkboxSelected]}
        onPress={() => handlePartialStatusChange('FULLYAPPROVED')}
      >
        <Text style={styles.checkboxText}>Fully Approved</Text>
        {selectedPartialStatus.includes('FULLYAPPROVED') && (
          <Icon name="check" size={16} color="#fff" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.checkbox, selectedPartialStatus.includes('PARTIALLYAPPROVED') && styles.checkboxSelected]}
        onPress={() => handlePartialStatusChange('PARTIALLYAPPROVED')}
      >
        <Text style={styles.checkboxText}>Partially Approved</Text>
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
        style={[styles.checkbox, selectedPartialStatus.includes('FULLYREJECTED') && styles.checkboxSelected]}
        onPress={() => handlePartialStatusChange('FULLYREJECTED')}
      >
        <Text style={styles.checkboxText}>Fully Rejected</Text>
        {selectedPartialStatus.includes('FULLYREJECTED') && (
          <Icon name="check" size={16} color="#fff" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.checkbox, selectedPartialStatus.includes('PARTIALLYREJECTED') && styles.checkboxSelected]}
        onPress={() => handlePartialStatusChange('PARTIALLYREJECTED')}
      >
        <Text style={styles.checkboxText}>Partially Rejected</Text>
        {selectedPartialStatus.includes('PARTIALLYREJECTED') && (
          <Icon name="check" size={16} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  </View>
)}

// 4. Update useFocusEffect to clear filters when status changes
e