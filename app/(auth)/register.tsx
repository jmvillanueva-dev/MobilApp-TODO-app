import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    displayName: false,
  });

  const { register, loading, error, clearError } = useAuth();
  const router = useRouter();

  // Limpiar errores del contexto cuando el usuario empiece a escribir
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, displayName]);

  // Validación de email en tiempo real
  const validateEmail = (email: string) => {
    setEmail(email);

    if (!email) {
      setEmailError("El email es requerido");
      return false;
    }

    // Regex mejorado para validación de email
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      setEmailError("❌ El formato del email no es válido");
      return false;
    }

    if (email.length > 254) {
      setEmailError("❌ El email es demasiado largo");
      return false;
    }

    setEmailError("");
    return true;
  };

  // Validación de contraseña en tiempo real
  const validatePassword = (password: string) => {
    setPassword(password);

    if (!password) {
      setPasswordError("La contraseña es requerida");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("❌ La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    setPasswordError("");
    return true;
  };

  // Validación de nombre en tiempo real
  const validateDisplayName = (name: string) => {
    setDisplayName(name);

    if (!name) {
      setDisplayNameError("El nombre es requerido");
      return false;
    }

    if (name.length < 2) {
      setDisplayNameError("❌ El nombre debe tener al menos 2 caracteres");
      return false;
    }

    setDisplayNameError("");
    return true;
  };

  // Manejar blur de los campos
  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validar formulario completo
  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isDisplayNameValid = validateDisplayName(displayName);

    setTouched({ email: true, password: true, displayName: true });

    return isEmailValid && isPasswordValid && isDisplayNameValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Por favor corrige los errores en el formulario");
      return;
    }

    const success = await register(email, password, displayName);
    if (success) {
      Alert.alert("Éxito", "Usuario registrado correctamente", [
        {
          text: "OK",
          onPress: () => router.replace("(app)/(tabs)/todos" as any),
        },
      ]);
    }
    // El error se muestra automáticamente a través del hook useAuth
  };

  const goToLogin = () => {
    router.back();
  };

  // Función para obtener estilo del input basado en errores
  const getInputStyle = (field: keyof typeof touched, fieldError: string) => {
    if (touched[field] && fieldError) {
      return [styles.input, styles.inputError];
    }
    if (touched[field] && !fieldError) {
      return [styles.input, styles.inputSuccess];
    }
    return styles.input;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Crear Cuenta</Text>

          {/* Campo Nombre Completo */}
          <TextInput
            style={getInputStyle("displayName", displayNameError)}
            placeholder="Nombre completo"
            value={displayName}
            onChangeText={validateDisplayName}
            onBlur={() => handleBlur("displayName")}
            editable={!loading}
          />
          {touched.displayName && displayNameError ? (
            <Text style={styles.errorText}>{displayNameError}</Text>
          ) : null}

          {/* Campo Email */}
          <TextInput
            style={getInputStyle("email", emailError)}
            placeholder="Email"
            value={email}
            onChangeText={validateEmail}
            onBlur={() => handleBlur("email")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {touched.email && emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Campo Contraseña */}
          <TextInput
            style={getInputStyle("password", passwordError)}
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChangeText={validatePassword}
            onBlur={() => handleBlur("password")}
            secureTextEntry
            editable={!loading}
          />
          {touched.password && passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {/* Mostrar error del contexto (como email ya registrado) */}
          {error && !emailError && !passwordError && !displayNameError ? (
            <Text style={styles.contextErrorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              (loading || emailError || passwordError || displayNameError) &&
                styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={
              loading || !!emailError || !!passwordError || !!displayNameError
            }
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToLogin} style={styles.linkButton}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.linkTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: {
    borderColor: "#ff3b30",
    borderWidth: 2,
  },
  inputSuccess: {
    borderColor: "#34C759",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 20,
    padding: 10,
  },
  linkText: {
    color: "#666",
    textAlign: "center",
    fontSize: 16,
  },
  linkTextBold: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  contextErrorText: {
    color: "#ff3b30",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 5,
  },
});
