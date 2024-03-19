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
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);
  const db = firebase.firestore();
  const location = useLocation();
  const book = (location.state as { book: any })?.book;
  const year = book?.volumeInfo.publishedDate.split('-')[0];

  const handleWishlistClick = () => {
    setIsAddedToWishlist(!isAddedToWishlist);
    // Adding book to wishlist
    if (!isAddedToWishlist) {
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
      db.collection('wishlist')
        .where('bookId', '==', book.id)
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
    }
  };
  useEffect(() => {
    // Check if the book is already in the wishlist
    if (book) {
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
          <IonTitle>{book?.volumeInfo.title}</IonTitle>
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
          {book?.volumeInfo.imageLinks?.thumbnail ? (
            <img
              src={book.volumeInfo.imageLinks.thumbnail}
              className='full-thumbnail-recom'
            />
          ) : (
            <IonIcon icon={bookSharp} className='book-icon-recom' />
          )}
        </div>
        <div className='rating-container-recom'>
          {[1, 2, 3, 4, 5].map((starNumber) => {
            let icon;
            const averageRating = book?.volumeInfo.averageRating;
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
            {book?.volumeInfo.title}
          </IonText>
        </div>
        <div className='book-authors-recom'>
          <IonText className='book-authors-recom'>
            {book?.volumeInfo.authors.join(', ')}
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
              {book?.volumeInfo.pageCount}
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
            {book?.volumeInfo.description}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default RecommendationBookPage;
