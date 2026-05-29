import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  disablePushDevice,
  showForegroundPushToast,
  subscribeToForegroundPush,
  syncPushDevice,
} from '@/lib/pushNotifications';

export const usePushNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const pushEnabled = user?.settings.notifications.push ?? false;
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;

    let isCancelled = false;

    const syncDevice = async () => {
      try {
        if (!pushEnabled) {
          await disablePushDevice(userId);
          return;
        }

        const result = await syncPushDevice(userId);

        if (!result.registered && !isCancelled && result.reason === 'permission-blocked') {
          console.info('Push notifications are enabled in settings, but browser permission is still blocked.');
        }
      } catch (error) {
        if (!isCancelled) {
          console.warn('Unable to sync this browser for Arcora push notifications.', error);
        }
      }
    };

    void syncDevice();

    return () => {
      isCancelled = true;
    };
  }, [pushEnabled, userId]);

  useEffect(() => {
    if (!userId || !pushEnabled) return;

    let unsubscribe = () => {};

    void subscribeToForegroundPush((payload) => {
      showForegroundPushToast(payload);
    }).then((nextUnsubscribe) => {
      unsubscribe = nextUnsubscribe;
    });

    return () => {
      unsubscribe();
    };
  }, [pushEnabled, userId]);
};

export default usePushNotifications;
