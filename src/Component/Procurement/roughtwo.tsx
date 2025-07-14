const renderItem = ({ item }: { item: ProcurementItem }) => {
  // Only render if partialStatus matches certain conditions
  if (!item.partialStatus || 
      !['FULLYAPPROVED', 'PARTIALLYAPPROVED', 'FULLYREJECTED', 'PARTIALLYREJECTED'].includes(item.partialStatus)) {
    return null;
  }

  return (
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

      {/* Rest of your card content remains the same */}
      <View style={styles.cardBody}>
        {/* ... all your existing card body content ... */}
      </View>
    </View>
  );
};