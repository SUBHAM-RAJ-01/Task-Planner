import { useEffect, useState } from 'react';
import { getFirestore, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../firebase/useAuth';

export function useFirestoreEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user, db]);

  // CRUD functions
  const addEvent = async (event) => {
    await addDoc(collection(db, 'users', user.uid, 'events'), event);
  };
  const updateEvent = async (id, updates) => {
    await updateDoc(doc(db, 'users', user.uid, 'events', id), updates);
  };
  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'events', id));
  };

  return { events, addEvent, updateEvent, deleteEvent };
} 