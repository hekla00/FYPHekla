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
  IonPopover,
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
  const [showStartDatePopover, setShowStartDatePopover] = useState({
    isOpen: false,
    event: undefined,
  });
  const [showEndDatePopover, setShowEndDatePopover] = useState({
    isOpen: false,
    event: undefined,
  });
  const [selectedStartDate, setSelectedStartDate] = useState<
    string | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>(
    undefined
  );
  const [showErrorToast, setShowErrorToast] = useState(false);

  const confirm = async () => {
    const bookID = book.id;
    const startDateTimestamp = selectedStartDate
      ? firebase.firestore.Timestamp.fromDate(new Date(selectedStartDate))
      : null;
    const endDateTimestamp = selectedEndDate
      ? firebase.firestore.Timestamp.fromDate(new Date(selectedEndDate))
      : null;
    await db.collection('bookLoans').add({
      bookID,
      userID,
      contactName,
      startDate: startDateTimestamp,
      endDate: endDateTimestamp,
      loaned: true,
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
      <IonHeader className='header-padding-text'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: '20px',
          }}
        >
          <IonButton color='background' onClick={() => setShowModal(false)}>
            <span style={{ color: 'var(--ion-color-primary)' }}>Cancel</span>
          </IonButton>
          <IonButton color='background' strong={true} onClick={() => confirm()}>
            <span style={{ color: 'var(--ion-color-primary)' }}>Confirm</span>
          </IonButton>
        </div>
      </IonHeader>

      <IonContent className='ion-padding'>
        <h1 className='h1-padding-left'>Add Loan</h1>
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
          <IonButton
            onClick={(e) =>
              setShowStartDatePopover({ isOpen: true, event: e.nativeEvent })
            }
          >
            {selectedStartDate
              ? new Date(selectedStartDate).toLocaleDateString()
              : 'Select Start Date'}
          </IonButton>
          <IonPopover
            isOpen={showStartDatePopover.isOpen}
            event={showStartDatePopover.event}
            onDidDismiss={() =>
              setShowStartDatePopover({ isOpen: false, event: undefined })
            }
          >
            <IonDatetime
              value={selectedStartDate}
              onIonChange={handleStartDateChange}
            />
          </IonPopover>
        </IonItem>

        <IonItem>
          <IonLabel position='stacked'>End Date</IonLabel>
          <IonButton
            onClick={(e) =>
              setShowEndDatePopover({ isOpen: true, event: e.nativeEvent })
            }
          >
            {selectedEndDate
              ? new Date(selectedEndDate).toLocaleDateString()
              : 'Select End Date'}
          </IonButton>
          <IonPopover
            isOpen={showEndDatePopover.isOpen}
            event={showEndDatePopover.event}
            onDidDismiss={() =>
              setShowEndDatePopover({ isOpen: false, event: undefined })
            }
          >
            <IonDatetime
              value={selectedEndDate}
              onIonChange={handleEndDateChange}
            />
          </IonPopover>
        </IonItem>
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
