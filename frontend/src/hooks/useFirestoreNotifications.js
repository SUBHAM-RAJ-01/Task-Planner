import { useEffect, useState } from 'react';
import { getFirestore, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../firebase/useAuth';

export function useFirestoreNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'notifications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user, db]);

  // CRUD functions
  const addNotification = async (notification) => {
    await addDoc(collection(db, 'users', user.uid, 'notifications'), notification);
  };
  const updateNotification = async (id, updates) => {
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), updates);
  };
  const deleteNotification = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'notifications', id));
  };

  return { notifications, addNotification, updateNotification, deleteNotification };
} 