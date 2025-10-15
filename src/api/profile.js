import { db } from '@/api/firebase'
import {
  doc, setDoc, getDoc, serverTimestamp,
  collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore'

export function dayKey(date = new Date()) {
  // YYYY-MM-DD
  return new Date(date.getTime() - date.getTimezoneOffset()*60000)
    .toISOString().slice(0,10)
}

export async function loadToday(uid) {
  const key = dayKey()
  const ref = doc(db, 'profiles', uid, 'daily', key)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export async function saveToday(uid, payload) {
  const key = dayKey()
  const ref = doc(db, 'profiles', uid, 'daily', key)
  await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true })
}

export async function loadLastNDays(uid, n = 7) {
  
  const col = collection(db, 'profiles', uid, 'daily')
  const snaps = await getDocs(col)
  const items = []
  snaps.forEach(s => items.push({ day: s.id, ...s.data() }))
  items.sort((a,b) => a.day < b.day ? 1 : -1)
  return items.slice(0, n)
}