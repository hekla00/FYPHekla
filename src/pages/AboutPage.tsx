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

const AboutPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About Us</IonTitle>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/my/settings' />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonTitle>Our Story</IonTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Our story goes here.</p>
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
            <IonTitle>Our Mission</IonTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Our mission goes here.</p>
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

export default AboutPage;
