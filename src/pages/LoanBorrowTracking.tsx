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
import {
  fetchLoanDetails,
  fetchAllUserBooks,
  fetchUserSpecificInfo,
  fetchAllUserBooksLoans,
} from '../functions/UserHelper';

const LoanBorrowTracking: React.FC = () => {
  const [books, setBooks] = useState([]);
  const currentUserId = firebase.auth().currentUser?.uid;
  const [isLoading, setIsLoading] = useState(false);
  const [allBooks, setAllBooks] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  useEffect(() => {
    fetchAllUserBooksLoans(setIsLoading, setAllBooks);
  }, []);
  useEffect(() => {
    if (!isLoading && allBooks.length > 0) {
      const fetchLoans = async () => {
        const loansPromises = allBooks.map((book) =>
          fetchLoanDetails(book.id, firebase.auth().currentUser?.uid)
        );
        const loans = await Promise.all(loansPromises);
        setLoanDetails(loans);
      };

      fetchLoans();
    }
  }, [isLoading, allBooks]);
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
        {allBooks.map((book, index) => (
          <BookDisplay key={index} book={book} />
        ))}
      </IonContent>
    </IonPage>
  );
};

export default LoanBorrowTracking;
