// src/stores/auth.js
import { defineStore } from 'pinia'
import { auth, googleProvider } from '../api/firebase' 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,     
    ready: false,   
    _unsub: null
  }),
  getters: {
    isAuthed: (s) => !!s.user
  },
  actions: {
    async registerEmail (name, email, password) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) await updateProfile(cred.user, { displayName: name })
      this.user = {
        uid: cred.user.uid,
        email: cred.user.email ?? '',
        name: cred.user.displayName ?? name ?? ''
      }
      return this.user
    },

    async loginEmail (email, password) {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      this.user = {
        uid: cred.user.uid,
        email: cred.user.email ?? '',
        name: cred.user.displayName ?? ''
      }
      return this.user
    },

    async loginGoogle () {
      const cred = await signInWithPopup(auth, googleProvider)
      this.user = {
        uid: cred.user.uid,
        email: cred.user.email ?? '',
        name: cred.user.displayName ?? ''
      }
      return this.user
    },

    async logout () {
      await signOut(auth)
      this.user = null
    },

    
    init () {
      if (this._unsub) return
      this._unsub = onAuthStateChanged(auth, (u) => {
        this.user = u
          ? { uid: u.uid, email: u.email ?? '', name: u.displayName ?? '' }
          : null
        this.ready = true
      })
    }
  }
})