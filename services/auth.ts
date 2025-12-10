import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { auth } from './firebase';

export class AuthService {
    private authProvider = new GoogleAuthProvider();

    // Email/Password Sign Up
    async signUp(email: string, password: string): Promise<User> {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    }

    // Email/Password Sign In
    async signIn(email: string, password: string): Promise<User> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    }

    // Google Sign In
    async signInWithGoogle(): Promise<User> {
        const result = await signInWithPopup(auth, this.authProvider);
        return result.user;
    }

    // Sign Out
    async logout(): Promise<void> {
        await signOut(auth);
    }

    // Get Current User
    getCurrentUser(): User | null {
        return auth.currentUser;
    }

    // Listen to Auth State Changes
    onAuthChange(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, callback);
    }
}

export const authService = new AuthService();
