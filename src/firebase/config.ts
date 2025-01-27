import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyAmai9YWmUAsAnAYxINXpLG563nOayYExg",
	authDomain: "swift-cargo-45e20.firebaseapp.com",
	projectId: "swift-cargo-45e20",
	storageBucket: "swift-cargo-45e20.firebasestorage.app",
	messagingSenderId: "1061982234565",
	appId: "1:1061982234565:web:bda84e42103644a99f4dac",
	measurementId: "G-N5XYVRX2TE",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
