import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Redirect } from 'react-router';
import { useAuth } from '../authentication';
import { auth } from '../firebase';
import { useState } from 'react';
import logo from '../../images/logo.png';
import logoNewColor from '../../images/logo-color.png';
import './Login.css';

const LoginPage: React.FC = () => {
  const { loggedIn } = useAuth();
  //state variables for login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: false });

  const handleLogin = async (event) => {
    try {
      event.preventDefault();
      setStatus({ loading: true, error: false });
      const credential = await auth.signInWithEmailAndPassword(email, password);
      console.log('credential: ', credential);
      // setStatus({ loading: false, error: true });
      // this is done to let the app know that the user is logged in
      // onLogin();
    } catch (error) {
      // if the user enters wrong credentials, the error is set to true
      setStatus({ loading: false, error: true });
      console.log('error: ', error);
    }
    // console.log("email: ", email);
    // console.log("password: ", password);
  };
  if (loggedIn) {
    return <Redirect to='/my/home' />;
  }
  return (
    <IonPage>
      <IonContent className='ion-padding'>
        <img src={logoNewColor} alt='logo' />
        {/* Creating login form */}
        <IonList>
          <IonItem lines='none'>
            <IonText>
              <h2 className='custom-margin'>Welcome Back</h2>
            </IonText>
          </IonItem>
          <IonItem lines='none'>
            <IonText>
              <p>Log in to continue</p>
            </IonText>
          </IonItem>
          <IonItem>
            <IonInput
              label='Email'
              color={'primary'}
              labelPlacement='stacked'
              type='email'
              value={email}
              onIonInput={(e) => setEmail(e.detail.value)}
            />
          </IonItem>
          <IonItem className='custom-padding'>
            <IonInput
              label='Password'
              color={'primary'}
              labelPlacement='stacked'
              type='password'
              value={password}
              onIonInput={(e) => setPassword(e.detail.value)}
            />
          </IonItem>
        </IonList>
        {/* display error message if the user enters wrong credentials */}
        {status.error && (
          <IonText color='danger'>Invalid email or password</IonText>
        )}
        <form onSubmit={handleLogin}>
          <IonButton
            className='ion-padding'
            expand='block'
            // onClick={handleLogin}
            type='submit'
          >
            Log in
          </IonButton>
        </form>
        {/* If the user does not have an account they are redirected to the register page */}
        <IonButton expand='block' fill='clear' routerLink='/register'>
          Don't have an account?{''}
          <strong style={{ paddingLeft: '5px' }}>Register</strong>
        </IonButton>
        <IonLoading isOpen={status.loading} />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
