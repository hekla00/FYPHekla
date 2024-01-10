import React, { useContext } from "react";
// Initialize a context
export const authContext = React.createContext({ loggedIn: false });
// useAuth calls useContext with our authContext to access the current context value
export function useAuth() {
  return useContext(authContext);
}
