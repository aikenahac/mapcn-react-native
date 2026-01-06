import { Map } from "@/components/ui/map";
import { MapExample } from "@/components/ui/map-example";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";

export default function HomeScreen() {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Request location permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === "granted");
      } catch (error) {
        console.error("Error requesting location permissions:", error);
      }
    })();
  }, []);

  return (
    <View className="flex flex-col flex-1 py-24 px-8 bg-neutral-900 gap-12">
      <View>
        <Image
          source={require("@/assets/images/logo_dark.png")}
          style={{ width: "100%", height: 150 }}
        />
      </View>

      <Map zoom={18} center={[14.508290514863964, 46.04592437872753]} />
      {hasLocationPermission && <MapExample />}
    </View>
  );
}
