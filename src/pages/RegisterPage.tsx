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
import { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import logo from '../../images/logo.png';
import logo2 from '../../images/logo2.png';
import './Login.css';

const RegisterPage: React.FC = () => {
  const [status, setStatus] = useState({ loading: false, error: false });
  const { loggedIn } = useAuth();
  //state variables for login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  useEffect(() => {
    console.log('password1: ', password);
    if (status.error) {
      console.log('Error: Password must be at least 6 characters long');
    }
  }, [password, status]);
  const handleRegister = async (event) => {
    try {
      event.preventDefault();
      // const passwordValue = password;
      setStatus({ loading: true, error: false });

      // Validate password length
      if (password.length < 6) {
        setStatus({ loading: false, error: true });
        // console.log('Error: Password must be at least 6 characters long');
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
        firstName: firstName,
        lastName: lastName,
      });

      const publicUserRef = firestore
        .collection('publicUsers')
        .doc(credential.user.uid);
      await publicUserRef.set({
        email: credential.user.email,
        id: credential.user.uid,
        firstName: firstName,
        lastName: lastName,
      });
    } catch (error) {
      setStatus({ loading: false, error: true });
      console.log('error: ', error);
      return;
    }
    setStatus({ loading: false, error: false });
    console.log('handleRegister end');
  };
  if (loggedIn) {
    return <Redirect to='/my/home' />;
  }
  return (
    <IonPage>
      <IonContent className='ion-padding'>
        <img src={logo2} alt='logo2' />
        {/* Creating login form */}
        <IonList>
          <IonItem lines='none'>
            <IonText>
              <h2 className='custom-margin'>Register</h2>
            </IonText>
          </IonItem>
          <IonItem lines='none'>
            <IonText>
              <p>Please register to login</p>
            </IonText>
          </IonItem>
          <IonItem>
            <IonInput
              label='First Name'
              labelPlacement='stacked'
              type='text'
              value={firstName}
              onIonInput={(e) => setFirstName(e.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label='Last Name'
              labelPlacement='stacked'
              type='text'
              value={lastName}
              onIonInput={(e) => setLastName(e.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label='Email'
              labelPlacement='stacked'
              type='email'
              value={email}
              onIonInput={(e) => setEmail(e.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label='Password'
              labelPlacement='stacked'
              type='password'
              value={password}
              onIonInput={(e) => setPassword(e.detail.value)}
            />
          </IonItem>
        </IonList>
        {/* display error message if the user enters wrong credentials */}
        {status.error && <IonText color='danger'>Registration failed</IonText>}
        <form onSubmit={handleRegister}>
          <IonButton expand='block' type='submit'>
            Create an account
          </IonButton>
        </form>
        <IonButton expand='block' fill='clear' routerLink='/login'>
          Already have an account?{''}
          <strong>Log in</strong>
        </IonButton>
        <IonLoading isOpen={status.loading} />
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
