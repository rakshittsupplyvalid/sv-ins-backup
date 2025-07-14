import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import styles from './CommonPickerstyles';

interface CommonPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  label?: string;
}

const CommonPicker: React.FC<CommonPickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  label,
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
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
              onValueChange(item.value);
            }}
            mode="modal" 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CommonPicker;
