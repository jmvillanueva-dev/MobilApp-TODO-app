import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; // Import updateDoc
import { auth, db } from "@/FirebaseConfig";
import { User } from "@/src/domain/entities/User";
import {
  EmailAlreadyExistsError,
  InvalidEmailError,
} from "@/src/domain/errors/AuthErrors";

export class FirebaseAuthDataSource {
  // ===== MÉTODO PRIVADO: CONVERTIR FIREBASEUSER A USER =====
  private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "Usuario",
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    };
  }
  // ===== REGISTRO DE USUARIO =====
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // 2. Actualizar perfil en Auth (displayName)
      await firebaseUpdateProfile(firebaseUser, {
        displayName,
      });

      // 3. Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        displayName,
        createdAt: new Date(),
      });

      // 4. Retornar usuario mapeado
      return {
        id: firebaseUser.uid,
        email,
        displayName,
        createdAt: new Date(),
      };
    } catch (error: any) {
      console.error("Error registering user:", error);

      // Manejo específico de errores de Firebase
      if (error.code === "auth/email-already-in-use") {
        throw new EmailAlreadyExistsError(
          "❌ Este email ya está registrado. ¿Quieres iniciar sesión?"
        );
      } else if (error.code === "auth/invalid-email") {
        throw new InvalidEmailError("❌ El formato del email no es válido");
      } else if (error.code === "auth/weak-password") {
        throw new Error(
          "❌ La contraseña es muy débil. Debe tener al menos 6 caracteres"
        );
      } else if (error.code === "auth/operation-not-allowed") {
        throw new Error(
          "❌ La operación no está permitida. Contacta al administrador"
        );
      } else if (error.code === "auth/network-request-failed") {
        throw new Error("❌ Error de conexión. Verifica tu internet");
      }

      throw new Error(error.message || "❌ Error al registrar usuario");
    }
  }

  // ===== LOGIN =====
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName:
          userData?.displayName || firebaseUser.displayName || "Usuario",
        createdAt: userData?.createdAt?.toDate() || new Date(),
      };
    } catch (error: any) {
      console.error("Error logging in:", error);

      if (error.code === "auth/user-not-found") {
        throw new Error("❌ Usuario no encontrado");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("❌ Contraseña incorrecta");
      } else if (error.code === "auth/invalid-credential") {
        throw new Error("❌ Credenciales inválidas");
      } else if (error.code === "auth/invalid-email") {
        throw new InvalidEmailError("❌ El formato del email no es válido");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("❌ Demasiados intentos. Intenta más tarde");
      }

      throw new Error(error.message || "❌ Error al iniciar sesión");
    }
  }

  // ===== LOGOUT =====
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error logging out:", error);
      throw new Error(error.message || "Error al cerrar sesión");
    }
  }
  // ===== OBTENER USUARIO ACTUAL =====
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      // Obtener datos actualizados de Firestore para asegurar consistencia
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName:
          userData?.displayName || firebaseUser.displayName || "Usuario",
        createdAt:
          userData?.createdAt?.toDate() ||
          new Date(firebaseUser.metadata.creationTime || Date.now()),
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // ===== ACTUALIZAR PERFIL DE USUARIO =====
  async updateProfile(
    userId: string,
    data: { displayName: string }
  ): Promise<void> {
    try {
      const user = auth.currentUser;

      if (!user || user.uid !== userId) {
        throw new Error("No authenticated user found to update.");
      }

      // 1. Actualizar en Firebase Auth
      await firebaseUpdateProfile(user, {
        displayName: data.displayName,
      });

      // 2. Actualizar en Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        displayName: data.displayName,
        updatedAt: new Date(),
      });

      await user.getIdToken(true);

      console.log("Profile updated successfully, token refreshed");
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Mensajes de error más específicos
      if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "Por seguridad, necesitas volver a iniciar sesión para actualizar tu perfil"
        );
      }

      throw new Error(error.message || "Error al actualizar el perfil");
    }
  }

  // ===== OBSERVAR CAMBIOS DE AUTENTICACIÓN =====
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener datos actualizados de Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();

          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName:
              userData?.displayName || firebaseUser.displayName || "Usuario",
            createdAt:
              userData?.createdAt?.toDate() ||
              new Date(firebaseUser.metadata.creationTime || Date.now()),
          };

          callback(user);
        } catch (error) {
          console.error(
            "Error fetching user data in auth state change:",
            error
          );
          // Fallback to basic user data
          callback(this.mapFirebaseUserToUser(firebaseUser));
        }
      } else {
        callback(null);
      }
    });
  }

  // ===== ENVIAR EMAIL DE RECUPERACIÓN DE CONTRASEÑA =====
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);

      // Manejo específico de errores
      if (error.code === "auth/user-not-found") {
        throw new Error("❌ No existe una cuenta con este email");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("❌ El formato del email no es válido");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("❌ Demasiados intentos. Intenta más tarde");
      } else if (error.code === "auth/network-request-failed") {
        throw new Error("❌ Error de conexión. Verifica tu internet");
      }

      throw new Error(
        error.message || "❌ Error al enviar el email de recuperación"
      );
    }
  }
}
