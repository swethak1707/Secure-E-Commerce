// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE6J8JdL_C8y4uWqB7vlVouUBypD9K5zY",
  authDomain: "ecommerce-ateam.firebaseapp.com",
  projectId: "ecommerce-ateam",
  storageBucket: "ecommerce-ateam.firebasestorage.app",
  messagingSenderId: "784510708276",
  appId: "1:784510708276:web:7859db6f6fa0cc0c9f7861",
  measurementId: "G-6C1KMRKYJE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics couldn't be initialized:", error);
}

const auth = getAuth(app);
const db = getFirestore(app);

// Email/Password Authentication Functions
const registerWithEmailAndPassword = async (name, email, password, isAdmin = false) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update user profile with name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Save additional user data in Firestore including role
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      name,
      email,
      role: isAdmin ? 'admin' : 'user',
      authProvider: "email",
      createdAt: new Date(),
    });
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get additional user data including role from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    
    // If user document exists, extract the role
    const userData = userDoc.exists() ? userDoc.data() : { role: 'user' };
    
    // Add role to the user object
    const userWithRole = {
      ...userCredential.user,
      role: userData.role
    };
    
    return userWithRole;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error during password reset:", error);
    throw error;
  }
};

const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

// Function to check if user is admin
const checkIfUserIsAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export {
  auth,
  db,
  app,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  resetPassword,
  logoutUser,
  checkIfUserIsAdmin
};