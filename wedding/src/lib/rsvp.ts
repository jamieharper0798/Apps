import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export const RSVP_COLLECTION = 'weddingRsvps';

export interface RsvpInput {
  firstName: string;
  lastName: string;
  attending: boolean;
  partySize: number;
  guestNames: string;
  dietary: string;
  song: string;
  message: string;
}

export interface Rsvp extends RsvpInput {
  id: string;
  createdAt: Date | null;
  name?: string; // replies sent before the form split first and last name
}

export function guestName(r: Rsvp) {
  return `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || r.name || 'Unnamed guest';
}

// Guests can only create replies. Reading them back is limited to you by the Firestore rules (see README).
export async function submitRsvp(input: RsvpInput) {
  await addDoc(collection(db, RSVP_COLLECTION), { ...input, createdAt: serverTimestamp() });
}

export async function fetchRsvps(): Promise<Rsvp[]> {
  const snap = await getDocs(query(collection(db, RSVP_COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...(data as RsvpInput),
      id: d.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    };
  });
}

// A guest who sends the form twice keeps only their newest reply, matched on their name.
export function latestPerGuest(rsvps: Rsvp[]): Rsvp[] {
  const seen = new Set<string>();
  return rsvps.filter((r) => {
    const key = guestName(r).toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
