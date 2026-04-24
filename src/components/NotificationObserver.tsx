import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import type { Member } from '../types';

const STUDENT_BOND_KEY = 'davveroId_student_identity';
const STUDENT_TRACK_KEY = 'davveroId_student_track_ra';
const NOTIF_STATUS_KEY = (id: string) => `davveroId_notif_status_${id}`;

export default function NotificationObserver() {
  const lastProcessedTime = useRef(Date.now());
  const notifiedIds = useRef(new Set<string>());

  useEffect(() => {
    // 1. ADMIN SUBSCRIPTION
    const checkAndSubscribeAdmin = () => {
      const isMasterLogged = localStorage.getItem('adminMasterLogged') === 'true';
      if (!isMasterLogged) return null;

      // Disable automatic permission request on interval
      // if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      //    Notification.requestPermission();
      // }

      lastProcessedTime.current = Date.now();
      
      const qActions = query(
        collection(db, `artifacts/${appId}/public/data/students`),
        where('hasPendingAction', '==', true)
      );

      const unsubActions = onSnapshot(qActions, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || (change.type === 'modified' && !notifiedIds.current.has(change.doc.id))) {
            const data = change.doc.data() as Member;
            const docId = change.doc.id;
            const created = data.createdAt ? new Date(data.createdAt).getTime() : Date.now();
            
            if (created > lastProcessedTime.current && !notifiedIds.current.has(docId)) {
              const title = data.isApproved === false ? '🎒 Nova Solicitação' : '✏️ Sugestão de Edição';
              const body = data.isApproved === false 
                ? `Estudante ${data.name} solicitou uma nova identidade digital.` 
                : `Estudante ${data.name} enviou uma proposta de alteração de dados.`;

              sendNotification(title, { body, tag: `pending-${docId}` });
              notifiedIds.current.add(docId);
            }
          } else if (change.type === 'removed') {
            notifiedIds.current.delete(change.doc.id);
          }
        });
      });

      return unsubActions;
    };

    // 2. STUDENT SUBSCRIPTION (BONDED OR TRACKED)
    const checkAndSubscribeStudent = () => {
      const bondedId = localStorage.getItem(STUDENT_BOND_KEY);
      const trackRa = localStorage.getItem(STUDENT_TRACK_KEY);
      if (!bondedId && !trackRa) return null;

      // Disable automatic permission request on interval
      // if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      //    Notification.requestPermission();
      // }

      // Query by alphaCode (bonded) OR RA (tracked)
      const qStudent = query(
        collection(db, `artifacts/${appId}/public/data/students`),
        bondedId 
          ? where('alphaCode', '==', bondedId) 
          : where('ra', '==', trackRa)
      );

      return onSnapshot(qStudent, (snapshot) => {
        if (snapshot.empty) return;
        
        const data = snapshot.docs[0].data() as Member;
        const id = bondedId || trackRa || 'unknown';
        const statusKey = NOTIF_STATUS_KEY(id);
        const lastStatus = localStorage.getItem(statusKey);
        
        const currentStatus = `${data.isApproved}_${data.isActive}_${data.validityDate}`;

        if (lastStatus && lastStatus !== currentStatus) {
           // Notify about change
           if (data.isApproved && !lastStatus.startsWith('true')) {
              sendNotification('✅ Pedido Aprovado!', {
                body: `Sua carteirinha ${data.name} foi aprovada. Verifique seu e-mail para o código de uso.`
              });
           } else if (!data.isActive && lastStatus.includes('_true_')) {
              sendNotification('⚠️ Alerta de Status', {
                body: `A carteirinha de ${data.name} foi desativada ou recusada.`
              });
           } else if (data.validityDate && !lastStatus.endsWith(data.validityDate || '')) {
              sendNotification('📅 Validade Atualizada', {
                body: `A validade da sua carteirinha foi atualizada para ${data.validityDate}.`
              });
           }
        }
        
        // Expiry check
        if (data.validityDate && data.isActive && data.isApproved) {
           const expiry = new Date(data.validityDate).getTime();
           const now = Date.now();
           const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
           
           const lastExpiryNotif = localStorage.getItem(`notif_expiry_${id}`);
           if (daysLeft <= 30 && daysLeft > 0 && lastExpiryNotif !== 'true') {
              sendNotification('⏳ Vencimento Próximo', {
                body: `Sua carteirinha vence em ${daysLeft} dias. Solicite a renovação em breve.`
              });
              localStorage.setItem(`notif_expiry_${id}`, 'true');
           } else if (daysLeft <= 0 && lastExpiryNotif !== 'expired') {
              sendNotification('🚫 Carteirinha Vencida', {
                 body: `Sua carteirinha expirou em ${data.validityDate}. Solicite uma nova emissão.`
              });
              localStorage.setItem(`notif_expiry_${id}`, 'expired');
           }
        }

        localStorage.setItem(statusKey, currentStatus);
      });
    };

    let unsubAdmin = checkAndSubscribeAdmin();
    let unsubStudent = checkAndSubscribeStudent();

    const interval = setInterval(() => {
       // Sync Admin
       const isMasterLogged = localStorage.getItem('adminMasterLogged') === 'true';
       if (isMasterLogged && !unsubAdmin) {
           unsubAdmin = checkAndSubscribeAdmin();
       } else if (!isMasterLogged && unsubAdmin) {
           unsubAdmin();
           unsubAdmin = null;
       }

       // Sync Student
       const hasBond = !!localStorage.getItem(STUDENT_BOND_KEY);
       const hasTrack = !!localStorage.getItem(STUDENT_TRACK_KEY);
       if ((hasBond || hasTrack) && !unsubStudent) {
           unsubStudent = checkAndSubscribeStudent();
       } else if (!(hasBond || hasTrack) && unsubStudent) {
           unsubStudent();
           unsubStudent = null;
       }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (unsubAdmin) unsubAdmin();
      if (unsubStudent) unsubStudent();
    };
  }, []);

  const sendNotification = (title: string, options: NotificationOptions) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          ...options,
          icon: '/icon.svg',
          badge: '/icon.svg'
        });
      } catch (e) {
        console.error("Failed to show notification", e);
      }
    }
  };

  return null;
}
