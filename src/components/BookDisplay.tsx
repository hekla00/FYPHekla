import React, { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {
  fetchThumbnailByISBN,
  fetchThumbnailByTitle,
} from '../functions/APIHelper';
import { bookSharp } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { fetchUserSpecificInfo } from '../functions/UserHelper';
import firebase from 'firebase/app';

const BookDisplay = ({ book }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [userID, setUserID] = useState(null);
  const bookID = book.id;
  const [userSpecificData, setUserSpecificData] = useState(null);

  //   console.log('Book isbn:', book.isbn.identifier);

  useEffect(() => {
    const fetchUserID = async () => {
      const userBooksRef = firebase.firestore().collection('userBooks');
      const snapshot = await userBooksRef.where('bookID', '==', bookID).get();

      if (!snapshot.empty) {
        // Assuming each bookID is unique across all documents
        setUserID(snapshot.docs[0].data().userID);
      } else {
        console.log('No such document!');
      }
    };

    fetchUserID();
  }, [bookID]);

  useEffect(() => {
    const userSpecificData = async () => {
      if (!bookID || !userID) return;
      const data = await fetchUserSpecificInfo(bookID, userID);
      console.log('User specific info:', data);
      setUserSpecificData(data);
    };

    userSpecificData();
  }, [bookID, userID]);

  useEffect(() => {
    const fetchThumbnail = async () => {
      // If book is not defined or book.isbn is not defined, don't fetch
      if (!book || !book.isbn) return;

      let thumbnail;
      try {
        thumbnail = await fetchThumbnailByISBN(book.isbn);
      } catch (isbnError) {
        console.error('Failed to fetch thumbnail by ISBN:', isbnError);
      }

      if (!thumbnail) {
        try {
          thumbnail = await fetchThumbnailByTitle(book.title);
        } catch (titleError) {
          console.error('Failed to fetch thumbnail by title:', titleError);
        }
      }

      if (!thumbnail) {
        console.error('Both fetch by ISBN and fetch by title failed');
      }

      setThumbnail(thumbnail);
    };

    fetchThumbnail();
  }, [book]);

  return (
    <IonCard
      onClick={() => {
        console.log('Clicked book ID:', book.id);
      }}
      className='book-card'
      button
      key={book.id}
      //   routerLink={`/my/books/view/${book.id}`}
    >
      <Link
        to={{
          pathname: `/my/books/view/${book.id}`,
          state: { thumbnail, book, userSpecificData },
        }}
        style={{ textDecoration: 'none' }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {thumbnail ? (
            <img className='full-thumbnail-bookdisplay' src={thumbnail} />
          ) : (
            <IonIcon
              slot='start'
              icon={bookSharp}
              className='book-icon-bookdisplay'
            />
          )}
          <div>
            <IonCardHeader>
              <IonCardTitle className='card-title'>{book?.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className='card-content'>
              {book?.author}
            </IonCardContent>
          </div>
        </div>
        <IonLabel></IonLabel>
      </Link>
    </IonCard>
  );
};

export default BookDisplay;
