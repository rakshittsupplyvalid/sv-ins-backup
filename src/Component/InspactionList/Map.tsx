import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

const App = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default App;