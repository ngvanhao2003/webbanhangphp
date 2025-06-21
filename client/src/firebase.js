import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAhe5JJMeIkrKTg3ln1RxSABJagC9jjbQ4",
  authDomain: "democc-d09f7.firebaseapp.com",
  projectId: "democc-d09f7",
  storageBucket: "democc-d09f7.appspot.com",
  messagingSenderId: "987973156196",
  appId: "1:987973156196:web:3123422aa31c305ead4e71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const imgDb=getStorage(app) 