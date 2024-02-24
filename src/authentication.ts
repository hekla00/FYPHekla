import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { auth as firebaseAuth } from "./firebase";

interface Auth {
  loggedIn: boolean;
  // ? means optional
  userID?: string;
}

interface AuthInit {
  loading: boolean;
  auth?: Auth;
}

// Initialize a context
export const authContext = React.createContext({ loggedIn: false });
// useAuth calls useContext with our authContext to access the current context value
export function useAuth(): Auth {
  return useContext(authContext);
}

// useAuthInit initializes the auth state, setting loading to true until the initial auth check is complete
export function useAuthInit(): AuthInit {
  const [authInit, setAuthInit] = useState<AuthInit>({
    loading: true,
  });
  console.log(authInit);

  useEffect(() => {
    // This is a listener that will be called when the user logs in or logs out
    return firebaseAuth.onAuthStateChanged((firebaseUser) => {
      const auth = firebaseUser
        ? { loggedIn: true, userID: firebaseUser.uid }
        : { loggedIn: false };
      setAuthInit({ loading: false, auth });
    });
  }, []);
  return authInit;
}
