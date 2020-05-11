import React, { useState } from "react";
import "./App.css";
import withFireAuth, { WrappedComponentProps } from "./withFireAuth";
import firebase from "firebase";
import axios from "axios";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseAppAuth = firebaseApp.auth();

function App(Props: WrappedComponentProps) {
  const { user, signOut, signInWithGoogle } = Props;
  const [backendRes, setBackendRes] = useState<string>("no response");

  // Sample backend request with JWT
  // JWT will need to be validated server side
  const reqBackend = async () => {
    const result = await user?.getIdTokenResult();
    axios
      .get("http://localhost:8080/", {
        headers: { authorization: `Bearer ${result?.token}` },
      })
      .then((res) => setBackendRes(res.data))
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="App">
      <h1>Firebase Auth App</h1>
      {user ? (
        <button onClick={signOut}>Log Out</button>
      ) : (
        <button onClick={signInWithGoogle}>Log In</button>
      )}
      {user ? (
        <div>
          <div className="user-profile">
            <img src={user.photoURL!} />
          </div>
          <div className="backend-res">
            <button onClick={reqBackend}>Req Backend</button>
            <p>{backendRes}</p>
          </div>
        </div>
      ) : (
        <div className="wrapper">
          <p>You must be logged in to see this.</p>
        </div>
      )}
    </div>
  );
}

export default withFireAuth(firebaseAppAuth)(App);
