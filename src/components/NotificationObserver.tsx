import { useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const STUDENT_BOND_KEY = 'davveroId_student_identity';
const STUDENT_TRACK_KEY = 'davveroId_student_track_ra';

export default function NotificationObserver() {
  const isMasterLogged = localStorage.getItem('adminMasterLogged') === 'true';
  const bondedId = localStorage.getItem(STUDENT_BOND_KEY) || localStorage.getItem(STUDENT_TRACK_KEY);
  
  // Determine recipient for notifications (admin or the specific student)
  const recipientId = isMasterLogged ? "admin" : bondedId ? bondedId : null;

  // Use the central hook that reads the 'notifications' collection and sets PWA Badge
  const { notifications, unreadCount } = useNotifications(recipientId);

  useEffect(() => {
    // Also request notification permission so we can show Toast/Alert if needed
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  // For PWA Push / Badge sync
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch(console.error);
      } else {
        navigator.clearAppBadge().catch(console.error);
      }
    }
  }, [unreadCount]);

  return null;
}
