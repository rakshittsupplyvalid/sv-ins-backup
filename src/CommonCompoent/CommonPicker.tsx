import React from 'react';
import { View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import styles from './CommonPickerstyles';

interface CommonPickerProps {
  selectedValue: string;
  onValueChange: (itemValue: string, itemIndex: number) => void;
  items: { label: string; value: string }[];
  label?: string;
}

const CommonPicker: React.FC<CommonPickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  label,
}) => {
  // Find index of the selected value (for onValueChange compatibility)
  const selectedIndex = items.findIndex(item => item.value === selectedValue);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Dropdown
        style={styles.picker}
        data={items}
        labelField="label"
        valueField="value"
        placeholder="Select item"
        search
        searchPlaceholder="Search..."
        value={selectedValue}
        onChange={item => {
          const index = items.findIndex(i => i.value === item.value);
          onValueChange(item.value, index);
        }}
      />
    </View>
  );
};

export default CommonPicker;
