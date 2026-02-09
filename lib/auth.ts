
// import { 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   signOut,
//   updateProfile,
//   User
// } from 'firebase/auth'
// import { doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore'
// import { auth, db } from '@/lib/firebase'

// export interface UserRole {
//   id: string
//   email: string
//   name: string
//   allowedPages: string[]
//   createdAt: string
//   updatedAt: string
//   roleName: string
// }

// export interface SessionData {
//   user: {
//     uid: string
//     email: string | null
//     name: string | null
//   }
//   allowedPages: string[]
//   roleName: string
// }

// export async function createUserWithRole(
//   email: string, 
//   password: string, 
//   name: string, 
//   allowedPages: string[],
//   roleName: string
// ) {
//   try {
//     // Firebase authentication mein user create karna
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
//     // User profile update
//     await updateProfile(userCredential.user, {
//       displayName: name
//     })
    
//     // Firestore mein user-role collection mein store karna
//     const userRoleRef = doc(db, 'users-role', userCredential.user.uid)
//     await setDoc(userRoleRef, {
//       email,
//       name,
//       allowedPages,
//       roleName,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     })
    
//     return { success: true, userId: userCredential.user.uid }
//   } catch (error: any) {
//     console.error('Error creating user:', error)
//     return { success: false, error: error.message }
//   }
// }

// export async function getUserRole(uid: string): Promise<UserRole | null> {
//   try {
//     const userRoleRef = doc(db, 'users-role', uid)
//     const docSnap = await getDoc(userRoleRef)
    
//     if (docSnap.exists()) {
//       return {
//         id: docSnap.id,
//         ...docSnap.data()
//       } as UserRole
//     }
//     return null
//   } catch (error) {
//     console.error('Error fetching user role:', error)
//     return null
//   }
// }

// export async function updateUserRole(uid: string, data: Partial<UserRole>) {
//   try {
//     const userRoleRef = doc(db, 'users-role', uid)
//     await updateDoc(userRoleRef, {
//       ...data,
//       updatedAt: new Date().toISOString()
//     })
//     return { success: true }
//   } catch (error: any) {
//     console.error('Error updating user role:', error)
//     return { success: false, error: error.message }
//   }
// }

// export async function deleteUserRole(uid: string) {
//   try {
//     const userRoleRef = doc(db, 'users-role', uid)
//     await setDoc(userRoleRef, { deleted: true })
//     return { success: true }
//   } catch (error: any) {
//     console.error('Error deleting user role:', error)
//     return { success: false, error: error.message }
//   }
// }

// export async function validateCredentials(portal: string, email: string, password: string) {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password)
//     const userRole = await getUserRole(userCredential.user.uid)
    
//     if (!userRole) {
//       return { 
//         success: false, 
//         message: 'User role not found. Please contact administrator.' 
//       }
//     }
    
//     const session: SessionData = {
//       user: {
//         uid: userCredential.user.uid,
//         email: userCredential.user.email,
//         name: userRole.name
//       },
//       allowedPages: userRole.allowedPages,
//       roleName: userRole.roleName
//     }
    
//     return { success: true, session }
//   } catch (error: any) {
//     console.error('Login error:', error)
    
//     let message = 'Login failed. Please check your credentials.'
//     if (error.code === 'auth/user-not-found') {
//       message = 'User not found.'
//     } else if (error.code === 'auth/wrong-password') {
//       message = 'Incorrect password.'
//     } else if (error.code === 'auth/invalid-email') {
//       message = 'Invalid email format.'
//     }
    
//     return { success: false, message, error: error.code }
//   }
// }

// export function storeSession(session: SessionData) {
//   localStorage.setItem('userSession', JSON.stringify(session))
// }

// export function getSession(): SessionData | null {
//   const session = localStorage.getItem('userSession')
//   return session ? JSON.parse(session) : null
// }

// export function clearSession() {
//   localStorage.removeItem('userSession')
// }

// export async function logout() {
//   try {
//     await signOut(auth)
//     clearSession()
//     return { success: true }
//   } catch (error: any) {
//     console.error('Logout error:', error)
//     return { success: false, error: error.message }
//   }
// }

// // FILE: /lib/auth.ts
// // Add these lines at the END of the file, before the closing bracket

// export const DEMO_CREDENTIALS: Record<string, { email: string; password: string }> = {
//   admin: { email: 'admin@homeware.com', password: 'admin123' },
//   manager: { email: 'manager@homeware.com', password: 'manager123' },
//   supervisor: { email: 'supervisor@homeware.com', password: 'supervisor123' },
//   employee: { email: 'employee@homeware.com', password: 'employee123' },
//   client: { email: 'client@homeware.com', password: 'client123' },
//   guest: { email: 'guest@homeware.com', password: 'guest123' }
// };

// export type PortalType = 'admin' | 'manager' | 'supervisor' | 'employee' | 'client' | 'guest';

// new codee
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface UserRole {
  allowedJobs: any
  allowedJobs: boolean
  id: string
  email: string
  name: string
  allowedPages: string[]
  createdAt: string
  updatedAt: string
  roleName: string
}

export interface SessionData {
  user: {
    uid: string
    email: string | null
    name: string | null
  }
  allowedPages: string[]
  roleName: string
}

export async function createUserWithRole(
email: string, password: string, name: string, allowedPages: string[], roleName: string, allowedJobs: string[]) {
  try {
    // Firebase authentication mein user create karna
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // User profile update
    await updateProfile(userCredential.user, {
      displayName: name
    })
    
    // Firestore mein user-role collection mein store karna
    const userRoleRef = doc(db, 'users-role', userCredential.user.uid)
    await setDoc(userRoleRef, {
      email,
      name,
      allowedPages,
      roleName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return { success: true, userId: userCredential.user.uid }
  } catch (error: any) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userRoleRef = doc(db, 'users-role', uid)
    const docSnap = await getDoc(userRoleRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as UserRole
    }
    return null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

export async function updateUserRole(uid: string, data: Partial<UserRole>) {
  try {
    const userRoleRef = doc(db, 'users-role', uid)
    await updateDoc(userRoleRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
    return { success: true }
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteUserRole(uid: string) {
  try {
    const userRoleRef = doc(db, 'users-role', uid)
    await setDoc(userRoleRef, { deleted: true })
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting user role:', error)
    return { success: false, error: error.message }
  }
}

export async function validateCredentials(portal: string, email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userRole = await getUserRole(userCredential.user.uid)
    
    if (!userRole) {
      return { 
        success: false, 
        message: 'User role not found. Please contact administrator.',
        redirectTo: null
      }
    }
    
    const session: SessionData = {
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userRole.name
      },
      allowedPages: userRole.allowedPages,
      roleName: userRole.roleName
    }
    
    return { 
      success: true, 
      session,
      redirectTo: `/${portal}/dashboard`  // ADDED THIS LINE
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    let message = 'Login failed. Please check your credentials.'
    if (error.code === 'auth/user-not-found') {
      message = 'User not found.'
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password.'
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email format.'
    }
    
    return { 
      success: false, 
      message, 
      error: error.code,
      redirectTo: null  // ADDED THIS LINE
    }
  }
}

export function storeSession(session: SessionData) {
  localStorage.setItem('userSession', JSON.stringify(session))
}

export function getSession(): SessionData | null {
  const session = localStorage.getItem('userSession')
  return session ? JSON.parse(session) : null
}

export function clearSession() {
  localStorage.removeItem('userSession')
}

export async function logout() {
  try {
    await signOut(auth)
    clearSession()
    return { success: true }
  } catch (error: any) {
    console.error('Logout error:', error)
    return { success: false, error: error.message }
  }
}

export const DEMO_CREDENTIALS: Record<string, { email: string; password: string }> = {
  admin: { email: 'admin@homeware.com', password: 'admin123' },
  manager: { email: 'manager@homeware.com', password: 'manager123' },
  supervisor: { email: 'supervisor@homeware.com', password: 'supervisor123' },
  employee: { email: 'employee@homeware.com', password: 'employee123' },
  client: { email: 'client@homeware.com', password: 'client123' },
  guest: { email: 'guest@homeware.com', password: 'guest123' }
};

export type PortalType = 'admin' | 'manager' | 'supervisor' | 'employee' | 'client' | 'guest';