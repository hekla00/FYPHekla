import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { trash as trashIcon } from 'ionicons/icons';
import './Home.css';
import { useParams, useRouteMatch } from 'react-router';
// import { dummyBooks } from "../dummydata";
import { firestore } from '../firebase';
import { useEffect, useState } from 'react';
import { Book, toBook } from '../models';
import { useAuth } from '../authentication';
import { useHistory } from 'react-router';
import firebase from 'firebase/app';

interface RouteParams {
  id: string;
}

const BookPage: React.FC = () => {
  const { userID } = useAuth();
  const match = useRouteMatch<RouteParams>();
  const { id } = match.params;
  const [book, setBook] = useState<Book>();
  const history = useHistory();

  // useEffect(() => {
  //   const bookRef = firestore
  //     .collection('users')
  //     .doc(userID)
  //     .collection('books')
  //     .doc(id);
  //   bookRef.get().then((doc) =>
  //     // set the book state to the fetched book
  //     // toBook is a function that takes a doc and returns a book with its data
  //     setBook(toBook(doc))
  //   );
  // }, [userID, id]);
  useEffect(() => {
    // Get current user
    const currentUser = firebase.auth().currentUser;

    if (currentUser) {
      // Reference to the 'userBooks' collection
      const userBooksRef = firestore.collection('userBooks');

      // Query the 'userBooks' collection where 'userID' field matches the current user's ID and 'bookID' matches the given id
      return userBooksRef
        .where('userID', '==', currentUser.uid)
        .where('bookID', '==', id)
        .onSnapshot(({ docs }) => {
          // If the book exists in the user's books, get the corresponding book from the 'books' collection
          if (docs.length > 0) {
            firestore
              .collection('books')
              .doc(id)
              .get()
              .then((bookDoc) => {
                // Set the 'book' state to the fetched book
                setBook(toBook(bookDoc));
              });
          } else {
            console.log("The book does not exist in the user's books");
          }
        });
    } else {
      console.log('No user is signed in');
    }
  }, [id]);
  const handleDelete = async () => {
    const bookRef = firestore
      .collection('users')
      .doc(userID)
      .collection('books')
      .doc(id);
    await bookRef.delete();
    history.goBack();
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton />
          </IonButtons>
          <IonTitle>{book?.title}</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={handleDelete}>
              <IonIcon icon={trashIcon} slot='icon-only'></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>Author: {book?.author}</IonContent>
      {/* <IonContent className='ion-padding'>ID: {book?.id}</IonContent> */}
      {/* <IonContent className='ion-padding'>Title: {book?.title}</IonContent> */}
    </IonPage>
  );
};

export default BookPage;
