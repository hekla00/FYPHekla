import {
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Library.css';
// import { dummyBooks } from "../dummydata";
import { firestore } from '../firebase';
import { useEffect, useState } from 'react';
import { Book, toBook } from '../models';
import { useAuth } from '../authentication';
import firebase from 'firebase/app';

const Library: React.FC = () => {
  const { userID } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Get current user
    const currentUser = firebase.auth().currentUser;

    if (currentUser) {
      // Reference to the 'userBooks' collection
      const userBooksRef = firestore.collection('userBooks');

      // Query the 'userBooks' collection where 'userID' field matches the current user's ID
      return userBooksRef
        .where('userID', '==', currentUser.uid)
        .onSnapshot(({ docs }) => {
          // For each document in the query result, get the corresponding book from the 'books' collection
          const bookPromises = docs.map((doc) =>
            firestore.collection('books').doc(doc.data().bookID).get()
          );
          Promise.all(bookPromises).then((bookDocs) => {
            // Set the 'books' state to the mapped data
            setBooks(bookDocs.map(toBook));
          });
        });
    } else {
      console.log('No user is signed in');
    }
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Library</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <IonList>
          {books.map((book) => (
            <IonItem
              button
              key={book.id}
              routerLink={`/my/books/view/${book.id}`}
            >
              {book?.title}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Library;
