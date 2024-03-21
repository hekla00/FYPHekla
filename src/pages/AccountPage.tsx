import React, { useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonText,
} from '@ionic/react';
import firebase from 'firebase/app';

const AccountPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState(null);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userRef = firebase
        .firestore()
        .collection('users')
        .doc(currentUser.uid);
      const doc = await userRef.get();
      if (doc.exists) {
        setUserInfo(doc.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchUserInfo();
  }, [currentUser]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account</IonTitle>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/my/settings' />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>
          <IonText>First Name: {userInfo?.firstName}</IonText>
        </div>
        <div>
          <IonText>Last Name: {userInfo?.lastName}</IonText>
        </div>
        <div>
          <IonText>Email: {userInfo?.email}</IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccountPage;
