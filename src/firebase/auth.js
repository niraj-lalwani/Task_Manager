import { signOut, signInWithEmailAndPassword, getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setDoc, getDoc, collection, doc } from "firebase/firestore";


import { db } from "./config";



import app from "./config";


const auth = getAuth(app);



export const createUser = async (user) => {
    console.log('user: ', user);
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            const result = await setDoc(userDocRef, {
                email: user.email,
                role: "user", // Default role

            });
            console.log('result: ', result);
            return user.uid
        }

        return userDoc.id;



    } catch (err) {
        console.log('err: ', err);

    }

}

//* Register
export const registerWithEmailAndPassword = async (email, password, role = "user") => {
    try {
        const createdUser = await createUserWithEmailAndPassword(auth, email, password)

        const documentRef = doc(db, "users", createdUser.user.uid);
        await setDoc(documentRef, {
            email: createdUser.user.email,
            role
        })

        return createdUser.user.uid
    } catch (error) {
        alert(error)
    }
}

//* Login
export const loginWithEmailAndPassword = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user.uid
    } catch (error) {
        alert(error);
    }

}

//* Login With Google
export const loginWithGoogle = async () => {
    try {
        const googleAuthProvider = new GoogleAuthProvider();
        // googleAuthProvider.addScope('https://www.googleapis.com/auth/calendar');


        const result = await signInWithPopup(auth, googleAuthProvider)

        const credential = GoogleAuthProvider.credentialFromResult(result);
        const googleAccessToken = credential.accessToken;

        if (googleAccessToken) {
            console.log("Obtained Google Access Token:", googleAccessToken);
        } else {
            console.warn("Google Access Token not found in sign-in result.");
        }

        const uid = await createUser(result.user)

        return { uid, googleAccessToken };
    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
}

//*Logout
export const logout = () => {
    alert("Are you sure to logout?");
    signOut(auth)
    localStorage.removeItem("uid");
};



export default auth;