import React, { useEffect, useState } from 'react';
// import { db } from './firebaseConfig';
import BookDisplay from '../components/BookDisplay';
import firebase from 'firebase/app';
const currentUserId = firebase.auth().currentUser?.uid;
const db = firebase.firestore();
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
} from '@ionic/react';
import { fetchLoanDetails } from '../functions/UserHelper';

const LoanBorrowTracking: React.FC = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const currentUserId = await firebase.auth().currentUser?.uid;
      if (currentUserId) {
        const loanSnapshot = await db
          .collection('bookLoans')
          .where('userID', '==', currentUserId)
          .get();
        const books = [];
        for (const doc of loanSnapshot.docs) {
          const bookSnapshot = await db
            .collection('books')
            .doc(doc.data().bookID)
            .get();
          books.push(bookSnapshot.data());
        }
        setBooks(books);
      }
    };

    fetchBooks();
  }, []);

  return (
    <IonPage>
      <IonHeader className='header-padding-text'>
        {/* <IonToolbar> */}
        <IonButtons className='button-padding' slot='start'>
          <IonBackButton defaultHref='/my/home' />
        </IonButtons>
        {/* <IonTitle> Loan Tracking</IonTitle> */}
        {/* </IonToolbar> */}
      </IonHeader>
      <IonContent className='ion-padding'>
        <h1 className='h1-padding-left'>Loan Tracking</h1>
        {books.map((book, index) => (
          <BookDisplay key={index} book={book} />
        ))}
      </IonContent>
    </IonPage>
  );
};

export default LoanBorrowTracking;
