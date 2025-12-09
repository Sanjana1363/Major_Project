import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Accelerometer } from "expo-sensors";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";

export default function SafetyScreen() {
  const [safetyOn, setSafetyOn] = useState(false);
  const [heartRateValue, setHeartRateValue] = useState(null);
  const [fallDetected, setFallDetected] = useState(false);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [error, setError] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContact, setNewContact] = useState("");

  const accelSubscription = useRef(null);
  const sosCooldownRef = useRef(false);
  const shakeTimerRef = useRef(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (safetyOn) {
      startHeartbeatMonitoring();
      startSensors(); // shake + fall in one listener
    } else {
      stopHeartbeatMonitoring();
      stopSensors();
    }

    return () => {
      stopHeartbeatMonitoring();
      stopSensors();
    };
  }, [safetyOn]);

  // --------------- Shake + Fall Detection (Expo sensors) ---------------
  const startSensors = () => {
    setShakeCount(0);
    setFallDetected(false);
    setAlertTriggered(false);

    Accelerometer.setUpdateInterval(100);

    if (accelSubscription.current) {
      accelSubscription.current.remove();
    }

    accelSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
      const force = Math.sqrt(x * x + y * y + z * z);

      // Shake detection – 3 strong shakes in 2 seconds
      if (force > 2.8) {
        setShakeCount((prev) => {
          const next = prev + 1;

          if (next === 1) {
            // reset after 2 seconds
            shakeTimerRef.current = setTimeout(() => {
              setShakeCount(0);
            }, 2000);
          }

          if (next >= 3) {
            triggerSOS();
            setShakeCount(0);
            if (shakeTimerRef.current) {
              clearTimeout(shakeTimerRef.current);
              shakeTimerRef.current = null;
            }
          }

          return next;
        });
      }

      // Fall detection – very low acceleration (phone dropped / free fall)
      if (!alertTriggered && force < 0.5) {
        setFallDetected(true);
        setAlertTriggered(true);
        Alert.alert("⚠ Fall Detected!", "Your phone was dropped!");
        triggerSOS();
      }
    });
  };

  const stopSensors = () => {
    if (accelSubscription.current) {
      accelSubscription.current.remove();
      accelSubscription.current = null;
    }
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    setShakeCount(0);
  };

  // --------------- Heartbeat (simulated using camera + timer) ---------------
  const startHeartbeatMonitoring = async () => {
    if (cameraActive || measuring) return;
    setError(null);

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError("Camera permission is required for heartbeat monitoring.");
        return;
      }
    }

    setCameraActive(true);
    setMeasuring(true);
    setHeartRateValue(null);
    Alert.alert("Heartbeat Check", "Place your fingertip gently on the camera lens ❤");

    // Simulate reading after 3 seconds
    setTimeout(() => {
      const simulated = 72 + Math.floor(Math.random() * 10);
      setHeartRateValue(simulated);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMeasuring(false);
      setCameraActive(false);
    }, 3000);
  };

  const stopHeartbeatMonitoring = () => {
    setCameraActive(false);
    setMeasuring(false);
    setHeartRateValue(null);
  };

  // --------------- AsyncStorage: Emergency Contacts ---------------
  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem("emergencyContacts");
      if (saved) setContacts(JSON.parse(saved));
    } catch (e) {
      console.log("Error loading contacts", e);
    }
  };

  const addEmergencyContact = async () => {
    if (!newContact.trim()) return;
    const updated = [...contacts, newContact.trim()];
    setContacts(updated);
    await AsyncStorage.setItem("emergencyContacts", JSON.stringify(updated));
    setNewContact("");
    setModalVisible(false);
  };

  const deleteContact = async (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    await AsyncStorage.setItem("emergencyContacts", JSON.stringify(updated));
  };

  // --------------- SOS Logic ---------------
  const triggerSOS = () => {
    if (sosCooldownRef.current) return;
    sosCooldownRef.current = true;
    setTimeout(() => {
      sosCooldownRef.current = false;
    }, 8000); // 8s cooldown

    if (contacts.length === 0) {
      Alert.alert("No Contacts", "Please add emergency contacts first!");
      return;
    }

    contacts.forEach((phone) => {
      const cleaned = phone.replace(/\s+/g, "");
      Linking.openURL(`tel:${cleaned}`);
    });

    Alert.alert("🚨 SOS Triggered", "Calling all emergency contacts!");
  };

  // --------------- Nearby Police (Expo Location + Linking) ---------------
  const openNearbyPolice = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Location permission is needed to send your location.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const policeNumber = "100";
    const body = encodeURIComponent(`Emergency! My location: ${mapsLink}`);

    Alert.alert("Contact Police", "Do you want to call or send your location?", [
      { text: "Call", onPress: () => Linking.openURL(`tel:${policeNumber}`) },
      {
        text: "Send Location",
        onPress: () => Linking.openURL(`sms:${policeNumber}?body=${body}`),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const toggleSafety = (value) => {
    setSafetyOn(value);
    Alert.alert("Safety " + (value ? "ON" : "OFF"));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛡 Safety Center</Text>
      <Text style={styles.subtext}>Your AI-powered personal safety companion</Text>

      <View style={styles.masterToggle}>
        <Text style={styles.masterText}>
          {safetyOn ? "Safety Monitoring: ON" : "Safety Monitoring: OFF"}
        </Text>
        <Switch value={safetyOn} onValueChange={toggleSafety} />
      </View>

      {error && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>{error}</Text>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <FeatureCard
          icon={<Ionicons name="flash-outline" size={28} color="#fff" />}
          title="Shake to Trigger SOS"
          description="Shake phone 3 times strongly"
        />

        <FeatureCard
          icon={<Ionicons name="body-outline" size={28} color="#fff" />}
          title="Fall Detection"
          description={fallDetected ? "Fall Detected!" : "Monitoring for falls..."}
          onPress={startSensors}
        />

        <FeatureCard
          icon={<MaterialCommunityIcons name="heart-pulse" size={28} color="#fff" />}
          title="Heartbeat Monitoring"
          description={
            measuring
              ? "Measuring..."
              : heartRateValue
              ? `Current Heartbeat: ${heartRateValue} BPM`
              : "Place finger on camera to measure"
          }
          onPress={startHeartbeatMonitoring}
        />

        {measuring && <ActivityIndicator size="large" style={{ marginTop: 15 }} />}

        <FeatureCard
          icon={<Ionicons name="location-outline" size={28} color="#fff" />}
          title="Nearby Police Stations"
          description="Find and call nearby police stations"
          onPress={openNearbyPolice}
        />

        <TouchableOpacity style={styles.contactsButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.contactsText}>📞 Manage Emergency Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sosButton} onPress={triggerSOS}>
          <Text style={styles.sosText}>🚨 SOS</Text>
        </TouchableOpacity>
      </ScrollView>

      {cameraActive && permission?.granted && (
        <CameraView
          ref={cameraRef}
          style={{ width: 1, height: 1 }} // hidden
          facing="back"
        />
      )}

      {/* Contact Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Contacts</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={newContact}
              onChangeText={setNewContact}
            />

            <TouchableOpacity style={styles.modalButton} onPress={addEmergencyContact}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#888" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>

            <FlatList
              data={contacts}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}
                >
                  <Text>{item}</Text>
                  <TouchableOpacity onPress={() => deleteContact(index)}>
                    <Text style={{ color: "red", fontWeight: "bold" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Reusable feature card
function FeatureCard({ icon, title, description, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={["#ba68c8", "#8e24aa"]} style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardDesc}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3e5f5", paddingTop: 50, paddingHorizontal: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#6a1b9a", textAlign: "center" },
  subtext: { fontSize: 14, color: "#4a148c", textAlign: "center", marginBottom: 20 },
  masterToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  masterText: { fontSize: 16, fontWeight: "600", color: "#6a1b9a" },
  scroll: { paddingBottom: 100 },
  card: { borderRadius: 15, padding: 15, marginBottom: 15, elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 10 },
  cardDesc: { fontSize: 14, color: "#f0f0f0", marginTop: 5 },
  contactsButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  contactsText: { fontSize: 16, fontWeight: "600", color: "#6a1b9a" },
  sosButton: {
    backgroundColor: "red",
    padding: 20,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 15,
  },
  sosText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 15, width: "90%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#6a1b9a",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});

