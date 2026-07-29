import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db as firestoreDb } from './firebase';
import type { CallRecord, CoachingReport, AppNotification } from '../types';

// Check if Firebase is fully initialized and operational
const isFirebaseOperational = (): boolean => {
  try {
    return !!firestoreDb;
  } catch {
    return false;
  }
};

/**
 * Sync Call Records
 */
export const getFirestoreCalls = async (): Promise<CallRecord[] | null> => {
  if (!isFirebaseOperational()) return null;
  try {
    const callsCol = collection(firestoreDb, 'calls');
    const q = query(callsCol, orderBy('date', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    const list: CallRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as CallRecord);
    });
    return list.length > 0 ? list : null;
  } catch (error) {
    console.warn('Firestore getFirestoreCalls failed, falling back to local database:', error);
    return null;
  }
};

export const saveFirestoreCall = async (call: CallRecord): Promise<boolean> => {
  if (!isFirebaseOperational()) return false;
  try {
    const callDocRef = doc(firestoreDb, 'calls', call.id);
    await setDoc(callDocRef, call);
    return true;
  } catch (error) {
    console.warn(`Firestore saveFirestoreCall ${call.id} failed:`, error);
    return false;
  }
};

/**
 * Sync Coaching Reports
 */
export const getFirestoreCoachingReports = async (): Promise<CoachingReport[] | null> => {
  if (!isFirebaseOperational()) return null;
  try {
    const reportsCol = collection(firestoreDb, 'coachingReports');
    const q = query(reportsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const list: CoachingReport[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as CoachingReport);
    });
    return list.length > 0 ? list : null;
  } catch (error) {
    console.warn('Firestore getFirestoreCoachingReports failed:', error);
    return null;
  }
};

export const saveFirestoreCoachingReport = async (report: CoachingReport): Promise<boolean> => {
  if (!isFirebaseOperational()) return false;
  try {
    const docRef = doc(firestoreDb, 'coachingReports', report.id);
    await setDoc(docRef, report);
    return true;
  } catch (error) {
    console.warn(`Firestore saveFirestoreCoachingReport ${report.id} failed:`, error);
    return false;
  }
};

/**
 * Sync Notifications
 */
export const getFirestoreNotifications = async (): Promise<AppNotification[] | null> => {
  if (!isFirebaseOperational()) return null;
  try {
    const notificationsCol = collection(firestoreDb, 'notifications');
    const q = query(notificationsCol, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    const list: AppNotification[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
    });
    return list.length > 0 ? list : null;
  } catch (error) {
    console.warn('Firestore getFirestoreNotifications failed:', error);
    return null;
  }
};

export const saveFirestoreNotification = async (notification: AppNotification): Promise<boolean> => {
  if (!isFirebaseOperational()) return false;
  try {
    const docRef = doc(firestoreDb, 'notifications', notification.id);
    await setDoc(docRef, notification);
    return true;
  } catch (error) {
    console.warn(`Firestore saveFirestoreNotification ${notification.id} failed:`, error);
    return false;
  }
};
