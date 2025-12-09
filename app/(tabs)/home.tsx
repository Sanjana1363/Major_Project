// app/(tabs)/home.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Swiper from "react-native-swiper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type Challenge = { id: number; text: string; done: boolean };

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const quotes = [
    "✨ Empowered women empower the world ✨",
    "🌸 Your health is your superpower 🌸",
    "💪 Strong. Confident. Unstoppable 💪",
    "💕 Self-care is not selfish, it’s essential 💕",
    "🌿 Balance your body, mind & soul 🌿",
  ];

  const [userName, setUserName] = useState<string>(""); // 👈 no default name
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [newChallenge, setNewChallenge] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [hoorayModalVisible, setHoorayModalVisible] = useState(false);

  // 🔁 Load the *current* logged-in user's name whenever Home comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadName = async () => {
        try {
          const stored = await AsyncStorage.getItem("currentUserName");
          setUserName(stored ?? "");
        } catch (e) {
          console.log("Error loading name", e);
          setUserName("");
        }
      };
      loadName();
    }, [])
  );

  // Load saved challenges once
  useEffect(() => {
    const loadChallenges = async () => {
      const saved = await AsyncStorage.getItem("challenges");
      if (saved) setChallenges(JSON.parse(saved));
      else
        setChallenges([
          { id: 1, text: "Drink 8 cups of water 💧", done: false },
          { id: 2, text: "Take a 20 min walk 🚶‍♀️", done: false },
          { id: 3, text: "Meditate for 10 min 🧘", done: false },
        ]);
    };
    loadChallenges();
  }, []);

  const saveChallenges = async (updated: Challenge[]) => {
    setChallenges(updated);
    await AsyncStorage.setItem("challenges", JSON.stringify(updated));
  };

  const toggleChallenge = (id: number) => {
    const updated = challenges.map((c) =>
      c.id === id ? { ...c, done: !c.done } : c
    );
    saveChallenges(updated);
    if (updated.every((c) => c.done)) setHoorayModalVisible(true);
  };

  const deleteChallenge = (id: number) => {
    const updated = challenges.filter((c) => c.id !== id);
    saveChallenges(updated);
  };

  const addChallenge = () => {
    if (!newChallenge.trim()) return;
    const updated = [
      ...challenges,
      { id: Date.now(), text: newChallenge, done: false },
    ];
    saveChallenges(updated);
    setNewChallenge("");
    setModalVisible(false);
  };

  return (
    <LinearGradient
      colors={["#fce4ec", "#f8bbd0", "#a28ff4"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>
          {userName ? `Welcome, ${userName} 🌸` : "Welcome 🌸"}
        </Text>
        <Text style={styles.subtext}>
          Your safety, health & wellness — in one app 💕
        </Text>

        {/* Quote Carousel */}
        <View style={styles.carouselContainer}>
          <Swiper
            autoplay
            autoplayTimeout={3}
            showsPagination
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
          >
            {quotes.map((quote, index) => (
              <View key={index} style={styles.quoteSlide}>
                <Text style={styles.quoteText}>{quote}</Text>
              </View>
            ))}
          </Swiper>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("safety")}
          >
            <LinearGradient
              colors={["#f8bbd0", "#fc6f9eff"]}
              style={styles.cardGradient}
            >
              <Ionicons name="shield-checkmark" size={40} color="#fff" />
              <Text style={styles.cardTitle}>Safety</Text>
              <Text style={styles.cardText}>SOS, alerts, AI detection 🚨</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("menstrual")}
          >
            <LinearGradient
              colors={["#ce93d8ff", "#ba68c8"]}
              style={styles.cardGradient}
            >
              <MaterialCommunityIcons name="heart-outline" size={40} color="#fff" />
              <Text style={styles.cardTitle}>Menstrual</Text>
              <Text style={styles.cardText}>Track, tips & reminders 🌙</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("fitmind")}
          >
            <LinearGradient colors={["#80deea", "#38e1f7ff"]} style={styles.cardGradient}>
              <Ionicons name="barbell" size={40} color="#fff" />
              <Text style={styles.cardTitle}>Fitness</Text>
              <Text style={styles.cardText}>Steps, calories, workouts 💪</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("fitmind")}
          >
            <LinearGradient colors={["#3cc341ff", "#66bb6a"]} style={styles.cardGradient}>
              <Ionicons name="leaf" size={40} color="#fff" />
              <Text style={styles.cardTitle}>Mindfulness</Text>
              <Text style={styles.cardText}>Meditation, relax, focus 🌿</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Wellness Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Today’s Wellness Challenges</Text>

          {challenges.map((c) => (
            <View key={c.id} style={styles.challengeWrapper}>
              <TouchableOpacity
                style={[styles.challengeItem, c.done && styles.challengeDone]}
                onPress={() => toggleChallenge(c.id)}
              >
                <Text style={styles.challengeText}>{c.text}</Text>
                <Text style={{ fontSize: 20 }}>{c.done ? "✅" : "⬜"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteChallenge(c.id)}>
                <Ionicons name="close-circle" size={22} color="red" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.resetButton, { marginTop: 15 }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.resetButtonText}>+ Add Challenge</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Challenge Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
              Add a New Challenge
            </Text>
            <TextInput
              placeholder="Enter challenge..."
              style={styles.input}
              value={newChallenge}
              onChangeText={setNewChallenge}
            />
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.resetButton, { marginRight: 10 }]}
                onPress={addChallenge}
              >
                <Text style={styles.resetButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewChallenge("");
                }}
              >
                <Text style={styles.resetButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hooray Modal */}
      <Modal transparent visible={hoorayModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              🎉 Hooray! All challenges completed today!
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { marginTop: 10 }]}
              onPress={() => setHoorayModalVisible(false)}
            >
              <Text style={styles.resetButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  scroll: { padding: 20, alignItems: "center", paddingBottom: 5 },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8a6bf0",
    marginBottom: 5,
    textAlign: "center",
  },
  subtext: {
    fontSize: 16,
    color: "#561b9a",
    marginBottom: 25,
    textAlign: "center",
  },
  carouselContainer: {
    height: 120,
    width: width * 0.9,
    marginBottom: 25,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(246, 160, 243, 0.23)",
  },
  quoteSlide: { flex: 1, justifyContent: "center", alignItems: "center", padding: 15 },
  quoteText: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "600",
    textAlign: "center",
    color: "#7b1fa2",
  },
  dot: { backgroundColor: "rgba(0,0,0,0.2)", width: 8, height: 8, borderRadius: 4, margin: 3 },
  activeDot: { backgroundColor: "#e91e63", width: 10, height: 10, borderRadius: 5, margin: 3 },
  cardContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  card: {
    width: "47%",
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10, color: "#fff" },
  cardText: { fontSize: 14, color: "#f0f0f0", textAlign: "center", marginTop: 5 },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#880e4f",
    textAlign: "center",
  },
  challengeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  challengeItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  challengeDone: { backgroundColor: "#c8e6c9", borderColor: "#4caf50" },
  challengeText: { fontSize: 16 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    alignItems: "center",
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#289a1bff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    width: "100%",
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: "#ce93d8",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: "center",
    elevation: 2,
  },
  resetButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
