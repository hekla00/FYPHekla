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

const SupportPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className='header-padding-text'>
        {/* <IonToolbar> */}
        {/* <IonTitle>Help & Support</IonTitle> */}
        <IonButtons className='button-padding' slot='start'>
          <IonBackButton defaultHref='/my/settings' />
        </IonButtons>
        {/* </IonToolbar> */}
      </IonHeader>
      <div style={{ height: '20px' }}></div>
      <IonContent>
        <h1 className='h1-padding-left'>Help & Support</h1>
        <IonCard>
          <IonCardHeader>
            <IonTitle>FAQs</IonTitle>
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
            <IonTitle>Contact Us</IonTitle>
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

export default SupportPage;
