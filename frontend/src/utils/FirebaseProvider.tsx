import { FirebaseApp, initializeApp } from "firebase/app";
import { GoogleAuthProvider, User, getAuth, signInWithPopup, signOut } from "firebase/auth";
import { MouseEventHandler, ReactNode, createContext, useEffect, useState } from "react";
import { get, post } from "src/api/requests";
import { firebaseConfig } from "src/utils/FirebaseConfig";

const FirebaseContext = createContext<{
  app: FirebaseApp | undefined;
  user: User | null;
  loading: boolean;
  openGoogleAuthentication: MouseEventHandler<HTMLButtonElement>;
  signOutFromFirebase: MouseEventHandler<HTMLButtonElement>;
}>({
  app: undefined,
  user: null,
  loading: true,
  openGoogleAuthentication: () => {},
  signOutFromFirebase: () => {},
});

export default function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // Improved sign-in with better error handling
  const openGoogleAuthentication = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Immediately get the ID token
      const token = await result.user.getIdToken();
      return token;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  };

  // More robust sign-out
  const signOutFromFirebase = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Get the user's ID token
        const token = await firebaseUser.getIdToken();
        
        // Try to get user data from backend
        const userData = await get(`/api/users/${firebaseUser.uid}`, {
          Authorization: `Bearer ${token}`
        });

        // If user exists in backend
        if (userData) {
          setUser(firebaseUser);
        } else {
          // Create new user if doesn't exist
          await post(`/api/users`, {
            firebaseUid: firebaseUser.uid,
            idToken: token
          }, {
            Authorization: `Bearer ${token}`
          });
          setUser(firebaseUser);
        }
      } catch (error) {
        console.error("User authentication flow error:", error);
        // Graceful fallback - sign out if there's an error
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <FirebaseContext.Provider
      value={{ 
        app, 
        user, 
        loading, 
        openGoogleAuthentication, 
        signOutFromFirebase 
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export { FirebaseContext };