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
import BookDisplay from './BookDisplay';
import './Reviews.css';

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
        {/* <IonToolbar> */}
        <IonHeader className='header-padding-text'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingLeft: '15px',
            }}
          >
            <IonButton color='background' onClick={() => setShowModal(false)}>
              <span style={{ color: 'var(--ion-color-primary)' }}>Cancel</span>
            </IonButton>
            <IonButton
              color='background'
              strong={true}
              onClick={() => confirm()}
            >
              <span style={{ color: 'var(--ion-color-primary)' }}>Confirm</span>
            </IonButton>
          </div>
        </IonHeader>
        {/* </IonToolbar> */}
      </IonHeader>
      <h1 className='h1-padding-review'>Add Review</h1>
      <IonContent className='ion-padding'>
        <div className='rating-container-review'>
          {[1, 2, 3, 4, 5].map((starNumber) => (
            <IonIcon
              key={starNumber}
              icon={starNumber <= rating ? star : starOutline}
              onClick={() => handleRatingChange(starNumber)}
              className='rating-star-review'
            />
          ))}
        </div>

        <IonItem>
          <IonTextarea
            rows={8}
            label='Review'
            labelPlacement='stacked'
            debounce={1000}
            value={review}
            onIonInput={(event) => setReview(event.detail.value)}
          ></IonTextarea>
        </IonItem>
        <IonItem>
          <IonTextarea
            rows={8}
            label='Private Notes'
            labelPlacement='stacked'
            debounce={1000}
            value={notes}
            onIonInput={(event) => setNotes(event.detail.value)}
          ></IonTextarea>
        </IonItem>
        <BookDisplay book={book} />
      </IonContent>
    </IonModal>
  );
}

export default RatingsReviews;
