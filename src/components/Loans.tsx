import React, { useState, useEffect } from 'react';
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  IonItem,
  IonInput,
  IonLabel,
  IonDatetime,
  IonDatetimeButton,
  IonToast,
} from '@ionic/react';
import firebase from 'firebase/app';
import BookDisplay from './BookDisplay';

function Loans({ showModal, setShowModal, book, userID }) {
  const [contactName, setContactName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const db = firebase.firestore();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<
    string | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>(
    undefined
  );
  const [showErrorToast, setShowErrorToast] = useState(false);
  const startDateTimestamp = selectedStartDate
    ? firebase.firestore.Timestamp.fromDate(new Date(selectedStartDate))
    : null;
  const endDateTimestamp = selectedEndDate
    ? firebase.firestore.Timestamp.fromDate(new Date(selectedEndDate))
    : null;

  const confirm = async () => {
    const bookID = book.id;
    await db.collection('bookLoans').add({
      bookID,
      userID,
      contactName,
      startDate: startDateTimestamp,
      endDate: endDateTimestamp,
    });

    setShowModal(false);
  };
  const handleStartDateChange = (e: CustomEvent) => {
    setSelectedStartDate(e.detail.value);
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (e: CustomEvent) => {
    if (
      selectedStartDate &&
      new Date(e.detail.value) < new Date(selectedStartDate)
    ) {
      setShowErrorToast(true);
    } else {
      setSelectedEndDate(e.detail.value);
    }
    setShowEndDatePicker(false);
  };

  return (
    <IonModal isOpen={showModal} onWillDismiss={() => setShowModal(false)}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Add Loan</IonTitle>
          <IonButtons slot='end'>
            <IonButton strong={true} onClick={() => confirm()}>
              Confirm
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className='ion-padding'>
        <IonItem>
          <IonLabel position='stacked'>Contact Name</IonLabel>
          <IonInput
            type='text'
            value={contactName}
            onIonChange={(e) => setContactName(e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position='stacked'>Start Date</IonLabel>
          <IonButton onClick={() => setShowStartDatePicker(true)}>
            {selectedStartDate
              ? new Date(selectedStartDate).toLocaleDateString()
              : 'Select Start Date'}
          </IonButton>
        </IonItem>
        <IonModal
          isOpen={showStartDatePicker}
          onDidDismiss={() => setShowStartDatePicker(false)}
        >
          <IonDatetime
            value={selectedStartDate}
            onIonChange={handleStartDateChange}
          />
        </IonModal>

        <IonItem>
          <IonLabel position='stacked'>End Date</IonLabel>
          <IonButton onClick={() => setShowEndDatePicker(true)}>
            {selectedEndDate
              ? new Date(selectedEndDate).toLocaleDateString()
              : 'Select End Date'}
          </IonButton>
        </IonItem>
        <IonModal
          isOpen={showEndDatePicker}
          onDidDismiss={() => setShowEndDatePicker(false)}
        >
          <IonDatetime
            value={selectedEndDate}
            onIonChange={handleEndDateChange}
          />
        </IonModal>
        <IonLabel className='ion-padding'>Book</IonLabel>
        <BookDisplay book={book} />
        <IonToast
          isOpen={showErrorToast}
          onDidDismiss={() => setShowErrorToast(false)}
          message='End date cannot be before start date.'
          duration={2000}
        />
      </IonContent>
    </IonModal>
  );
}

export default Loans;
