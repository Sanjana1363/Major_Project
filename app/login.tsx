// app/login.tsx
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

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Missing information", "Please enter both email and password.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    const emailKey = trimmedEmail.replace(/\s+/g, "");

    try {
      const [namePair, passwordPair] = await AsyncStorage.multiGet([
        `user_name_${emailKey}`,
        `user_password_${emailKey}`,
      ]);

      const storedName = namePair[1];
      const storedPassword = passwordPair[1];

      if (!storedPassword || storedPassword !== trimmedPassword) {
        Alert.alert("Login failed", "Invalid email or password.");
        return;
      }

      // Set current user info
      await AsyncStorage.multiSet([
        ["currentUserName", storedName ?? ""],
        ["currentUserEmail", emailKey],
      ]);

      Alert.alert("Login successful", `Welcome back, ${storedName}!`);

      // Go to home tab
      router.replace("/(tabs)/home");
    } catch (e) {
      console.log("Error during login", e);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Password reset flow goes here.");
  };

  const handleNoAccount = () => {
    router.push("/signup");
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
          <Text style={styles.title}>🔐 Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login</Text>
            <Text style={styles.cardText}>
              Enter your email and password to continue.
            </Text>

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

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={handleNoAccount}>
                <Text style={styles.footerLink}>Sign up</Text>
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
  forgotPassword: {
    color: "#6a1b9a",
    textAlign: "right",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
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
