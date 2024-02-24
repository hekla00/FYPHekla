import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <IonList>
          <IonItem>
            <IonIcon icon={personIcon} slot='start' />
            <IonLabel>Account</IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={notificationsIcon} slot='start' />
            <IonLabel>Notifications</IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={lockClosedIcon} slot='start' />
            <IonLabel>Privacy & Security</IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={helpIcon} slot='start' />
            <IonLabel>Help & Support</IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={informationCircleIcon} slot='start' />
            <IonLabel>About</IonLabel>
          </IonItem>
        </IonList>
        <IonButton
          color={'medium'}
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
