// $lib/stores/notification.ts
import { writable } from 'svelte/store';
import type { Notification } from '$lib/types';

const createNotificationStore = () => {
    const { subscribe, update } = writable<Notification[]>([]);

    const addNotification = (content: string, type: 'success' | 'error' | 'info', duration: number = 3000) => {
        //const id = crypto.randomUUID();
        const id = Date.now() + Math.random()
        const notification: Notification = {
            id,
            content,
            type,
            duration
        };

        update(notifications => [...notifications, notification]);

        // Auto-remove after duration
        setTimeout(() => {
            removeNotification(id);
        }, duration);

        return id;
    };

    const removeNotification = (id: number) => {
        update(notifications => notifications.filter(n => n.id !== id));
    };

    const clearAll = () => {
        update(() => []);
    };

    return {
        subscribe,
        success: (content: string, duration?: number) => addNotification(content, 'success', duration),
        error: (content: string, duration?: number) => addNotification(content, 'error', duration),
        info: (content: string, duration?: number) => addNotification(content, 'info', duration),
        remove: removeNotification,
        clear: clearAll
    };
};

export const notification = createNotificationStore();