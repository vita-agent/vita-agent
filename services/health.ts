import { Capacitor } from '@capacitor/core';

export interface HealthData {
    steps: number;
    caloriesBurned: number;
    distance: number; // meters
}

class HealthService {
    private hasPermissions: boolean = false;

    async requestPermissions(): Promise<boolean> {
        if (Capacitor.isNativePlatform()) {
            // TODO: Implement Native HealthKit/HealthConnect permission request
            // For now, return false to trigger fallback
            console.warn("Native Health Plugin not installed or configured.");
            return false;
        }
        return false;
    }

    async getDailyProgress(): Promise<HealthData> {
        if (Capacitor.isNativePlatform() && this.hasPermissions) {
            // TODO: Fetch from native plugin
            return { steps: 0, caloriesBurned: 0, distance: 0 };
        }

        // Fallback / Web Mock
        // In a real app, this might come from manual user entry or Pedometer API (if available)
        return {
            steps: 0,
            caloriesBurned: 0,
            distance: 0
        };
    }
}

export const health = new HealthService();
