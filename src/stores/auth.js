import { defineStore } from 'pinia'
import {
  // Google 登录两种方式 + 结果处理
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  // 登录态监听 / 资料更新 / 其他邮箱登录方法
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/api/firebase'

// ---------- 工具：角色规范化 + 确保有 Firestore 用户文档 ----------
function normalizeRole(r) {
  if (!r) return 'student'         // 你的默认角色
  r = String(r).trim().toLowerCase()
  // 如果你后面把路由里“普通用户”统一叫 user，也可以在这里把 user 映射回 student
  if (['admin', 'counselor', 'student', 'user'].includes(r)) {
    return r === 'user' ? 'student' : r
  }
  return 'student'
}

async function ensureUserDoc(firebaseUser, { role = 'student' } = {}) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const payload = {
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      role: normalizeRole(role),
      provider: 'google',
      createdAt: serverTimestamp(),
    }
    await setDoc(ref, payload)
    return payload
  }

  const data = snap.data()
  if (!data.role) {
    await setDoc(ref, { role: 'student' }, { merge: true })
    data.role = 'student'
  }
  return data
}

// ---------- Pinia Store ----------
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,        // { uid, email, displayName, role }
    loading: false,
    error: null,
    _inited: false,
  }),

  getters: {
    isLoggedIn:  (s) => !!s.user,
    isAdmin:     (s) => s.user?.role === 'admin',
    isCounselor: (s) => s.user?.role === 'counselor',
    isStudent:   (s) => s.user?.role === 'student' || (!s.user?.role),
  },

  actions: {
    // -------- 初始化：优先处理重定向结果，然后监听登录态 --------
    async init() {
      if (this._inited) return
      this._inited = true

      // 处理（可能存在的）Google 重定向结果
      try {
        const res = await getRedirectResult(auth)
        if (res?.user) {
          const prof = await ensureUserDoc(res.user, { role: 'student' })
          this.user = {
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: res.user.displayName || '',
            role: normalizeRole(prof.role),
          }
        }
      } catch (e) {
        // 不阻塞应用
        console.debug('getRedirectResult error (ignored):', e)
      }

      // 持续监听登录态
      onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          this.user = null
          return
        }

        // 拉取/补齐用户档案
        const ref = doc(db, 'users', fbUser.uid)
        const snap = await getDoc(ref)
        const base = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || '',
          role: 'student',
        }

        if (snap.exists()) {
          const data = snap.data()
          this.user = {
            ...base,
            displayName: data.displayName || base.displayName,
            role: normalizeRole(data.role || 'student'),
          }
        } else {
          const created = await ensureUserDoc(fbUser, { role: 'student' })
          this.user = { ...base, role: normalizeRole(created.role) }
        }
      })
    },

    // -------- 显式拉档（你的原逻辑保留）--------
    async fetchProfile(uid, fbUserMaybe) {
      const uid_ = uid || auth.currentUser?.uid
      if (!uid_) return

      const snap = await getDoc(doc(db, 'users', uid_))
      if (snap.exists()) {
        const data = snap.data()
        this.user = {
          uid: uid_,
          email: (fbUserMaybe?.email || auth.currentUser?.email || data.email || ''),
          displayName: (data.displayName || fbUserMaybe?.displayName || auth.currentUser?.displayName || ''),
          role: normalizeRole(data.role || 'student'),
        }
      } else {
        const email = fbUserMaybe?.email || auth.currentUser?.email || ''
        const displayName = fbUserMaybe?.displayName || auth.currentUser?.displayName || ''
        await setDoc(doc(db, 'users', uid_), {
          email,
          displayName,
          role: 'student',
          createdAt: serverTimestamp(),
        })
        this.user = { uid: uid_, email, displayName, role: 'student' }
      }
    },

    // -------- 注册（你的原逻辑，补了角色规范化）--------
    async register({ email, password, displayName = '', role = 'student' }) {
      this.error = null
      this.loading = true
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) {
          await updateProfile(cred.user, { displayName })
        }

        const roleToSave = normalizeRole(role)

        await setDoc(doc(db, 'users', cred.user.uid), {
          email,
          displayName,
          role: roleToSave,
          createdAt: serverTimestamp(),
        })

        this.user = {
          uid: cred.user.uid,
          email,
          displayName,
          role: roleToSave,
        }
        return cred.user
      } catch (e) {
        this.error = e.message || String(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    // -------- 邮箱密码登录（保留你的实现）--------
    async login(email, password) {
      this.error = null
      this.loading = true
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        await this.fetchProfile(cred.user.uid, cred.user)
        return cred.user
      } catch (e) {
        this.error = e.message || String(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    // -------- Google 登录：先弹窗，失败自动降级为重定向 --------
    async loginWithGoogle() {
      this.error = null
      this.loading = true
      try {
        // 1) 先尝试弹窗（多数浏览器可用）
        const res = await signInWithPopup(auth, googleProvider)
        const prof = await ensureUserDoc(res.user, { role: 'student' })
        this.user = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || '',
          role: normalizeRole(prof.role),
        }
        return res.user
      } catch (e) {
        // Safari/严格设置时常见：弹窗被拦/被用户关闭 → 自动退回“重定向”
        if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, googleProvider)
          return
        }
        this.error = e.message || String(e)
        throw e
      } finally {
        // 注意：发生“重定向”时，这里的 finally 通常不会执行（浏览器已跳转）
        this.loading = false
      }
    },

    // -------- 退出 --------
    async logout() {
      await signOut(auth)
      this.user = null
    },
  },
})