import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Member, Task, Communication, Event, Workflow } from '@/types/models';

const COLLECTIONS = {
  MEMBERS: 'members',
  TASKS: 'tasks',
  COMMUNICATIONS: 'communications',
  EVENTS: 'events',
  GROUPS: 'connectGroups',
  WORKFLOWS: 'workflows',
  MINISTRIES: 'ministries',
} as const;

export const firestoreService = {
  // Members
  async createMember(data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.MEMBERS), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async getMembers(): Promise<Member[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.MEMBERS));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Member[];
  },

  async getMemberById(id: string): Promise<Member | null> {
    const docRef = doc(db, COLLECTIONS.MEMBERS, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Member;
  },

  async updateMember(id: string, data: Partial<Member>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MEMBERS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteMember(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.MEMBERS, id));
  },

  // Tasks
  async createTask(data: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getTasksByMember(memberId: string): Promise<Task[]> {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('memberId', '==', memberId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  },

  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.TASKS, id), data);
  },

  // Communications
  async createCommunication(data: Omit<Communication, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.COMMUNICATIONS), data);
    return docRef.id;
  },

  async getCommunicationsByMember(memberId: string): Promise<Communication[]> {
    const q = query(
      collection(db, COLLECTIONS.COMMUNICATIONS),
      where('memberId', '==', memberId),
      orderBy('sentAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Communication[];
  },

  // Events
  async createEvent(data: Omit<Event, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), data);
    return docRef.id;
  },

  async getEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, id), data);
  },

  // Workflows
  async createWorkflow(data: Omit<Workflow, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.WORKFLOWS), data);
    return docRef.id;
  },

  async getWorkflows(): Promise<Workflow[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.WORKFLOWS));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Workflow[];
  },

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.WORKFLOWS, id), data);
  },

  async deleteWorkflow(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.WORKFLOWS, id));
  },
};
