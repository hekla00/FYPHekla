import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonFabList,
  IonModal,
} from '@ionic/react';
import {
  add,
  chevronUpCircle,
  pencil,
  trash as trashIcon,
} from 'ionicons/icons';
import './Home.css';
import { useParams, useRouteMatch } from 'react-router';
// import { dummyBooks } from "../dummydata";
import { firestore } from '../firebase';
import { useEffect, useState } from 'react';
import { Book, toBook } from '../models';
import { useAuth } from '../authentication';
import { useHistory } from 'react-router';
import firebase from 'firebase/app';
import './BookPage.css';
import RatingsReviews from '../components/RatingsReviews';
import { fetchReview, fetchNotes } from '../functions/RatingsReviewHelper';
interface RouteParams {
  id: string;
}

const BookPage: React.FC = () => {
  const { userID } = useAuth();
  const match = useRouteMatch<RouteParams>();
  const { id } = match.params;
  const [book, setBook] = useState<Book>();
  const history = useHistory();
  const currentUser = firebase.auth().currentUser;
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);

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
    fetchReview(currentUser?.uid, id, setRating, setReview);
    fetchNotes(currentUser?.uid, id, setNotes);
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
    const userBooksRef = firestore.collection('userBooks').doc(id);
    bookRef.delete().then(() => {
      console.log('Book successfully deleted from books collection');
    });
    userBooksRef.delete().then(() => {
      console.log('Book successfully deleted from userBooks collection');
    });
    await bookRef.delete();
    await userBooksRef.delete();
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
      <IonContent className='ion-padding'>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Title</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.title}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Pages</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.pages}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Author</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.author}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Rating</IonCardHeader>
          <IonCardContent className='IonCardContent'>{rating}</IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Review</IonCardHeader>
          <IonCardContent className='IonCardContent'>{review}</IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Description</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.description}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Location</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.location}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Edition</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.edition}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Categories</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.categories}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Tags</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.tags}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>ISBN</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.isbn}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Notes</IonCardHeader>
          <IonCardContent className='IonCardContent'>{notes}</IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Release Date</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.releaseDate}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Purchase Date</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.purchaseDate}
          </IonCardContent>
        </IonCard>
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton>
            <IonIcon icon={chevronUpCircle}></IonIcon>
          </IonFabButton>
          <IonFabList side='top'>
            {/* <IonFabButton>
                <IonIcon icon={settings}></IonIcon>
              </IonFabButton> */}
            <IonFabButton onClick={() => setShowModal(true)}>
              <IonIcon icon={add}></IonIcon>
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={pencil}></IonIcon>
            </IonFabButton>
          </IonFabList>
        </IonFab>
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <RatingsReviews
            showModal={showModal}
            setShowModal={setShowModal}
            userID={currentUser?.uid}
            book={book}
          />
          {/* <p>Hello, world!</p> */}
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default BookPage;
