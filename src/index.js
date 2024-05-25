// Import the functions you need from the SDKs you need
//https://stackoverflow.com/questions/4037939/powershell-says-execution-of-scripts-is-disabled-on-this-system
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4EtYfn1CTtYPVgNB_bgwXrdnZPbmYS7c",
  authDomain: "stockmarkettools-6612a.firebaseapp.com",
  projectId: "stockmarkettools-6612a",
  storageBucket: "stockmarkettools-6612a.appspot.com",
  messagingSenderId: "229054118439",
  appId: "1:229054118439:web:c87e8154fef96d9f73ac02",
  measurementId: "G-RX1GBHPKYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);


onAuthStateChange(auth, user =>{
if(user.isAuthenticated){
console.log("User is authenticated")}else{
console.log("User is not authenticated")}
}
})