import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Home.css';
import { Redirect } from 'react-router';
import { useAuth } from '../authentication';
import { auth } from '../firebase';
import { useState } from 'react';
import { firestore } from '../firebase';

const RegisterPage: React.FC = () => {
  const { loggedIn } = useAuth();
  //state variables for login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: false });

  const handleRegister = async () => {
    //   try {
    //     setStatus({ loading: true, error: false });
    //     const credential = await auth.createUserWithEmailAndPassword(
    //       email,
    //       password
    //     );
    //     console.log('credential: ', credential);
    //     // setStatus({ loading: false, error: true });
    //     // this is done to let the app know that the user is logged in
    //     // onLogin();
    //     // Save the user credential information to the 'users' collection
    //     const userRef = firestore.collection('users').doc(credential.user.uid);
    //     await userRef.set({
    //       email: credential.user.email,
    //       // Add any other user properties you want to save here
    //     });
    //     // Save the user's email and ID to the 'publicUsers' collection
    //     const publicUserRef = firestore
    //       .collection('publicUsers')
    //       .doc(credential.user.uid);
    //     await publicUserRef.set({
    //       email: credential.user.email,
    //       id: credential.user.uid,
    //     });
    //   } catch (error) {
    //     // if the user enters wrong credentials, the error is set to true
    //     setStatus({ loading: false, error: true });
    //     console.log('error: ', error);
    //   }
    //   // console.log("email: ", email);
    //   // console.log("password: ", password);
    // };const handleRegister = async () => {
    try {
      setStatus({ loading: true, error: false });

      // Validate password length
      if (password.length < 6) {
        setStatus({ loading: false, error: true });
        console.log('Error: Password must be at least 6 characters long');
        return;
      }

      const credential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      console.log('credential: ', credential);

      const userRef = firestore.collection('users').doc(credential.user.uid);
      await userRef.set({
        email: credential.user.email,
        // Add any other user properties you want to save here
      });

      const publicUserRef = firestore
        .collection('publicUsers')
        .doc(credential.user.uid);
      await publicUserRef.set({
        email: credential.user.email,
        id: credential.user.uid,
      });
    } catch (error) {
      setStatus({ loading: false, error: true });
      console.log('error: ', error);
    }
  };
  if (loggedIn) {
    return <Redirect to='/my/home' />;
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Register</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        {/* Creating login form */}
        <IonList>
          <IonItem>
            <IonInput
              label='Email'
              labelPlacement='stacked'
              type='email'
              value={email}
              onIonChange={(event) => setEmail(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label='Password'
              labelPlacement='stacked'
              type='password'
              value={password}
              onIonChange={(event) => setPassword(event.detail.value)}
            />
          </IonItem>
        </IonList>
        {/* display error message if the user enters wrong credentials */}
        {status.error && <IonText color='danger'>Registration failed</IonText>}
        <IonButton expand='block' onClick={handleRegister}>
          Create an account
        </IonButton>
        <IonButton expand='block' fill='clear' routerLink='/login'>
          Already have an account?
        </IonButton>
        <IonLoading isOpen={status.loading} />
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
