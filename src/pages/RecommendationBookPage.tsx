import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  bookSharp,
  star,
  starHalf,
  starOutline,
  add,
  checkmark,
} from 'ionicons/icons';
import { useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import './RecommendationBookPage.css';
import 'firebase/firestore';

const RecommendationBookPage: React.FC = () => {
  const currentUser = firebase.auth().currentUser;
  const db = firebase.firestore();
  const location = useLocation();
  const locationState = location.state as {
    book: any;
    isFromWishlist: boolean;
  };
  const bookFromLocation = locationState?.book;
  const isFromWishlist = locationState?.isFromWishlist || false;
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(isFromWishlist);
  const [book, setBook] = useState(null);
  let year;
  if (book?.volumeInfo?.publishedDate) {
    year = book?.volumeInfo.publishedDate.split('-')[0];
  } else if (book?.publishedDate) {
    year = book?.publishedDate.split('-')[0];
  }
  console.log('bookReco:', book);

  const handleWishlistClick = () => {
    // if (!book || !book.volumeInfo) {
    //   console.error('Book or volumeInfo is not defined');
    //   return;
    // }
    setIsAddedToWishlist(!isAddedToWishlist);
    // Adding book to wishlist
    if (!isAddedToWishlist) {
      setIsAddedToWishlist(true);
      db.collection('wishlist')
        .add({
          userId: currentUser.uid,
          bookId: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          averageRating: book.volumeInfo.averageRating,
          publishedDate: book.volumeInfo.publishedDate,
          description: book.volumeInfo.description,
          pages: book.volumeInfo.pageCount,
          isbn:
            book.volumeInfo.industryIdentifiers &&
            book.volumeInfo.industryIdentifiers[1]
              ? book.volumeInfo.industryIdentifiers[1]
              : book.volumeInfo.industryIdentifiers[0],
        })
        .then((docRef) => {
          console.log('Document written with ID: ', docRef.id);
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
        });
    } else if (isAddedToWishlist) {
      // if (currentUser && currentUser.uid && book && book.id && book.bookId) {
      setIsAddedToWishlist(false);
      db.collection('wishlist')
        .where('bookId', '==', book.id || book.bookId)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // Delete the document
            doc.ref
              .delete()
              .then(() => {
                console.log('Document successfully deleted!');
                setIsAddedToWishlist(false);
              })
              .catch((error) => {
                console.error('Error removing document: ', error);
              });
          });
        })
        .catch((error) => {
          console.error('Error finding document: ', error);
        });
      // } else {
      //   console.error('currentUser.uid or book.id is undefined');
      // }
    }
  };
  useEffect(() => {
    const bookData = (location.state as { book: any; isFromWishlist: boolean })
      ?.book;
    setBook(bookData);
  }, [location]);
  useEffect(() => {
    // Check if the book is already in the wishlist
    if (currentUser && currentUser.uid && book && book.id) {
      db.collection('wishlist')
        .where('userId', '==', currentUser.uid)
        .where('bookId', '==', book.id)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            setIsAddedToWishlist(true);
          } else {
            setIsAddedToWishlist(false);
          }
        })
        .catch((error) => {
          console.error('Error finding document: ', error);
        });
    }
  }, [book]);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton />
          </IonButtons>
          <IonTitle>{book?.volumeInfo?.title || book?.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        {/* {isAddedToWishlist ? (
          <IonButton className='button-wishlist' onClick={handleWishlistClick}>
            <IonIcon icon={checkmark}></IonIcon>
            Wishlist
          </IonButton>
        ) : (
          <IonButton className='button-wishlist' onClick={handleWishlistClick}>
            <IonIcon icon={add}></IonIcon>
            Wishlist
          </IonButton>
        )} */}
        <div className='thumbnail-container-recom'>
          {book?.volumeInfo?.imageLinks?.thumbnail || book?.thumbnail ? (
            <img
              src={book?.volumeInfo?.imageLinks?.thumbnail || book?.thumbnail}
              className='full-thumbnail-recom'
            />
          ) : (
            <IonIcon icon={bookSharp} className='book-icon-recom' />
          )}
        </div>
        <div className='rating-container-recom'>
          {[1, 2, 3, 4, 5].map((starNumber) => {
            let icon;
            const averageRating =
              book?.volumeInfo?.averageRating || book?.averageRating;
            if (starNumber <= averageRating) {
              icon = star; // Full star
            } else if (starNumber <= averageRating + 0.5) {
              icon = starHalf; // Half star
            } else {
              icon = starOutline; // Empty star
            }
            return (
              <IonIcon
                key={starNumber}
                icon={icon}
                className='rating-star-recom'
              />
            );
          })}
        </div>
        <div className='book-title-recom'>
          <IonText className='book-title-recom'>
            {book?.volumeInfo?.title || book?.title}
          </IonText>
        </div>
        <div className='book-authors-recom'>
          <IonText className='book-authors-recom'>
            {book?.volumeInfo?.authors.join(', ') || book?.authors.join(', ')}
          </IonText>
        </div>
        <div className='book-details-container-recom'>
          <div className='book-details-recom'>
            <IonLabel className='book-details'>Published</IonLabel>
            <IonLabel className='book-publication-year-recom'>{year}</IonLabel>
          </div>
          <div className='book-details-recom'>
            <IonLabel className='book-details'>Pages</IonLabel>
            <IonLabel className='book-pages-recom'>
              {book?.volumeInfo?.pageCount || book?.pages}
            </IonLabel>
          </div>
        </div>
        {isAddedToWishlist ? (
          <IonButton className='button-wishlist' onClick={handleWishlistClick}>
            <IonIcon icon={checkmark}></IonIcon>
            Wishlist
          </IonButton>
        ) : (
          <IonButton className='button-wishlist' onClick={handleWishlistClick}>
            <IonIcon icon={add}></IonIcon>
            Wishlist
          </IonButton>
        )}
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Description</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.volumeInfo?.description || book?.description}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default RecommendationBookPage;
