import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyB4EtYfn1CTtYPVgNB_bgwXrdnZPbmYS7c",
  authDomain: "stockmarkettools-6612a.firebaseapp.com",
  projectId: "stockmarkettools-6612a",
  storageBucket: "stockmarkettools-6612a.appspot.com",
  messagingSenderId: "229054118439",
  appId: "1:229054118439:web:c87e8154fef96d9f73ac02",
  databaseURL: "https://stockmarkettools-6612a-default-rtdb.firebaseio.com",
  measurementId: "G-RX1GBHPKYC"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase();
export { db }
