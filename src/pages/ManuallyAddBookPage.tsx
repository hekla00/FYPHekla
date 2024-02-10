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
  IonTextarea,
  IonSelect,
} from '@ionic/react';
import React, { useState } from 'react';
import { firestore } from '../firebase';
import { useAuth } from '../authentication';
import { useHistory } from 'react-router';
import firebase from 'firebase/app';
const ManuallyAddBookPage: React.FC = () => {
  const { userID } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [data, setData] = useState(null);
  const [isbnData, setIsbnData] = useState('');
  const [openlibraryData, setOpenlibraryData] = useState(null);
  const history = useHistory();
  const [location, setLocation] = useState('');
  const [categories, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [languages, setLanguage] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [review, setReview] = useState('');
  const [pages, setPages] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [edition, setEdition] = useState('');
  const [notes, setNotes] = useState('');

  const currentUser = firebase.auth().currentUser;
  console.log('currentUser: ', currentUser);
  const handleAddBook2 = async () => {
    firebase.firestore().collection('books');
  };
  // const handleAddBook = async () => {
  //   const booksRef = firestore
  //     .collection('users')
  //     .doc(userID)
  //     .collection('books');
  //   const newBookRef = {
  //     title,
  //     author,
  //     location,
  //     categories,
  //     tags,
  //     languages,
  //     publisher,
  //     description,
  //     review,
  //     pages,
  //     releaseDate,
  //     purchaseDate,
  //     edition,
  //     notes,
  //   };
  //   const bookRef = await booksRef.add(newBookRef);
  //   console.log('bookRef: ', bookRef);
  //   history.goBack();
  // };
  const handleAddBook = async () => {
    const booksRef = firestore.collection('books');
    const newBookRef = {
      title,
      author,
      location,
      categories,
      tags,
      languages,
      publisher,
      description,
      review,
      pages,
      releaseDate,
      purchaseDate,
      edition,
      notes,
    };
    const bookRef = await booksRef.add(newBookRef);

    const newUserBooksRef = {
      userID,
      bookID: bookRef.id,
    };
    // write function that adds the books to the userBooks collection for the current user
    const userBooksRefa = firestore.collection('userBooks');
    const userBookRefb = await userBooksRefa.add(newUserBooksRef);
    // firebase.firestore().collection('userBooks').add(userBooksRef);

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
        <IonItem>
          <IonTextarea
            label='Description'
            labelPlacement='stacked'
            debounce={1000}
            value={description}
            onIonChange={(event) => setDescription(event.detail.value)}
          ></IonTextarea>
        </IonItem>
        <IonItem>
          <IonTextarea
            label='Review'
            labelPlacement='stacked'
            debounce={1000}
            value={review}
            onIonChange={(event) => setReview(event.detail.value)}
          ></IonTextarea>
        </IonItem>
        <IonItem>
          <IonInput
            label='Location'
            labelPlacement='stacked'
            debounce={1000}
            value={location}
            onIonChange={(event) => setLocation(event.detail.value)}
          ></IonInput>
        </IonItem>

        <IonItem>
          <IonInput
            label='Categories'
            labelPlacement='stacked'
            debounce={1000}
            value={categories}
            onIonChange={(event) => setCategory(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Tags'
            labelPlacement='stacked'
            debounce={1000}
            value={tags}
            onIonChange={(event) => setTags(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Languages'
            labelPlacement='stacked'
            debounce={1000}
            value={languages}
            onIonChange={(event) => setLanguage(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Publisher'
            labelPlacement='stacked'
            debounce={1000}
            value={publisher}
            onIonChange={(event) => setPublisher(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Pages'
            labelPlacement='stacked'
            debounce={1000}
            value={pages}
            onIonChange={(event) => setPages(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Release Date'
            labelPlacement='stacked'
            debounce={1000}
            value={releaseDate}
            onIonChange={(event) => setReleaseDate(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Purchase Date'
            labelPlacement='stacked'
            debounce={1000}
            value={purchaseDate}
            onIonChange={(event) => setPurchaseDate(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Edition'
            labelPlacement='stacked'
            debounce={1000}
            value={edition}
            onIonChange={(event) => setEdition(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonTextarea
            label='Notes'
            labelPlacement='stacked'
            debounce={1000}
            value={notes}
            onIonChange={(event) => setNotes(event.detail.value)}
          ></IonTextarea>
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
