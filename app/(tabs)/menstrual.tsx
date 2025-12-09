// menstrual.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type CycleEntry = {
  id: string;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string;
  length?: number;
};

type SymptomEntry = {
  id: string;
  date: string; // "YYYY-MM-DD"
  symptoms: string;
  mood: string;
  notes: string;
};

type ReminderEntry = {
  id: string;
  title: string;
  dateTime: string; // free text / "YYYY-MM-DD HH:mm"
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const parseDate = (value: string) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const getFertileWindow = (lastStart: string, cycleLength: number) => {
  const start = parseDate(lastStart);
  if (!start) return null;

  // Simple model: ovulation ~ 14 days before next period
  const ovulationDay = new Date(start);
  ovulationDay.setDate(ovulationDay.getDate() + (cycleLength - 14));

  const windowStart = new Date(ovulationDay);
  windowStart.setDate(windowStart.getDate() - 2);

  const windowEnd = new Date(ovulationDay);
  windowEnd.setDate(windowEnd.getDate() + 1);

  return {
    ovulation: formatDate(ovulationDay),
    start: formatDate(windowStart),
    end: formatDate(windowEnd),
  };
};

const getCyclePhase = (lastStart: string, cycleLength: number) => {
  const start = parseDate(lastStart);
  if (!start) return { phase: "Unknown", tip: "Enter your last period date to see tailored tips." };

  const today = new Date();
  const diffMs = today.getTime() - start.getTime();
  const dayInCycle = (Math.floor(diffMs / (1000 * 60 * 60 * 24)) % cycleLength + cycleLength) % cycleLength + 1;

  if (dayInCycle <= 5) {
    return {
      phase: "Menstrual Phase",
      tip: "Rest, stay hydrated, and prioritize iron-rich foods. Gentle stretching or light walks can help with cramps.",
    };
  } else if (dayInCycle <= 13) {
    return {
      phase: "Follicular Phase",
      tip: "Energy usually rises now. It’s a good time for learning, planning, and trying more intense workouts.",
    };
  } else if (dayInCycle <= 16) {
    return {
      phase: "Ovulation Phase",
      tip: "You may feel more social and confident. Stay hydrated and include antioxidant-rich foods (fruits/veggies).",
    };
  } else {
    return {
      phase: "Luteal Phase",
      tip: "Mood swings and cravings can show up. Focus on good sleep, balanced meals, and calming activities.",
    };
  }
};

export default function MenstrualScreen() {
  // Period / cycle tracker
  const [lastPeriodStart, setLastPeriodStart] = useState<string>(formatDate(new Date()));
  const [cycleLength, setCycleLength] = useState<string>("28");
  const [cycleHistory, setCycleHistory] = useState<CycleEntry[]>([]);

  // Symptom logging
  const [symptomDate, setSymptomDate] = useState<string>(formatDate(new Date()));
  const [symptoms, setSymptoms] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [symptomLogs, setSymptomLogs] = useState<SymptomEntry[]>([]);

  // Reminders
  const [reminderTitle, setReminderTitle] = useState<string>("");
  const [reminderDateTime, setReminderDateTime] = useState<string>("");
  const [reminders, setReminders] = useState<ReminderEntry[]>([]);

  const numericCycleLength = useMemo(() => {
    const n = parseInt(cycleLength, 10);
    return isNaN(n) || n <= 0 ? 28 : n;
  }, [cycleLength]);

  const fertileWindow = useMemo(
    () => getFertileWindow(lastPeriodStart, numericCycleLength),
    [lastPeriodStart, numericCycleLength]
  );

  const phaseInfo = useMemo(
    () => getCyclePhase(lastPeriodStart, numericCycleLength),
    [lastPeriodStart, numericCycleLength]
  );

  const nextPeriodDate = useMemo(() => {
    const start = parseDate(lastPeriodStart);
    if (!start) return null;
    const next = new Date(start);
    next.setDate(next.getDate() + numericCycleLength);
    return formatDate(next);
  }, [lastPeriodStart, numericCycleLength]);

  const averageCycleLength = useMemo(() => {
    if (cycleHistory.length === 0) return null;
    const vals = cycleHistory
      .map((c) => c.length)
      .filter((v): v is number => typeof v === "number");

    if (vals.length === 0) return null;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round(sum / vals.length);
  }, [cycleHistory]);

  const handleSaveCycle = () => {
    const start = parseDate(lastPeriodStart);
    if (!start) {
      Alert.alert("Invalid date", "Please use the format YYYY-MM-DD.");
      return;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 4); // pretend 5-day period for history
    const length = numericCycleLength;

    const newEntry: CycleEntry = {
      id: `${Date.now()}`,
      startDate: formatDate(start),
      endDate: formatDate(end),
      length,
    };

    setCycleHistory((prev) => [newEntry, ...prev]);
    Alert.alert("Saved", "Cycle added to history.");
  };

  const handleAddSymptomLog = () => {
    if (!symptoms && !mood && !notes) {
      Alert.alert("Add details", "Please log at least one field (symptoms, mood, or notes).");
      return;
    }
    const date = parseDate(symptomDate) ? symptomDate : formatDate(new Date());
    const newEntry: SymptomEntry = {
      id: `${Date.now()}`,
      date,
      symptoms,
      mood,
      notes,
    };
    setSymptomLogs((prev) => [newEntry, ...prev]);
    setSymptoms("");
    setMood("");
    setNotes("");
    Alert.alert("Logged", "Your symptoms have been saved.");
  };

  const handleAddReminder = () => {
    if (!reminderTitle || !reminderDateTime) {
      Alert.alert("Missing info", "Please enter both title and date/time.");
      return;
    }
    const newRem: ReminderEntry = {
      id: `${Date.now()}`,
      title: reminderTitle,
      dateTime: reminderDateTime,
    };
    setReminders((prev) => [newRem, ...prev]);
    setReminderTitle("");
    setReminderDateTime("");
    Alert.alert(
      "Reminder saved",
      "This app currently keeps reminders inside the app. You can connect real push notifications later with expo-notifications."
    );
  };

  return (
    <LinearGradient colors={["#f8bbd0", "#ce93d8"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🌸 Menstrual Health</Text>
        <Text style={styles.subtitle}>Track your cycle, symptoms & self-care</Text>

        {/* Period Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Period Tracker</Text>
          <Text style={styles.cardText}>Log your last period and typical cycle length.</Text>

          <Text style={styles.inputLabel}>Last Period Start (YYYY-MM-DD)</Text>
          <TextInput
            value={lastPeriodStart}
            onChangeText={setLastPeriodStart}
            placeholder="2025-01-01"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Average Cycle Length (days)</Text>
          <TextInput
            value={cycleLength}
            onChangeText={setCycleLength}
            keyboardType="number-pad"
            placeholder="28"
            style={styles.input}
          />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next Period (estimated): </Text>
            <Text style={styles.infoValue}>{nextPeriodDate ?? "-"}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSaveCycle}>
            <Text style={styles.buttonText}>Save Cycle to History</Text>
          </TouchableOpacity>
        </View>

        {/* Fertile Window Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fertile Window Tracker</Text>
          <Text style={styles.cardText}>
            Based on your last period and cycle length, this estimates ovulation & fertile days.
          </Text>
          {fertileWindow ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fertile Window:</Text>
                <Text style={styles.infoValue}>
                  {fertileWindow.start} → {fertileWindow.end}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Ovulation:</Text>
                <Text style={styles.infoValue}>{fertileWindow.ovulation}</Text>
              </View>
              <Text style={styles.smallNote}>
                This is an estimate, not medical advice. Cycle tracking apps cannot be used as
                reliable birth control.
              </Text>
            </>
          ) : (
            <Text style={styles.smallNote}>Enter a valid last period date to see your window.</Text>
          )}
        </View>

        {/* Reminders & Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reminders & Notifications</Text>
          <Text style={styles.cardText}>
            Create reminders for medications, upcoming periods, or self-care.
          </Text>

          <Text style={styles.inputLabel}>Reminder Title</Text>
          <TextInput
            value={reminderTitle}
            onChangeText={setReminderTitle}
            placeholder="Take iron supplement"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Date & Time (free text)</Text>
          <TextInput
            value={reminderDateTime}
            onChangeText={setReminderDateTime}
            placeholder="2025-11-20 09:00"
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleAddReminder}>
            <Text style={styles.buttonText}>Add Reminder</Text>
          </TouchableOpacity>

          {reminders.length > 0 && (
            <View style={styles.sectionList}>
              <Text style={styles.sectionTitle}>Saved Reminders</Text>
              {reminders.map((r) => (
                <View key={r.id} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>• {r.title}</Text>
                  <Text style={styles.listItemSubtitle}>{r.dateTime}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Health Tips by Cycle Phase */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Health Tips by Cycle Phase</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Phase:</Text>
            <Text style={styles.infoValue}>{phaseInfo.phase}</Text>
          </View>
          <Text style={styles.cardText}>{phaseInfo.tip}</Text>
        </View>

        {/* Symptom Logging */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Symptom Logging</Text>
          <Text style={styles.cardText}>Log cramps, mood, and anything you’d like to remember.</Text>

          <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={symptomDate}
            onChangeText={setSymptomDate}
            placeholder="2025-11-15"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Symptoms</Text>
          <TextInput
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="Cramps, bloating, headache..."
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Mood</Text>
          <TextInput
            value={mood}
            onChangeText={setMood}
            placeholder="Anxious, calm, tired..."
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else you want to track"
            style={[styles.input, styles.inputMultiline]}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleAddSymptomLog}>
            <Text style={styles.buttonText}>Save Symptom Log</Text>
          </TouchableOpacity>

          {symptomLogs.length > 0 && (
            <View style={styles.sectionList}>
              <Text style={styles.sectionTitle}>Recent Logs</Text>
              <FlatList
                data={symptomLogs}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <Text style={styles.listItemTitle}>{item.date}</Text>
                    {!!item.symptoms && (
                      <Text style={styles.listItemSubtitle}>Symptoms: {item.symptoms}</Text>
                    )}
                    {!!item.mood && (
                      <Text style={styles.listItemSubtitle}>Mood: {item.mood}</Text>
                    )}
                    {!!item.notes && (
                      <Text style={styles.listItemSubtitle}>Notes: {item.notes}</Text>
                    )}
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* Cycle History & Reports */}
        <View style={[styles.card, { marginBottom: 40 }]}>
          <Text style={styles.cardTitle}>Cycle History & Reports</Text>
          <Text style={styles.cardText}>
            Saved cycles help you understand your patterns over time.
          </Text>

          {averageCycleLength && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Average Cycle Length:</Text>
              <Text style={styles.infoValue}>{averageCycleLength} days</Text>
            </View>
          )}

          {cycleHistory.length > 0 ? (
            <View style={styles.sectionList}>
              <Text style={styles.sectionTitle}>Past Cycles</Text>
              {cycleHistory.map((c) => (
                <View key={c.id} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>
                    {c.startDate} → {c.endDate}
                  </Text>
                  {typeof c.length === "number" && (
                    <Text style={styles.listItemSubtitle}>Length: {c.length} days</Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.smallNote}>
              Save cycles from the Period Tracker card to see your history here.
            </Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a148c",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10,
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#6a1b9a",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,

    // iOS shadows
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    // Android shadow
    elevation: 6,

    // Web shadow
    ...(Platform.OS === "web" && {
      boxShadow: "0px 6px 12px rgba(0,0,0,0.12)",
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#4a148c",
  },
  cardText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    color: "#6a1b9a",
    marginTop: 6,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fdfdfd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    borderWidth: 1,
    borderColor: "rgba(74, 20, 140, 0.18)",
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#8e24aa",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6a1b9a",
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#311b92",
  },
  smallNote: {
    fontSize: 12,
    color: "#555",
    marginTop: 8,
  },
  sectionList: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#5e35b1",
  },
  listItem: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a148c",
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#444",
  },
});
