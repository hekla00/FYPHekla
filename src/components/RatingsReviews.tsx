import React, { useState, useRef, useEffect } from 'react';
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
  IonIcon,
  IonTextarea,
  IonLabel,
} from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';
import { OverlayEventDetail } from '@ionic/core/components';
import firebase from 'firebase/app';
import {
  updateReview,
  updateNotes,
  fetchReview,
  fetchNotes,
} from '../functions/RatingsReviewHelper';

function RatingsReviews({ showModal, setShowModal, book, userID }) {
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const db = firebase.firestore();
  const [message, setMessage] = useState(
    'This modal example uses triggers to automatically open a modal when the button is clicked.'
  );

  console.log('book:', book);
  const confirm = async () => {
    const bookID = book.id;
    updateReview(rating, review, userID, bookID);
    updateNotes(notes, userID, bookID);

    // console.log('Review:', review);
    // Close the modal
    // modal.current?.dismiss();
    setShowModal(false);
  };

  useEffect(() => {
    fetchReview(userID, book.id, setRating, setReview);
    fetchNotes(userID, book.id, setNotes);
  }, [userID, book.id]);

  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === 'confirm') {
      setMessage(`Hello, ${ev.detail.data}!`);
    }
  }
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  return (
    <IonModal isOpen={showModal} onWillDismiss={() => setShowModal(false)}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Add a Review</IonTitle>
          <IonButtons slot='end'>
            <IonButton strong={true} onClick={() => confirm()}>
              Confirm
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <div className='rating-container'>
          {[1, 2, 3, 4, 5].map((starNumber) => (
            <IonIcon
              key={starNumber}
              icon={starNumber <= rating ? star : starOutline}
              onClick={() => handleRatingChange(starNumber)}
              className='rating-star'
            />
          ))}
        </div>
        <IonItem>
          <IonInput
            type='text'
            placeholder='Title'
            labelPlacement='stacked'
            label='Title'
            value={book?.title}
            readonly
          ></IonInput>
        </IonItem>

        <IonItem>
          <IonTextarea
            rows={6}
            label='Review'
            labelPlacement='stacked'
            debounce={1000}
            value={review}
            onIonInput={(event) => setReview(event.detail.value)}
          ></IonTextarea>
        </IonItem>
        <IonItem>
          <IonTextarea
            rows={6}
            label='Private Notes'
            labelPlacement='stacked'
            debounce={1000}
            value={notes}
            onIonInput={(event) => setNotes(event.detail.value)}
          ></IonTextarea>
        </IonItem>
      </IonContent>
    </IonModal>
  );
}

export default RatingsReviews;
