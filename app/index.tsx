import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Define types for our data structures
interface Device {
  id: string;
  name: string;
  signalStrength: number;
}

interface HeartRateData {
  red?: number;
  ir?: number;
}

interface GyroAccelData {
  x: number;
  y: number;
  z: number;
}

interface MPU6050Data {
  gyroscope: GyroAccelData;
  accelerometer: GyroAccelData;
  temperature: number;
}

interface SensorData {
  heart_rate?: HeartRateData;
  mpu6050?: MPU6050Data;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

// The main component of our application
const App = () => {
  // State variables for app functionality
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [waterMovement, setWaterMovement] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [alertActive, setAlertActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heartRateData, setHeartRateData] = useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });

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

  const fetchData = async () => {
    try {
      console.log('Fetching data from ESP32...');
      const response = await fetch('http://192.168.1.17/sensors'); // Update with your ESP32 IP
      if (!response.ok) {
        throw new Error(`Failed to fetch. Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      setSensorData(data);

      // Update heart rate chart data
      setHeartRateData((prevState) => {
        const newLabels = [...prevState.labels];
        const newData = [...prevState.datasets[0].data];

        // Keep only the latest 10 data points
        if (newLabels.length >= 10) {
          newLabels.shift();
          newData.shift();
        }

        newLabels.push(new Date().toLocaleTimeString());
        newData.push(data.heart_rate?.red || 0); // Use 0 if red is undefined

        return {
          labels: newLabels,
          datasets: [{ data: newData }],
        };
      });
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError('Failed to fetch sensor data. Please check your network connection.');
    }
  };

  // Simulate monitoring water movement
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

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
        
        // Also fetch sensor data when monitoring is active
        fetchData();
      }, 3000); // Check every 3 seconds
    }

    // Clean up the interval when component unmounts or monitoring stops
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, isConnected]);
  
  // Initial fetch on component mount
  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);

  // Toggle the monitoring state on/off
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (alertActive) setAlertActive(false);
  };

  // Render sensor data display
  const renderSensorData = () => {
    if (error) {
      return (
        <View style={styles.section}>
          <Text style={styles.error}>{error}</Text>
        </View>
      );
    }

    if (!sensorData) {
      return (
        <View style={styles.section}>
          <Text>Loading sensor data...</Text>
        </View>
      );
    }

    return (
      <ScrollView>
        {/* Heart Rate Section */}
        <View style={styles.section}>
          <Text style={styles.title}>Heart Rate</Text>
          <Text style={styles.subtitle}>Red: {sensorData.heart_rate?.red}</Text>
          <Text style={styles.subtitle}>IR: {sensorData.heart_rate?.ir}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>Real-Time Heart Rate Chart</Text>
          <LineChart
            data={heartRateData}
            width={Dimensions.get('window').width - 30}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f2f2f2',
              backgroundGradientTo: '#f2f2f2',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>

        {/* Gyroscope Section */}
        <View style={styles.section}>
          <Text style={styles.title}>Gyroscope</Text>
          <Text style={styles.subtitle}>X: {sensorData.mpu6050?.gyroscope.x}</Text>
          <Text style={styles.subtitle}>Y: {sensorData.mpu6050?.gyroscope.y}</Text>
          <Text style={styles.subtitle}>Z: {sensorData.mpu6050?.gyroscope.z}</Text>
        </View>

        {/* Accelerometer Section */}
        <View style={styles.section}>
          <Text style={styles.title}>Accelerometer</Text>
          <Text style={styles.subtitle}>X: {sensorData.mpu6050?.accelerometer.x}</Text>
          <Text style={styles.subtitle}>Y: {sensorData.mpu6050?.accelerometer.y}</Text>
          <Text style={styles.subtitle}>Z: {sensorData.mpu6050?.accelerometer.z}</Text>
        </View>

        {/* Temperature Section */}
        <View style={styles.section}>
          <Text style={styles.title}>Temperature</Text>
          <Text style={styles.subtitle}>{sensorData.mpu6050?.temperature?.toFixed(2)}°C</Text>
        </View>
      </ScrollView>
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

        {/* Sensor Data */}
        {renderSensorData()}

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
              source={require("../assets/images/LogoOnly_PlaceHolder.png")}
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
      {isConnected && renderMonitoringScreen() }
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
  section: {
    margin: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle2: {
    fontSize: 16,
    marginBottom: 3,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default App;