import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ModalSuccess({ visible, onClose }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✓</Text>
          </View>

          <Text style={styles.title}>Éxito</Text>
          <Text style={styles.message}>
            Inicio de sesión exitoso.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continuar</Text>
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
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    elevation: 6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 30,
    fontWeight: "700",
    color: "#16A34A",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});