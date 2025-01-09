// src/contexts/AuthContext.tsx
import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    type User as FirebaseUser,
    sendPasswordResetEmail
} from 'firebase/auth';
import { db, auth } from "../firebase/config.js"
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import Cookies from 'js-cookie';

interface User {
    email: string;
    userType: 'admin' | 'manager';
    uid: string;
    name: string; // Added name property
}


interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const getUserType = async (user: FirebaseUser) => {
        const adminQuery = query(
            collection(db, 'admins'),
            where('email', '==', user.email)
        );
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            return {
                userType: 'admin',
                name: adminData.name || 'Admin',
                suspended: false // Admins cannot be suspended
            };
        }

        // Check managers collection
        const managerQuery = query(
            collection(db, 'managers'),
            where('email', '==', user.email)
        );
        const managerSnapshot = await getDocs(managerQuery);
        if (!managerSnapshot.empty) {
            const managerData = managerSnapshot.docs[0].data();

            // Check if manager is suspended
            if (managerData.suspended) {
                throw new Error('Account suspended. Please contact administrator.');
            }

            return {
                userType: 'manager',
                name: managerData.name || 'Manager',
                suspended: managerData.suspended || false
            };
        }

        return null;
    };
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userInfo = await getUserType(user);
                if (userInfo) {
                    const userData: User = {
                        email: user.email!,
                        userType: userInfo.userType,
                        uid: user.uid
                    };
                    // Add name to userData
                    const userWithDetails = { ...userData, name: userInfo.name };
                    setCurrentUser(userWithDetails);

                    // Store in cookies
                    Cookies.set('user', JSON.stringify(userWithDetails), { expires: 7 });
                } else {
                    await auth.signOut();
                    setCurrentUser(null);
                    Cookies.remove('user');
                }
            } else {
                setCurrentUser(null);
                Cookies.remove('user');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);


    const signIn = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userType = await getUserType(userCredential.user);

            if (!userType) {
                // Sign out the user if they're not found in our collections
                await auth.signOut();
                throw new Error('Unauthorized user');
            }

            if (userType.suspended) {
                // Sign out the user if they're suspended
                await auth.signOut();
                throw new Error('Account suspended. Please contact administrator.');
            }

            return {
                user: userCredential.user,
                userType: userType.userType,
                name: userType.name
            };
        } catch (error: any) {
            // Sign out the user if any error occurs during the process
            await auth.signOut();

            if (error.message === 'Account suspended. Please contact administrator.') {
                throw error;
            }

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                throw new Error('Invalid email or password');
            }

            if (error.code === 'auth/too-many-requests') {
                throw new Error('Too many failed login attempts. Please try again later.');
            }

            throw new Error(error.message || 'Failed to sign in');
        }
    };

    const logout = async () => {
        await signOut(auth);
        Cookies.remove('user');
    };
    const resetPassword = async (email: string) => {
        return sendPasswordResetEmail(auth, email);
    };


    const value = {
        currentUser,
        loading,
        signIn,
        logout,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};