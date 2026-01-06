import { LocationManager } from "@maplibre/maplibre-react-native";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export type LocationPermissionStatus = "granted" | "denied" | "not-determined";

export function useLocationPermission() {
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>("not-determined");
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = async () => {
    if (isRequesting) return;

    setIsRequesting(true);
    try {
      const granted = await LocationManager.requestPermissions();
      setPermissionStatus(granted ? "granted" : "denied");
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      setPermissionStatus("denied");
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    permissionStatus,
    isRequesting,
    requestPermission,
    hasPermission: permissionStatus === "granted",
  };
}
