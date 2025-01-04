import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/config.js";
import bcrypt from "bcryptjs";
import { notifyEmployeeAdded } from "./notificaiton.js";

interface EmployeeData {
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  phone: string;
  address: string;
  emailVerified: boolean;
  kycVerified: boolean;
  suspended: boolean;
}

interface ManagerData extends Omit<EmployeeData, "password"> {
  hashedPassword: string;
  userType: "manager";
  uid: string;
  createdAt: Date;
}

export const createOrReactivateEmployee = async (
  employeeData: EmployeeData
): Promise<void> => {
  try {
    // Check if user exists in managers collection
    const managersRef = collection(db, "managers");
    const q = query(managersRef, where("email", "==", employeeData.email));
    const querySnapshot = await getDocs(q);
    const userExists = !querySnapshot.empty;

    console.log("userExists", userExists, employeeData);

    if (userExists) {
      const existingManagerDoc = querySnapshot.docs[0];
      const existingManagerId = existingManagerDoc.id;

      // Update the existing document with new data and reactivate
      const updatedManagerData = {
        name: employeeData.name,
        department: employeeData.department,
        designation: employeeData.designation,
        phone: employeeData.phone,
        address: employeeData.address,
        emailVerified: employeeData.emailVerified,
        kycVerified: employeeData.kycVerified,
        suspended: false,
        reactivatedAt: new Date(),
        status: "active",
        updatedAt: new Date(),
      };

      await updateDoc(
        doc(db, "managers", existingManagerId),
        updatedManagerData
      );

      return Promise.resolve();
    }

    // If user doesn't exist, create new account
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      employeeData.email,
      employeeData.password
    );

    // Prepare manager data for Firestore
    const managerData: ManagerData = {
      name: employeeData.name,
      email: employeeData.email,
      department: employeeData.department,
      designation: employeeData.designation,
      phone: employeeData.phone,
      address: employeeData.address,
      emailVerified: employeeData.emailVerified,
      kycVerified: employeeData.kycVerified,
      hashedPassword,
      userType: "manager",
      uid: userCredential.user.uid,
      suspended: false,
      status: "active",
      createdAt: new Date(),
    };

    // Store manager data in Firestore
    await setDoc(doc(db, "managers", userCredential.user.uid), managerData);
    await notifyEmployeeAdded(employeeData.name);
    return Promise.resolve();
  } catch (error: any) {
    // Handle specific Firebase errors
    if (error.code === "auth/email-already-in-use") {
      throw new Error(
        "An account with this email already exists but couldn't be reactivated. Please check the manager collection."
      );
    }
    if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address.");
    }
    if (error.code === "auth/weak-password") {
      throw new Error("Password should be at least 6 characters.");
    }

    console.error("Error in createOrReactivateEmployee:", error);
    throw new Error("Failed to create or reactivate employee account.");
  }
};
