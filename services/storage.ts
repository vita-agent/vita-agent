import { UserProfile, DailyProgress } from '../types';
import { MOCK_PROFILE } from '../constants';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const STORAGE_KEYS = {
    PROFILE: 'vitality_profile',
    PROGRESS: 'vitality_progress',
    AUTH: 'vitality_auth'
};

export class StorageService {
    private useCloud: boolean = true; // Enabled for Firebase

    async getUserProfile(): Promise<UserProfile> {
        if (this.useCloud && auth.currentUser) {
            try {
                const docRef = doc(db, "users", auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return docSnap.data() as UserProfile;
                }
            } catch (error) {
                console.error("Error fetching profile from Firestore:", error);
            }
        }

        // Fallback to Local
        const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
        return saved ? JSON.parse(saved) : MOCK_PROFILE;
    }

    async saveUserProfile(profile: UserProfile): Promise<void> {
        // Save to local storage first (immediate)
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));

        // Sync to cloud if authenticated
        if (this.useCloud && auth.currentUser) {
            try {
                await setDoc(doc(db, "users", auth.currentUser.uid), profile, { merge: true });
            } catch (error) {
                console.error("Error saving profile to Firestore:", error);
            }
        }
    }

    async getDailyProgress(): Promise<DailyProgress> {
        const today = new Date().toISOString().split('T')[0];

        if (this.useCloud && auth.currentUser) {
            try {
                const progressRef = collection(db, "users", auth.currentUser.uid, "daily_progress");
                const q = query(progressRef, where("date", "==", today), limit(1));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    return querySnapshot.docs[0].data() as DailyProgress;
                }
            } catch (error) {
                console.error("Error fetching progress from Firestore:", error);
            }
        }

        // Fallback to local
        const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        return saved ? JSON.parse(saved) : {
            date: today,
            caloriesConsumed: 0,
            caloriesBurned: 0,
            steps: 0,
            waterMl: 0,
            macros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
        };
    }

    async saveDailyProgress(progress: DailyProgress): Promise<void> {
        // Save to local storage
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));

        // Sync to cloud
        if (this.useCloud && auth.currentUser) {
            try {
                const progressRef = doc(db, "users", auth.currentUser.uid, "daily_progress", progress.date);
                await setDoc(progressRef, progress, { merge: true });
            } catch (error) {
                console.error("Error saving progress to Firestore:", error);
            }
        }
    }

    async getProgressHistory(days: number = 30): Promise<DailyProgress[]> {
        if (this.useCloud && auth.currentUser) {
            try {
                const progressRef = collection(db, "users", auth.currentUser.uid, "daily_progress");
                const q = query(progressRef, orderBy("date", "desc"), limit(days));
                const querySnapshot = await getDocs(q);

                return querySnapshot.docs.map(doc => doc.data() as DailyProgress);
            } catch (error) {
                console.error("Error fetching progress history:", error);
            }
        }
        return [];
    }
}

export const storage = new StorageService();
