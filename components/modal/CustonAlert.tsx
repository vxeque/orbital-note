import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export default function CustomAlert({
  visible,
  title,
  message,
  onClose,
}: Props) {
  const isWeb = Platform.OS === "web";
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={[styles.overlay,]}>
        <View style={[styles.container, isWeb && { width: "25%" }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={[styles.button, isWeb && styles.webButton]} onPress={onClose}>
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111",
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  webButton: {
    backgroundColor: "#2563EB",
    padding: 10,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});