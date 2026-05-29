// Notification utilities for LifeOS
import { toast } from 'sonner';

/**
 * Show a toast notification
 */
export const showToast = ({
  title,
  description,
  type = 'info',
  duration = 4000,
}: {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}) => {
  const options = {
    description,
    duration,
  };

  switch (type) {
    case 'success':
      toast.success(title, options);
      break;
    case 'error':
      toast.error(title, options);
      break;
    case 'warning':
      toast.warning(title, options);
      break;
    default:
      toast.info(title, options);
  }
};

/**
 * Show desktop notification (Electron or Web)
 */
export const showDesktopNotification = ({
  title,
  body,
  icon = '/icons/icon-192x192.png',
  tag,
}: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}) => {
  // Check if running in Electron
  if (window.electron?.notifications) {
    window.electron.notifications.show(title, body);
    return;
  }

  // Check if browser notifications are supported and permitted
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon,
        tag,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon,
            tag,
          });
        }
      });
    }
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = (): boolean => {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
};

/**
 * Schedule a notification for a specific time
 * Note: This uses setTimeout and will only work while the app is running
 */
export const scheduleNotification = ({
  title,
  body,
  scheduledTime,
}: {
  title: string;
  body: string;
  scheduledTime: Date;
}): (() => void) => {
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay <= 0) {
    // Time has already passed, show immediately
    showDesktopNotification({ title, body });
    return () => {}; // No-op cleanup
  }

  const timeoutId = setTimeout(() => {
    showDesktopNotification({ title, body });
  }, delay);

  // Return cleanup function
  return () => clearTimeout(timeoutId);
};

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Ignore autoplay errors
  });
};

/**
 * Show a persistent notification banner
 */
export const showBannerNotification = ({
  title,
  message,
  action,
  onAction,
}: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  action?: string;
  onAction?: () => void;
}) => {
  // This would integrate with a banner notification system
  // For now, we'll use toast as a fallback
  const toastId = toast(message, {
    description: title,
    duration: 0, // Persistent
    action: action
      ? {
          label: action,
          onClick: () => {
            onAction?.();
            toast.dismiss(toastId);
          },
        }
      : undefined,
  });

  return toastId;
};

/**
 * Dismiss a notification
 */
export const dismissNotification = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Show a loading toast that can be updated
 */
export const showLoadingToast = (message: string): {
  id: string | number;
  success: (title: string) => void;
  error: (title: string) => void;
  dismiss: () => void;
} => {
  const id = toast.loading(message);

  return {
    id,
    success: (title: string) => {
      toast.success(title, { id });
    },
    error: (title: string) => {
      toast.error(title, { id });
    },
    dismiss: () => {
      toast.dismiss(id);
    },
  };
};
