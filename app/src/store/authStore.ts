// Authentication Store - Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, UserSettings } from '@/types';
import { showToast } from '@/lib/notifications';

type PartialUserSettings = Partial<UserSettings> & {
  notifications?: Partial<UserSettings['notifications']>;
  reminderTiming?: Partial<UserSettings['reminderTiming']>;
};

interface AuthState {
  // State
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: UserSettings) => Promise<void>;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initializeAuth: () => () => void;
}

export const defaultSettings: UserSettings = {
  theme: 'dark',
  notifications: {
    email: true,
    push: true,
    billReminders: true,
    warrantyAlerts: true,
    securityAlerts: true,
  },
  reminderTiming: {
    thirtyDaysBefore: true,
    sevenDaysBefore: true,
    oneDayBefore: true,
    onDueDate: true,
  },
};

export const normalizeUserSettings = (settings?: PartialUserSettings | null): UserSettings => ({
  theme: settings?.theme === 'light' ? 'light' : defaultSettings.theme,
  notifications: {
    ...defaultSettings.notifications,
    ...(settings?.notifications ?? {}),
  },
  reminderTiming: {
    ...defaultSettings.reminderTiming,
    ...(settings?.reminderTiming ?? {}),
  },
});

const buildUserRecord = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || '',
  photoURL: firebaseUser.photoURL || null,
  createdAt: serverTimestamp() as unknown as ReturnType<typeof serverTimestamp>,
  updatedAt: serverTimestamp() as unknown as ReturnType<typeof serverTimestamp>,
  settings: defaultSettings,
});

const loadOrCreateOAuthUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const rawUserData = userDoc.data() as User;
    await setDoc(
      userRef,
      { updatedAt: serverTimestamp() },
      { merge: true },
    );

    return {
      ...rawUserData,
      settings: normalizeUserSettings(rawUserData.settings),
    };
  }

  const userData = buildUserRecord(firebaseUser);
  await setDoc(userRef, userData);
  return userData;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      firebaseUser: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Setters
      setUser: (user) =>
        set({
          user: user
            ? {
                ...user,
                settings: normalizeUserSettings(user.settings),
              }
            : null,
          isAuthenticated: !!user,
        }),
      setFirebaseUser: (user) => set({ firebaseUser: user }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      updateSettings: async (settings) => {
        const firebaseUser = get().firebaseUser;
        const user = get().user;

        if (!firebaseUser || !user) {
          throw new Error('You need to be signed in to update notification settings.');
        }

        const normalizedSettings = normalizeUserSettings(settings);

        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          {
            settings: normalizedSettings,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        set({
          user: {
            ...user,
            settings: normalizedSettings,
            updatedAt: serverTimestamp() as unknown as ReturnType<typeof serverTimestamp>,
          },
        });
      },

      // Login with email/password
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = result.user;

          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let userData: User;

          if (userDoc.exists()) {
            userData = {
              ...(userDoc.data() as User),
              settings: normalizeUserSettings((userDoc.data() as User).settings),
            };
          } else {
            // Create new user document if doesn't exist
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || null,
              createdAt: serverTimestamp() as unknown as ReturnType<typeof serverTimestamp>,
              updatedAt: serverTimestamp() as unknown as ReturnType<typeof serverTimestamp>,
              settings: defaultSettings,
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          }

          set({
            user: userData,
            firebaseUser,
            isAuthenticated: true,
            isLoading: false,
          });

          showToast({
            title: 'Welcome back!',
            description: `Signed in as ${userData.displayName || userData.email}`,
            type: 'success',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          showToast({
            title: 'Login failed',
            description: errorMessage,
            type: 'error',
          });
          throw error;
        }
      },

      // Register new user
      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = result.user;

          // Update profile
          await updateProfile(firebaseUser, { displayName });

          // Create user document in Firestore
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName,
            photoURL: firebaseUser.photoURL || null,
            createdAt: serverTimestamp() as unknown as ReturnType<typeof serverTimestamp>,
            updatedAt: serverTimestamp() as unknown as ReturnType<typeof serverTimestamp>,
            settings: defaultSettings,
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), userData);

          set({
            user: userData,
            firebaseUser,
            isAuthenticated: true,
            isLoading: false,
          });

          showToast({
            title: 'Account created!',
            description: 'Welcome to Arcora',
            type: 'success',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          showToast({
            title: 'Registration failed',
            description: errorMessage,
            type: 'error',
          });
          throw error;
        }
      },

      // Login with Google
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;
          const userData = await loadOrCreateOAuthUser(firebaseUser);

          set({
            user: userData,
            firebaseUser,
            isAuthenticated: true,
            isLoading: false,
          });

          showToast({
            title: 'Welcome!',
            description: `Signed in as ${userData.displayName || userData.email}`,
            type: 'success',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Google login failed';
          set({ error: errorMessage, isLoading: false });
          showToast({
            title: 'Login failed',
            description: errorMessage,
            type: 'error',
          });
          throw error;
        }
      },
      loginWithApple: async () => {
        try {
          set({ isLoading: true, error: null });

          const provider = new OAuthProvider('apple.com');
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;
          const userData = await loadOrCreateOAuthUser(firebaseUser);

          set({
            user: userData,
            firebaseUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          showToast({
            title: 'Welcome!',
            description: `Signed in as ${userData.displayName || userData.email}`,
            type: 'success',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Apple sign-in failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          showToast({
            title: 'Apple sign-in failed',
            description: errorMessage,
            type: 'error',
          });
          throw error;
        }
      },

      loginWithMicrosoft: async () => {
        try {
          set({ isLoading: true, error: null });

          const provider = new OAuthProvider('microsoft.com');
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;
          const userData = await loadOrCreateOAuthUser(firebaseUser);

          set({
            user: userData,
            firebaseUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          showToast({
            title: 'Welcome!',
            description: `Signed in as ${userData.displayName || userData.email}`,
            type: 'success',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Microsoft sign-in failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          showToast({
            title: 'Microsoft sign-in failed',
            description: errorMessage,
            type: 'error',
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          showToast({
            title: 'Signed out',
            description: 'See you soon!',
            type: 'info',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Logout failed';
          set({ error: errorMessage, isLoading: false });
          showToast({
            title: 'Logout failed',
            description: errorMessage,
            type: 'error',
          });
        }
      },

      // Reset password
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
          showToast({
            title: 'Password reset sent',
            description: 'Check your email for instructions',
            type: 'success',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          showToast({
            title: 'Password reset failed',
            description: errorMessage,
            type: 'error',
          });
          throw error;
        }
      },

      // Initialize auth state listener
      initializeAuth: () => {
        if (!auth || typeof auth !== 'object' || !('app' in auth)) {
          console.warn('Auth unavailable. Falling back to unauthenticated mock state.');
          set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return () => { };
        }

        try {
          const unsubscribe = onAuthStateChanged(
            auth as Parameters<typeof onAuthStateChanged>[0],
            async (firebaseUser) => {
              try {
                if (firebaseUser) {
                  const userRef = doc(db, 'users', firebaseUser.uid);
                  const userDoc = await getDoc(userRef);

                  if (userDoc.exists()) {
                    const rawUserData = userDoc.data() as User;
                    const userData = {
                      ...rawUserData,
                      settings: normalizeUserSettings(rawUserData.settings),
                    };
                    set({
                      user: userData,
                      firebaseUser,
                      isAuthenticated: true,
                      isLoading: false,
                      error: null,
                    });
                  } else {
                    const newUserDoc = {
                      uid: firebaseUser.uid,
                      email: firebaseUser.email || '',
                      displayName: firebaseUser.displayName || '',
                      photoURL: firebaseUser.photoURL || null,
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      settings: defaultSettings,
                    };

                    await setDoc(userRef, newUserDoc);

                    set({
                      user: {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        displayName: firebaseUser.displayName || '',
                        photoURL: firebaseUser.photoURL || null,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                        settings: defaultSettings,
                      } as User,
                      firebaseUser,
                      isAuthenticated: true,
                      isLoading: false,
                      error: null,
                    });
                  }
                } else {
                  set({
                    user: null,
                    firebaseUser: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                  });
                }
              } catch (innerError) {
                console.error('Auth state handling failed:', innerError);
                set({
                  user: null,
                  firebaseUser: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: innerError instanceof Error ? innerError.message : 'Auth state handling failed',
                });
              }
            }
          );

          return unsubscribe;
        } catch (error) {
          console.warn('onAuthStateChanged failed. Falling back to mock unauthenticated state.', error);
          set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return () => { };
        }
      },
    }),
    {
      name: 'Arcora-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
