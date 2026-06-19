/**
 * Avatar Persona Management
 * 
 * Functions for creating and managing company avatar personas
 */

import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import type { AvatarPersona, Company } from "@/types";

/**
 * Create a new avatar persona
 */
export async function createAvatarPersona(
  userId: string,
  personaData: Omit<
    AvatarPersona,
    "id" | "createdAt" | "updatedAt" | "isActive"
  >
): Promise<string> {
  try {
    const now = Timestamp.now();
    const persona: Omit<AvatarPersona, "id"> = {
      ...personaData,
      createdBy: userId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      isActive: true,
    };

    const docRef = await addDoc(collection(db, "avatarPersonas"), {
      ...persona,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  } catch (error: any) {
    console.error("[avatarPersona] Create error:", error);
    throw new Error(`Failed to create avatar persona: ${error?.message}`);
  }
}

/**
 * Get an avatar persona by ID
 */
export async function getAvatarPersona(
  personaId: string
): Promise<AvatarPersona | null> {
  try {
    const docRef = doc(db, "avatarPersonas", personaId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AvatarPersona;
  } catch (error: any) {
    console.error("[avatarPersona] Get error:", error);
    throw new Error(`Failed to get avatar persona: ${error?.message}`);
  }
}

/**
 * Update an avatar persona
 */
export async function updateAvatarPersona(
  personaId: string,
  updates: Partial<Omit<AvatarPersona, "id" | "createdAt" | "createdBy">>
): Promise<void> {
  try {
    const docRef = doc(db, "avatarPersonas", personaId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error("[avatarPersona] Update error:", error);
    throw new Error(`Failed to update avatar persona: ${error?.message}`);
  }
}

/**
 * Delete an avatar persona
 */
export async function deleteAvatarPersona(personaId: string): Promise<void> {
  try {
    const docRef = doc(db, "avatarPersonas", personaId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error("[avatarPersona] Delete error:", error);
    throw new Error(`Failed to delete avatar persona: ${error?.message}`);
  }
}

/**
 * Get all avatar personas for a user/company
 */
export async function getUserAvatarPersonas(
  userId: string,
  companyId?: string
): Promise<AvatarPersona[]> {
  try {
    let q;
    if (companyId) {
      q = query(
        collection(db, "avatarPersonas"),
        where("createdBy", "==", userId),
        where("companyId", "==", companyId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "avatarPersonas"),
        where("createdBy", "==", userId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const personas: AvatarPersona[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      personas.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AvatarPersona);
    });

    return personas;
  } catch (error: any) {
    console.error("[avatarPersona] Get user personas error:", error);
    throw new Error(
      `Failed to get user avatar personas: ${error?.message}`
    );
  }
}

/**
 * Get system (default) avatar personas
 */
export async function getSystemAvatarPersonas(): Promise<AvatarPersona[]> {
  try {
    const q = query(
      collection(db, "avatarPersonas"),
      where("type", "==", "system"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const personas: AvatarPersona[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      personas.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AvatarPersona);
    });

    return personas;
  } catch (error: any) {
    console.error("[avatarPersona] Get system personas error:", error);
    throw new Error(
      `Failed to get system avatar personas: ${error?.message}`
    );
  }
}

/**
 * Create or update a company
 */
export async function createOrUpdateCompany(
  userId: string,
  companyData: Omit<Company, "id" | "createdAt" | "createdBy">
): Promise<string> {
  try {
    // Check if company already exists for this user
    const q = query(
      collection(db, "companies"),
      where("createdBy", "==", userId),
      where("name", "==", companyData.name)
    );

    const querySnapshot = await getDocs(q);
    let companyId: string;

    if (!querySnapshot.empty) {
      // Update existing company
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...companyData,
        updatedAt: Timestamp.now(),
      });
      companyId = docRef.id;
    } else {
      // Create new company
      const docRef = await addDoc(collection(db, "companies"), {
        ...companyData,
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      companyId = docRef.id;
    }

    return companyId;
  } catch (error: any) {
    console.error("[avatarPersona] Create/update company error:", error);
    throw new Error(`Failed to create/update company: ${error?.message}`);
  }
}

/**
 * Get a company by ID
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  try {
    const docRef = doc(db, "companies", companyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Company;
  } catch (error: any) {
    console.error("[avatarPersona] Get company error:", error);
    throw new Error(`Failed to get company: ${error?.message}`);
  }
}

/**
 * Get all companies for a user
 */
export async function getUserCompanies(userId: string): Promise<Company[]> {
  try {
    const q = query(
      collection(db, "companies"),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const companies: Company[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      companies.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Company);
    });

    return companies;
  } catch (error: any) {
    console.error("[avatarPersona] Get user companies error:", error);
    throw new Error(`Failed to get user companies: ${error?.message}`);
  }
}
