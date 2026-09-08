// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Node and user-profile fields are optional. Firestore does not accept an
// explicit `undefined` value, so omit optional fields that have not been set.
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

const auth = getAuth(app);

const storage = getStorage(app, "gs://dev-gia-pha-ho-le-3e8eb.firebasestorage.app");

const provider = new GoogleAuthProvider();

export { auth, db, storage, provider };
