import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, appId, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Notification } from '../types';

export function useNotifications(recipientId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!recipientId || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch(console.error);
      }
      return;
    }

    const q = query(
      collection(db, `artifacts/${appId}/public/data/notifications`),
      where("recipientId", "in", [recipientId, "todos"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      // Sort client-side mostly since composite index might be needed otherwise
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(notifs);
      
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);

      // Update PWA badge
      if ('setAppBadge' in navigator && unread > 0) {
        navigator.setAppBadge(unread).catch(console.error);
      } else if ('clearAppBadge' in navigator && unread === 0) {
        navigator.clearAppBadge().catch(console.error);
      }
    }, (error) => {
      // Missing or insufficient permissions means the user hasn't updated their external Firebase rules yet
      if (error?.code !== 'permission-denied' && !error?.message?.includes('Missing or insufficient permissions')) {
        console.error("Notifications snapshot error:", error);
      }
    });

    return () => unsubscribe();
  }, [recipientId, isAuthenticated]);

  return { notifications, unreadCount };
}
