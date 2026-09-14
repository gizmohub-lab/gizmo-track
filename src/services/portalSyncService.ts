import {
  Project,
  Client,
  Invoice,
} from '../types';
import {
  loadProjects,
  saveProjects,
  loadClients,
  saveClients,
  loadInvoices,
  saveInvoices,
} from '../data/mockData';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

/**
  * Real-time subscription to projects collection in Firestore.
  * Firestore is the single source of truth.
  */
export function subscribeToProjects(
  callback: (projects: Project[]) => void
): () => void {
  try {
    const colRef = collection(db, 'projects');
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteProjects: Project[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              ...(data as Project),
              id: docSnap.id,
              projectId: docSnap.id,
              title: data.title || data.name || 'Untitled Project',
              status: data.status || 'Active',
              priority: data.priority || 'Normal',
              dueDate: data.dueDate || data.deadlineDate || '',
              budget: typeof data.budget === 'number' ? data.budget : (typeof data.totalAmount === 'number' ? data.totalAmount : 0),
              totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : (typeof data.budget === 'number' ? data.budget : 0),
              amountGot: typeof data.amountGot === 'number' ? data.amountGot : (typeof data.paid === 'number' ? data.paid : 0),
              amountToGet: typeof data.amountToGet === 'number' ? data.amountToGet : 0,
              paymentStatus: data.paymentStatus || 'Not Paid',
              deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
              payments: Array.isArray(data.payments) ? data.payments : [],
              files: Array.isArray(data.files) ? data.files : [],
              revisions: Array.isArray(data.revisions) ? data.revisions : [],
              history: Array.isArray(data.history) ? data.history : [],
              createdAt: data.createdAt || new Date().toISOString(),
            };
          });

          // Firestore is canonical source of truth. Save to local cache and use remote data directly.
          saveProjects(remoteProjects);
          callback(remoteProjects);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error('Error in subscribeToProjects onSnapshot:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize subscribeToProjects:', err);
    return () => {};
  }
}

/**
  * Real-time subscription to clients collection in Firestore.
  */
export function subscribeToClients(
  callback: (clients: Client[]) => void
): () => void {
  try {
    const colRef = collection(db, 'clients');
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteClients: Client[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              ...(data as Client),
              id: docSnap.id,
              name: data.name || 'Unnamed Client',
              createdAt: data.createdAt || new Date().toISOString(),
            };
          });

          saveClients(remoteClients);
          callback(remoteClients);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error('Error in subscribeToClients onSnapshot:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize subscribeToClients:', err);
    return () => {};
  }
}

/**
  * Real-time subscription to invoices collection in Firestore.
  */
export function subscribeToInvoices(
  callback: (invoices: Invoice[]) => void
): () => void {
  try {
    const colRef = collection(db, 'invoices');
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteInvoices: Invoice[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              ...(data as Invoice),
              id: docSnap.id,
              invoiceNo: data.invoiceNo || data.invoiceNumber || 'INV-001',
              invoiceDate: data.invoiceDate || data.date || new Date().toISOString(),
              dueDate: data.dueDate || new Date().toISOString(),
              status: data.status || 'Draft',
              billedBy: data.billedBy || { name: 'GIZMO DESIGN' },
              billedTo: data.billedTo || { clientName: data.clientName || 'Client' },
              supplyInfo: data.supplyInfo || {},
              items: Array.isArray(data.items) ? data.items : [],
              taxType: data.taxType || 'CGST_SGST',
              subtotal: typeof data.subtotal === 'number' ? data.subtotal : 0,
              cgstTotal: typeof data.cgstTotal === 'number' ? data.cgstTotal : 0,
              sgstTotal: typeof data.sgstTotal === 'number' ? data.sgstTotal : 0,
              igstTotal: typeof data.igstTotal === 'number' ? data.igstTotal : 0,
              taxTotal: typeof data.taxTotal === 'number' ? data.taxTotal : 0,
              grandTotal: typeof data.grandTotal === 'number' ? data.grandTotal : (typeof data.totalAmount === 'number' ? data.totalAmount : 0),
              receivedAmount: typeof data.receivedAmount === 'number' ? data.receivedAmount : (typeof data.amountPaid === 'number' ? data.amountPaid : 0),
              balanceAmount: typeof data.balanceAmount === 'number' ? data.balanceAmount : (typeof data.balanceDue === 'number' ? data.balanceDue : 0),
              payments: Array.isArray(data.payments) ? data.payments : [],
              paymentDetails: data.paymentDetails || {},
              history: Array.isArray(data.history) ? data.history : [],
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            };
          });

          saveInvoices(remoteInvoices);
          callback(remoteInvoices);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error('Error in subscribeToInvoices onSnapshot:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize subscribeToInvoices:', err);
    return () => {};
  }
}

/**
  * Sync a project to Firestore.
  */
export async function syncProjectToFirestore(project: Project): Promise<void> {
  if (!project || !project.id) return;
  try {
    await setDoc(doc(db, 'projects', project.id), project, { merge: true });
  } catch (err) {
    console.warn('Failed to sync project to Firestore:', err);
  }
}

/**
  * Sync a client to Firestore.
  */
export async function syncClientToFirestore(client: Client): Promise<void> {
  if (!client || !client.id) return;
  try {
    await setDoc(doc(db, 'clients', client.id), client, { merge: true });
  } catch (err) {
    console.warn('Failed to sync client to Firestore:', err);
  }
}

/**
  * Sync an invoice to Firestore.
  */
export async function syncInvoiceToFirestore(invoice: Invoice): Promise<void> {
  if (!invoice || !invoice.id) return;
  try {
    await setDoc(doc(db, 'invoices', invoice.id), invoice, { merge: true });
  } catch (err) {
    console.warn('Failed to sync invoice to Firestore:', err);
  }
}

/**
  * Delete a project from Firestore.
  */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  if (!projectId) return;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    console.error('Failed to delete project from Firestore:', err);
    throw err;
  }
}

/**
  * Delete a client from Firestore.
  */
export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  if (!clientId) return;
  try {
    await deleteDoc(doc(db, 'clients', clientId));
  } catch (err) {
    console.error('Failed to delete client from Firestore:', err);
    throw err;
  }
}

/**
  * Delete an invoice from Firestore.
  */
export async function deleteInvoiceFromFirestore(invoiceId: string): Promise<void> {
  if (!invoiceId) return;
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));
  } catch (err) {
    console.error('Failed to delete invoice from Firestore:', err);
    throw err;
  }
}

/**
  * Reset all portal data in Firestore across collections.
  */
export async function resetAllFirestoreData(): Promise<void> {
  const collectionsToClear = ['projects', 'clients', 'invoices', 'projectRequests', 'localWorks', 'deadlines', 'notes', 'designers', 'categories'];
  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
    } catch (err) {
      console.warn(`Failed to clear collection ${colName}:`, err);
    }
  }
}
