import { useEffect, useState } from 'react';
import { getFirestore, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../firebase/useAuth';

export function useFirestoreTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'tasks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user, db]);

  // CRUD functions
  const addTask = async (task) => {
    await addDoc(collection(db, 'users', user.uid, 'tasks'), task);
  };
  const updateTask = async (id, updates) => {
    await updateDoc(doc(db, 'users', user.uid, 'tasks', id), updates);
  };
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
  };

  return { tasks, addTask, updateTask, deleteTask };
} 