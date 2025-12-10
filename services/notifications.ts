import { LocalNotifications } from '@capacitor/local-notifications';
import { Reminder } from '../types';

export class NotificationService {

    async requestPermissions(): Promise<boolean> {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    }

    async scheduleReminder(reminder: Reminder) {
        if (!reminder.date || !reminder.time) return;

        const dateParts = reminder.date.split('-').map(Number);
        const timeParts = reminder.time.split(':').map(Number);
        const scheduleDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);

        // If date is in past, don't schedule (unless it's recurring, logic simplified for MVP)
        if (scheduleDate.getTime() < Date.now() && reminder.frequency === 'Once') return;

        try {
            await LocalNotifications.schedule({
                notifications: [{
                    title: `Vita: ${reminder.title}`,
                    body: reminder.notes || `Time for your ${reminder.type}`,
                    id: Math.abs(this.hashCode(reminder.id)),
                    schedule: { at: scheduleDate, allowWhileIdle: true },
                    sound: 'beep.wav',
                    attachments: [],
                    actionTypeId: '',
                    extra: null
                }]
            });
        } catch (e) {
            console.error("Failed to schedule notification", e);
        }
    }

    async cancelReminder(id: string) {
        await LocalNotifications.cancel({ notifications: [{ id: Math.abs(this.hashCode(id)) }] });
    }

    private hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash;
    }
}

export const notifications = new NotificationService();
