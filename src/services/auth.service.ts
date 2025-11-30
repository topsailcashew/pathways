import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { User } from '@/types/models';

export const authService = {
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signUp(email: string, password: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? undefined,
          isAdmin: tokenResult.claims.admin === true,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};
