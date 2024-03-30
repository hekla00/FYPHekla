import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
} from '@ionic/react';
import React from 'react';
import { auth } from '../firebase';
import {
  person as personIcon,
  notifications as notificationsIcon,
  lockClosed as lockClosedIcon,
  help as helpIcon,
  informationCircle as informationCircleIcon,
} from 'ionicons/icons';

const SettingsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className='header-padding-text'>
        {/* <IonToolbar> */}

        {/* </IonToolbar> */}
      </IonHeader>
      <IonContent className='ion-padding'>
        <h1 className='h1-padding-left'>Settings</h1>
        <IonList>
          <IonItem href='/my/account'>
            <IonIcon icon={personIcon} slot='start' />
            <IonLabel>Account</IonLabel>
          </IonItem>
          {/* <IonItem>
            <IonIcon icon={notificationsIcon} slot='start' />
            <IonLabel>Notifications</IonLabel>
          </IonItem> */}
          <IonItem href='/my/privacy'>
            <IonIcon icon={lockClosedIcon} slot='start' />
            <IonLabel>Privacy & Security</IonLabel>
          </IonItem>
          <IonItem href='/my/support'>
            <IonIcon icon={helpIcon} slot='start' />
            <IonLabel>Help & Support</IonLabel>
          </IonItem>
          <IonItem href='/my/about'>
            <IonIcon icon={informationCircleIcon} slot='start' />
            <IonLabel>About</IonLabel>
          </IonItem>
        </IonList>
        <IonButton
          color={'primary'}
          expand='block'
          onClick={() => auth.signOut()}
        >
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
