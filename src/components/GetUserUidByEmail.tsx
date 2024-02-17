import React, { useState } from 'react';
import firebase from 'firebase/app';
const getUserUidByEmail = async (email) => {
  const usersCollection = firebase.firestore().collection('users');

  // Use where clause to filter by email
  const querySnapshot = await usersCollection.where('email', '==', email).get();

  if (querySnapshot.empty) {
    console.error(`No user found with email: ${email}`);
    return null;
  }

  // Assuming email is unique, get the first document
  const userDoc = querySnapshot.docs[0];

  // Return the UID from the user document
  return userDoc.id;
};

export default getUserUidByEmail;
