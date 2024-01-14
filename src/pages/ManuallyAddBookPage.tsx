import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonLabel,
} from '@ionic/react';
import React, { useState } from 'react';
import { firestore } from '../firebase';
import { useAuth } from '../authentication';
import { useHistory } from 'react-router';

const ManuallyAddBookPage: React.FC = () => {
  const { userID } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [data, setData] = useState(null);
  const [isbnData, setIsbnData] = useState('');
  const [openlibraryData, setOpenlibraryData] = useState(null);
  const history = useHistory();

  const handleAddBook = async () => {
    const booksRef = firestore
      .collection('users')
      .doc(userID)
      .collection('books');
    const newBookRef = { title, author };
    const bookRef = await booksRef.add(newBookRef);
    console.log('bookRef: ', bookRef);
    history.goBack();
  };

  // create function that calls an Restful API that has a query parameter q and returns a JSON response
  const handleAuthorSearch = async (author) => {
    const response = await fetch(
      `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(
        author
      )}`
    );
    const data = await response.json();
    setData(data);
    console.log('data: ', data);
    console.log('author: ', author);
    // check if author is found in the data and assign the author to the author state
    if (data?.author) {
      setAuthor(data.author);
    }
  };

  //
  // const handleISBNSearch = async (isbn) => {
  //   console.log('isbn: ', isbn);

  //   const response = await fetch(
  //     `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}`,
  //     // `https://openlibrary.org/isbn/978-0590353427`,
  //     { mode: 'no-cors' }
  //   );
  //   const data = await response.json();
  //   setIsbnData(data);

  //   console.log('isbnData: ', isbnData);
  // };
  const handleISBNSearch = async () => {
    // console.log('isbn: ', isbn);
    console.log('isbnData: ', isbnData);
    if (isbnData) {
      // const url = `/isbn/${encodeURIComponent(isbnData)}`;
      const url = `https://cors-anywhere.herokuapp.com/https://openlibrary.org/isbn/${encodeURIComponent(
        isbnData
      )}`;
      console.log('url: ', url);
      const response = await fetch(url);
      const data = await response.json();
      setOpenlibraryData(data);
    }
    console.log('Open data: ', openlibraryData);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Add Book</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <IonItem>
          <IonInput
            label='ISBN'
            labelPlacement='stacked'
            value={isbnData}
            onIonChange={(event) => setIsbnData(event.detail.value)}
            onIonBlur={(event) => handleISBNSearch()}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Title'
            debounce={1000}
            labelPlacement='stacked'
            value={title}
            onIonChange={(event) => setTitle(event.detail.value)}
            onIonBlur={() => console.log('onIonBlur')}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Author'
            labelPlacement='stacked'
            debounce={1000}
            value={author}
            onIonChange={(event) => setAuthor(event.detail.value)}
            // onIonChange={(event) => handleAuthorSearch(event.detail.value)}
            onIonBlur={(event) => handleAuthorSearch(author)}
          />
        </IonItem>

        <IonList>
          {data?.docs?.map((author) => (
            <IonItem key={author.key}>
              <IonLabel>{author.name}</IonLabel>
            </IonItem>
          ))}
        </IonList>
        {/* <IonList>
          {isbnData?.docs?.map((isbn) => (
            <IonItem key={isbn.isbn_13}>
              <IonLabel>{isbn.isbn_13}</IonLabel>
            </IonItem>
          ))}
        </IonList> */}
        <IonButton expand='block' onClick={handleAddBook}>
          Add Book
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ManuallyAddBookPage;
