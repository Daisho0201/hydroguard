import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";

// The main component of our application
const App = () => {
  // State variables for app functionality
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [waterMovement, setWaterMovement] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [alertActive, setAlertActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);

  // Mock device type
  type Device = {
    id: string;
    name: string;
    signalStrength: number;
  };

  // Simulate scanning for devices
  const scanForDevices = () => {
    setIsScanning(true);

    // Simulate network delay
    setTimeout(() => {
      // Mock device data
      const mockDevices: Device[] = [
        { id: "001", name: "HydroGuard-Pool", signalStrength: 90 },
        { id: "002", name: "HydroGuard-Spa", signalStrength: 75 },
        { id: "003", name: "HydroGuard-Beach", signalStrength: 60 },
      ];

      setAvailableDevices(mockDevices);
      setIsScanning(false);
    }, 2000);
  };

  // Connect to selected device
  const connectToDevice = (device: Device) => {
    setIsScanning(false);

    // Show connecting message
    Alert.alert("Connecting", `Connecting to ${device.name}...`);

    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      Alert.alert("Connected", `Successfully connected to ${device.name}`);
    }, 1500);
  };

  // Disconnect from device
  const disconnectDevice = () => {
    setIsMonitoring(false);
    setIsConnected(false);
    setAlertActive(false);
  };

  // Simulate monitoring water movement
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring && isConnected) {
      interval = setInterval(() => {
        // Simulate changes in water movement (in a real app, this would come from sensors)
        const newMovement = Math.floor(Math.random() * 100);
        setWaterMovement(newMovement);

        // Check if the water movement indicates potential drowning
        if (newMovement > 70) {
          setAlertActive(true);
          Alert.alert(
            "DROWNING ALERT",
            "Unusual water movement detected! Please check the water immediately.",
            [{ text: "OK", onPress: () => setAlertActive(false) }]
          );
        }
      }, 3000); // Check every 3 seconds
    }

    // Clean up the interval when component unmounts or monitoring stops
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, isConnected]);

  // Toggle the monitoring state on/off
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (alertActive) setAlertActive(false);
  };

  // Render connection screen
  const renderConnectionScreen = () => {
    return (
      <View style={styles.content}>
        <View style={styles.connectionContainer}>
          <Text style={styles.connectionTitle}>
            Connect to HydroGuard Device
          </Text>
          <Text style={styles.connectionInstructions}>
            Make sure your HydroGuard device is powered on and within range of
            your phone's WiFi.
          </Text>

          {/* Device List */}
          <View style={styles.deviceListContainer}>
            <Text style={styles.deviceListTitle}>Available Devices</Text>

            {availableDevices.length > 0 ? (
              <FlatList
                data={availableDevices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.deviceItem}
                    onPress={() => connectToDevice(item)}
                  >
                    <View>
                      <Text style={styles.deviceName}>{item.name}</Text>
                      <Text style={styles.deviceInfo}>
                        Signal: {item.signalStrength}%
                      </Text>
                    </View>
                    <View style={styles.connectButtonSmall}>
                      <Text style={styles.connectButtonText}>Connect</Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.deviceList}
              />
            ) : (
              <View style={styles.noDevicesContainer}>
                <Text style={styles.noDevicesText}>
                  {isScanning ? "Scanning for devices..." : "No devices found"}
                </Text>
                {isScanning && (
                  <ActivityIndicator
                    size="large"
                    color="#005792"
                    style={styles.scanningIndicator}
                  />
                )}
              </View>
            )}
          </View>

          {/* Scan Button */}
          <TouchableOpacity
            style={[styles.scanButton, isScanning ? styles.scanningButton : {}]}
            onPress={scanForDevices}
            disabled={isScanning}
          >
            <Text style={styles.scanButtonText}>
              {isScanning ? "Scanning..." : "Scan for Devices"}
            </Text>
            {isScanning && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.buttonLoadingIndicator}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render monitoring screen
  const renderMonitoringScreen = () => {
    return (
      <View style={styles.content}>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: isMonitoring
                ? alertActive
                  ? "#FF6B6B"
                  : "#4CAF50"
                : "#CCCCCC",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {isMonitoring
              ? alertActive
                ? "ALERT!"
                : "Monitoring"
              : "Not Active"}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Water Movement:</Text>
          <Text style={styles.infoValue}>{waterMovement}%</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text
            style={[
              styles.infoValue,
              {
                color: alertActive
                  ? "#FF6B6B"
                  : isMonitoring
                  ? "#4CAF50"
                  : "#666",
              },
            ]}
          >
            {alertActive ? "DANGER" : isMonitoring ? "SAFE" : "OFF"}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Connection:</Text>
          <Text style={[styles.infoValue, { color: "#005792" }]}>
            Connected
          </Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isMonitoring ? "#D32F2F" : "#4CAF50" },
            ]}
            onPress={toggleMonitoring}
          >
            <Text style={styles.buttonText}>
              {isMonitoring ? "STOP MONITORING" : "START MONITORING"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={disconnectDevice}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render our user interface
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#005792" />

      {/* App Header with Centered Logo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Centered Logo Placeholder */}
          <View style={styles.logoPlaceholder}>
            <Image
              source={require("@/assets/images/LogoOnly_PlaceHolder.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          {/* App Title and Subtitle */}
          <Text style={styles.headerText}>HydroGuard</Text>
          <Text style={styles.subtitle}>Anti-Drowning Monitoring System</Text>
        </View>
      </View>

      {/* Conditional rendering based on connection state */}
      {isConnected ? renderMonitoringScreen() : renderConnectionScreen()}
    </SafeAreaView>
  );
};

// Styles for our components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#005792",
    padding: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    overflow: "hidden", // This ensures the image doesn't overflow the rounded corners
  },
  logoImage: {
    width: "100%", // Takes full width of parent
    height: "100%", // Takes full height of parent
    borderRadius: 35, // Match the parent's borderRadius
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#005792",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E0E0",
    marginTop: 5,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  connectionContainer: {
    width: "100%",
    alignItems: "center",
  },
  connectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  connectionInstructions: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 20,
  },
  deviceListContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  deviceList: {
    width: "100%",
    maxHeight: 200,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deviceInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  connectButtonSmall: {
    backgroundColor: "#005792",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  connectButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  noDevicesContainer: {
    padding: 20,
    alignItems: "center",
  },
  noDevicesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  scanningIndicator: {
    marginTop: 10,
  },
  scanButton: {
    backgroundColor: "#005792",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanningButton: {
    backgroundColor: "#0277BD",
  },
  scanButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonLoadingIndicator: {
    marginLeft: 10,
  },
  statusIndicator: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginVertical: 10,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "80%",
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disconnectButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  disconnectButtonText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default App; 