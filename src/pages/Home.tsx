import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonText,
} from '@ionic/react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow>
          <IonLabel className='ion-padding'>Welcome to your library</IonLabel>
        </IonRow>
        <IonRow>
          <IonText className='ion-padding'>TODO</IonText>
        </IonRow>
        <IonRow>
          <IonCol size='6'>
            <IonCard>
              <IonCardHeader>
                <IonButton fill='clear' routerLink='/my/books/add'>
                  <IonCardTitle className='small-font'>Add Books</IonCardTitle>
                </IonButton>
              </IonCardHeader>
            </IonCard>
          </IonCol>
          <IonCol size='6'>
            <IonCard>
              <IonCardHeader>
                <IonButton fill='clear' routerLink='/my/bookTracking'>
                  <IonCardTitle className='small-font'>
                    Loan & <br /> Borrow Tracking
                  </IonCardTitle>
                </IonButton>
              </IonCardHeader>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonLabel className='ion-padding'>Recommendations</IonLabel>
        </IonRow>
        <IonRow>
          <IonText className='ion-padding'>TODO</IonText>
        </IonRow>
      </IonGrid>
    </IonPage>
  );
};

export default Home;
