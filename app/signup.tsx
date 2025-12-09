// app/signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignupScreen() {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSignup = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert("Weak password", "Password should be at least 6 characters long.");
      return;
    }

    if (trimmedPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match. Please try again.");
      return;
    }

    const emailKey = trimmedEmail.replace(/\s+/g, "");

    try {
      // Save per-email user info (mock database)
      await AsyncStorage.multiSet([
        [`user_name_${emailKey}`, trimmedName],
        [`user_password_${emailKey}`, trimmedPassword],
        ["currentUserName", trimmedName],
        ["currentUserEmail", emailKey],
      ]);

      Alert.alert("Sign up successful", "Your account has been created.");

      // Go to home tab
      router.replace("/(tabs)/home");
    } catch (e) {
      console.log("Error saving user", e);
      Alert.alert("Error", "Could not save user. Please try again.");
    }
  };

  const handleAlreadyHaveAccount = () => {
    router.replace("/login");
  };

  return (
    <LinearGradient colors={["#f8bbd0", "#ce93d8"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>👤 Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to track safety & menstrual health
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Up</Text>
            <Text style={styles.cardText}>
              Enter your details to create a new account.
            </Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              autoCapitalize="words"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleAlreadyHaveAccount}>
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4a148c",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6a1b9a",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    ...(Platform.OS === "web" && {
      boxShadow: "0px 6px 12px rgba(0,0,0,0.12)",
    }),
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#4a148c",
  },
  cardText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 14,
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
  button: {
    backgroundColor: "#8e24aa",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  footerLink: {
    fontSize: 14,
    color: "#6a1b9a",
    fontWeight: "600",
  },
});
