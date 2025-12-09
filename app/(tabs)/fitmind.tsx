import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { Pedometer } from "expo-sensors";
import { Ionicons } from "@expo/vector-icons";

// --- FIX NOTIFICATION BEHAVIOR ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function FitMind() {
  const [mood, setMood] = useState("");
  const [journal, setJournal] = useState("");

  // -----------------------------
  // FITNESS / STEPS TRACKING
  // -----------------------------
  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState(false);

  // calories = approx. 0.04 kcal per step
  const calories = (steps * 0.04).toFixed(2);

  // distance = step length (0.762m) → convert to km
  const distance = ((steps * 0.762) / 1000).toFixed(2);

  // active minutes = every 100 steps = 1 min
  const activeMinutes = Math.floor(steps / 100);

  useEffect(() => {
    Pedometer.isAvailableAsync().then(
      (result) => setAvailable(result),
      (error) => console.log(error)
    );

    const subscription = Pedometer.watchStepCount((result) => {
      setSteps(result.steps);
    });

    return () => subscription && subscription.remove();
  }, []);

  // -----------------------------
  // HYDRATION REMINDER
  // -----------------------------
  const scheduleHydrationReminder = async () => {
    await Notifications.requestPermissionsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💧 Stay Hydrated",
        body: "Drink a glass of water now!",
      },
      trigger: {
        seconds: 3600,
        repeats: true,
      } as Notifications.TimeIntervalTriggerInput,
    });

    alert("Hydration Reminder enabled!");
  };

  return (
    <LinearGradient colors={["#6dd5fa", "#2980b9"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FitMind</Text>
          <Text style={styles.headerSubtitle}>
            Fitness • Wellness • Mood • Hydration
          </Text>
        </View>

        {/* ==============================
           FITNESS DASHBOARD (Steps + Calories + Health)
        ===============================*/}
        <Text style={styles.sectionTitle}>💪 Fitness Stats</Text>

        <View style={styles.glassCard}>
          {/* Steps */}
          <View style={styles.rowCenter}>
            <Ionicons name="walk" size={40} color="#fff" />
            <Text style={styles.bigValue}>{steps}</Text>
          </View>
          <Text style={styles.bigLabel}>Steps Today</Text>

          {/* Two-column stats */}
          <View style={styles.cardRow}>
            <View style={styles.smallStat}>
              <Ionicons name="flame" size={30} color="#fff" />
              <Text style={styles.statLabel}>Calories</Text>
              <Text style={styles.statValue}>{calories} kcal</Text>
            </View>

            <View style={styles.smallStat}>
              <Ionicons name="map" size={30} color="#fff" />
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{distance} km</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <Ionicons name="time" size={28} color="#fff" />
            <Text style={styles.statLabel}>Active Minutes</Text>
            <Text style={styles.statValue}>{activeMinutes} min</Text>
          </View>
        </View>

        {/* WORKOUT ROUTINE */}
        <Text style={styles.sectionTitle}>🏋 Workout Routine</Text>
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Home Beginner Workout</Text>
          <Text style={styles.cardText}>• 10 Push-ups</Text>
          <Text style={styles.cardText}>• 20 Squats</Text>
          <Text style={styles.cardText}>• 15 Lunges</Text>
          <Text style={styles.cardText}>• 20 sec Plank</Text>
          <Text style={styles.cardText}>• 20 Jumping Jacks</Text>

          <Text style={[styles.cardText, { marginTop: 10, opacity: 0.8 }]}>
            👉 YouTube: “Home Beginner Workout”
          </Text>
        </View>

        {/* HYDRATION */}
        <Text style={styles.sectionTitle}>💧 Hydration</Text>

        <TouchableOpacity style={styles.button} onPress={scheduleHydrationReminder}>
          <LinearGradient
            colors={["#00c6fb", "#005bea"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Enable Hourly Water Reminder</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* MOOD & JOURNAL */}
        <Text style={styles.sectionTitle}>😊 Mood & Journal</Text>

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>How do you feel?</Text>
          <TextInput
            placeholder="Happy | Sad | Stressed?"
            style={styles.input}
            value={mood}
            onChangeText={setMood}
          />

          <Text style={[styles.cardTitle, { marginTop: 20 }]}>
            Journal Your Thoughts
          </Text>
          <TextInput
            placeholder="Write anything on your mind..."
            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
            multiline
            value={journal}
            onChangeText={setJournal}
          />
        </View>

        {/* WELLNESS DASHBOARD */}
        <Text style={styles.sectionTitle}>📌 Wellness Dashboard</Text>

        <View style={styles.dashboard}>
          <Text style={styles.dashboardItem}>
            😊 Mood: <Text style={styles.dashboardValue}>{mood || "Not logged"}</Text>
          </Text>

          <Text style={styles.dashboardItem}>
            💧 Hydration: <Text style={styles.dashboardValue}>Reminder ON</Text>
          </Text>

          <Text style={styles.dashboardItem}>
            🚶 Steps: <Text style={styles.dashboardValue}>{steps}</Text>
          </Text>

          <Text style={styles.dashboardItem}>
            🔥 Calories: <Text style={styles.dashboardValue}>{calories} kcal</Text>
          </Text>

          <Text style={styles.dashboardItem}>
            📊 Distance: <Text style={styles.dashboardValue}>{distance} km</Text>
          </Text>

          <Text style={styles.dashboardItem}>
            ⏱ Active: <Text style={styles.dashboardValue}>{activeMinutes} min</Text>
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 60,
    paddingBottom: 25,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 12,
    color: "#fff",
    marginLeft: 20,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 20,
    margin: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  bigValue: {
    fontSize: 42,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  bigLabel: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 5,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  smallStat: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
  },
  statLabel: { color: "#fff", marginTop: 5 },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 3 },

  activityCard: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#f1f1f1",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginTop: 10,
  },

  button: {
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  dashboard: {
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
  },
  dashboardItem: {
    fontSize: 18,
    marginBottom: 10,
    color: "#fff",
    fontWeight: "500",
  },
  dashboardValue: {
    fontWeight: "700",
    color: "#ffeb3b",
  },
});