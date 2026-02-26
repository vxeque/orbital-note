import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { sincronizarConDrive } from '@/services/sincronizarWithDrive';

const SaveToDriveModal = ({ visible, onClose }) => {
  const [estado, setEstado] = useState('idle'); // idle | loading | success | error
  const [mensaje, setMensaje] = useState('');

  const handleGuardar = async () => {
    setEstado('loading');
    setMensaje('');
    try {
      await sincronizarConDrive();
      setEstado('success');
      setMensaje('Archivo guardado correctamente en Google Drive.');
    } catch (error) {
      // console.log(error)
      setEstado('error');
      setMensaje('Ocurrió un error al guardar. Intenta de nuevo.');
    }
  };

  const handleCerrar = () => {
    setEstado('idle');
    setMensaje('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Icono Drive */}
          <View style={styles.iconContainer}>
            <View style={styles.driveIcon}>
              <Image source={require("@/assets/images/Google_Drive_icon.png")} style={{ width: 30, height: 30 }} />            </View>
          </View>

          {/* Título */}
          <Text style={styles.titulo}>Guardar en Drive</Text>
          <Text style={styles.subtitulo}>
            Se sincronizarán tus datos con Google Drive.
          </Text>

          {/* Estado: cargando */}
          {estado === 'loading' && (
            <View style={styles.estadoContainer}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.estadoTexto}>Guardando...</Text>
            </View>
          )}

          {/* Estado: éxito */}
          {estado === 'success' && (
            <View style={[styles.estadoContainer, styles.successBox]}>
              <Text style={[styles.estadoTexto, styles.successTexto]}>{mensaje}</Text>
            </View>
          )}

          {/* Estado: error */}
          {estado === 'error' && (
            <View style={[styles.estadoContainer, styles.errorBox]}>
              <Text style={[styles.estadoTexto, styles.errorTexto]}>{mensaje}</Text>
            </View>
          )}

          {/* Botones */}
          <View style={styles.botonesContainer}>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={handleCerrar}
              disabled={estado === 'loading'}
            >
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>

            {estado !== 'success' && (
              <TouchableOpacity
                style={[
                  styles.botonGuardar,
                  estado === 'loading' && styles.botonDeshabilitado,
                ]}
                onPress={handleGuardar}
                disabled={estado === 'loading'}
              >
                <Text style={styles.botonGuardarTexto}>
                  {estado === 'error' ? 'Reintentar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            )}

            {estado === 'success' && (
              <TouchableOpacity style={styles.botonGuardar} onPress={handleCerrar}>
                <Text style={styles.botonGuardarTexto}>Listo</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#101010',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },

  // Icono
  iconContainer: {
    marginBottom: 16,
  },
  driveIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driveIconText: {
    fontSize: 26,
    color: '#4285F4',
  },

  // Textos
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFF',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // Estados
  estadoContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  estadoTexto: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: '#FFFF',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successTexto: {
    color: '#166534',
  },
  errorBox: {
    backgroundColor: '#ffffff17',
    borderWidth: 1,
  },
  errorTexto: {
    color: '#FFFF',
  },

  // Botones
  botonesContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  botonCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor:'#f3291bcc'
  },
  botonCancelarTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFF',
  },
  botonGuardar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
  },
  botonGuardarTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  botonDeshabilitado: {
    backgroundColor: '#93C5FD',
  },
});

export default SaveToDriveModal;