import firebase from "firebase/app";
import "firebase/auth";
// import "firebase/firestore";
// import "firebase/storage";
// import "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAETbBmNHu6dwCRaAL43S3-ccx0iE3iLRo",
  authDomain: "fypsandbox-c9903.firebaseapp.com",
  projectId: "fypsandbox-c9903",
  storageBucket: "fypsandbox-c9903.appspot.com",
  messagingSenderId: "245833706588",
  appId: "1:245833706588:web:a7ac613409179b14118a99",
  measurementId: "G-C3PMXKQDKG",
};

// Will need to make this private

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

export const auth = app.auth();
