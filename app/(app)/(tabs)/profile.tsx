import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/src/presentation/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, loading, updateProfile, error, clearError } = useAuthContext();
  const [displayName, setDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sincronizar con el usuario actual
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  // Limpiar errores cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    if (displayName === user?.displayName) {
      Alert.alert("Info", "El nombre es el mismo");
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    const success = await updateProfile(displayName);

    if (success) {
      Alert.alert("Éxito", "Tu perfil ha sido actualizado con éxito.");
      setIsEditing(false);
    } else {
      Alert.alert(
        "Error",
        error || "No se pudo actualizar tu perfil. Inténtalo nuevamente"
      );
    }
    setIsUpdating(false);
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || "");
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-outline" size={64} color="#999" />
        <Text style={styles.noDataText}>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user.displayName || "Usuario")}
              </Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </View>
          </View>
          <Text style={styles.userName}>{user.displayName || "Usuario"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Información del Perfil */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Información Personal</Text>
          </View>

          {/* Campo de Nombre Editable */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombre de usuario</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, isEditing && styles.inputEditing]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Ingresa tu nombre"
                editable={!isUpdating && isEditing}
                placeholderTextColor="#999"
              />
              {!isEditing ? (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleCancelEdit}
                >
                  <Ionicons name="close-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Email (no editable) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{user.email}</Text>
              <Ionicons name="mail-outline" size={20} color="#666" />
            </View>
          </View>

          {/* Fecha de registro */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Miembro desde</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>
                {user.createdAt?.toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </View>
          </View>
        </View>

        {/* Botones de Acción */}
        {isEditing && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={[styles.button, styles.cancelButton]}
              disabled={isUpdating}
            >
              <Ionicons name="close" size={20} color="#FF3B30" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={
                isUpdating ||
                displayName === user.displayName ||
                !displayName.trim()
              }
              style={[
                styles.button,
                styles.saveButton,
                (isUpdating ||
                  displayName === user.displayName ||
                  !displayName.trim()) &&
                  styles.buttonDisabled,
              ]}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="checkmark" size={20} color="#FFF" />
              )}
              <Text style={styles.saveButtonText}>
                {isUpdating ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Estadísticas o información adicional */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#34C759"
            />
            <Text style={styles.statValue}>Cuenta verificada</Text>
            <Text style={styles.statLabel}>Estado</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#34C759",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#FFF",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginLeft: 12,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#1C1C1E",
  },
  inputEditing: {
    borderColor: "#007AFF",
    backgroundColor: "#FFF",
  },
  editButton: {
    padding: 12,
    marginLeft: 8,
  },
  readOnlyField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  readOnlyText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  actionsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  buttonDisabled: {
    backgroundColor: "#C7C7CC",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  statsCard: {
    backgroundColor: "#FFF",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
