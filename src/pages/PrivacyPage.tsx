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
  IonCardContent,
} from '@ionic/react';

const PrivacyPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Privacy & Security</IonTitle>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/my/settings' />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonTitle>Privacy Policy</IonTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              diam tellus, vehicula ac auctor nec, consequat vel ex. Cras ornare
              ornare elit ac tincidunt. Vivamus tincidunt nisl quis ante
              condimentum commodo. Pellentesque cursus mi tellus. Praesent
              gravida, lacus convallis mattis commodo, mauris risus tristique
              mauris, eu rutrum orci lacus et ante. Nulla ultrices pharetra
              feugiat. Vestibulum gravida ornare facilisis.
            </p>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonTitle>Security Policy</IonTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              diam tellus, vehicula ac auctor nec, consequat vel ex. Cras ornare
              ornare elit ac tincidunt. Vivamus tincidunt nisl quis ante
              condimentum commodo. Pellentesque cursus mi tellus. Praesent
              gravida, lacus convallis mattis commodo, mauris risus tristique
              mauris, eu rutrum orci lacus et ante. Nulla ultrices pharetra
              feugiat. Vestibulum gravida ornare facilisis.
            </p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default PrivacyPage;
