/**
 * Example usage of the Map component for React Native
 *
 * This file demonstrates how to use the ported MapLibre React Native components
 */

import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MapUserLocation,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  useCurrentPosition,
} from "./map";

export function MapExample() {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [showUserLocation, setShowUserLocation] = useState(true);

  // Use the hook to get current position - permissions are already granted
  const currentPosition = useCurrentPosition();

  return (
    <View style={styles.container}>
      {currentPosition && showUserLocation && (
        <Text style={styles.positionText}>
          Location: {currentPosition.coords.latitude.toFixed(4)},{" "}
          {currentPosition.coords.longitude.toFixed(4)}
        </Text>
      )}
      <Map
        center={[-0.1278, 51.5074]} // London
        zoom={12}
      >
        {/* Show user location with accuracy circle - only when enabled */}
        {showUserLocation && <MapUserLocation visible showAccuracy />}

        {/* Basic marker with default icon */}
        <MapMarker
          longitude={-0.1278}
          latitude={51.5074}
          onPress={() => setSelectedMarker("london")}
        >
          <MarkerContent />
        </MapMarker>

        {/* Marker with custom content and label */}
        <MapMarker
          longitude={-0.1}
          latitude={51.52}
          onPress={() => setSelectedMarker("custom")}
        >
          <MarkerContent>
            <View style={styles.customMarker}>
              <Text style={styles.markerText}>🏛️</Text>
            </View>
            <MarkerLabel position="top">British Museum</MarkerLabel>
          </MarkerContent>
        </MapMarker>

        {/* Marker with popup/callout */}
        <MapMarker
          longitude={-0.15}
          latitude={51.51}
          onPress={() => setSelectedMarker("popup")}
        >
          <MarkerContent>
            <View style={styles.customMarker}>
              <Text style={styles.markerText}>🎡</Text>
            </View>
          </MarkerContent>
          {selectedMarker === "popup" && (
            <MarkerPopup title="London Eye">
              <View>
                <Text style={styles.popupText}>
                  A giant Ferris wheel on the South Bank of the River Thames
                </Text>
              </View>
            </MarkerPopup>
          )}
        </MapMarker>

        {/* Draw a route between markers */}
        <MapRoute
          coordinates={[
            [-0.1278, 51.5074],
            [-0.1, 51.52],
            [-0.15, 51.51],
          ]}
          color="#3b82f6"
          width={4}
          opacity={0.7}
        />

        {/* Map controls */}
        <MapControls
          position="bottom-right"
          showZoom
          showLocate
          onLocate={(coords) => {
            console.log("Located at:", coords);
          }}
        />
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  positionText: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 4,
    fontSize: 12,
    zIndex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 24,
  },
  popupText: {
    fontSize: 14,
    color: "#374151",
  },
});
