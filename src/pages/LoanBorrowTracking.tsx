import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';

const LoanBorrowTracking: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton />
          </IonButtons>
          <IonTitle> Loan & Borrow Tracking</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        This is the loan and borrow tracking page
      </IonContent>
    </IonPage>
  );
};

export default LoanBorrowTracking;
