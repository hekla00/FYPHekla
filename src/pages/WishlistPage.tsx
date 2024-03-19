import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonCard,
  IonIcon,
  IonLabel,
  IonButtons,
  IonButton,
  IonBackButton,
} from '@ionic/react';
import { bookSharp, star, starHalf, starOutline } from 'ionicons/icons';
import './WishlistPage.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import {
  fetchThumbnailByISBN,
  fetchThumbnailByTitle,
} from '../functions/APIHelper';

const WishlistPage: React.FC = () => {
  const db = firebase.firestore();
  const [books, setBooks] = useState([]);
  const history = useHistory();

  const goBack = () => {
    history.push('/');
  };
  useEffect(() => {
    const fetchBooks = async () => {
      const currentUserId = firebase.auth().currentUser?.uid;
      if (currentUserId) {
        const unsubscribe = db
          .collection('wishlist')
          .where('userId', '==', currentUserId)
          .onSnapshot(async (snapshot) => {
            const booksWithThumbnails = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const book = doc.data();
                let thumbnail;
                try {
                  thumbnail = await fetchThumbnailByISBN(book?.isbn.identifier);
                } catch (isbnError) {
                  console.error(
                    'Failed to fetch thumbnail by ISBN:',
                    isbnError
                  );
                }

                if (!thumbnail) {
                  try {
                    thumbnail = await fetchThumbnailByTitle(book?.title);
                  } catch (titleError) {
                    console.error(
                      'Failed to fetch thumbnail by title:',
                      titleError
                    );
                  }
                }

                if (!thumbnail) {
                  console.error('Both fetch by ISBN and fetch by title failed');
                }
                return { ...book, thumbnail };
              })
            );

            setBooks(booksWithThumbnails);
            console.log('booksWithThumbnails:', booksWithThumbnails);
          });

        // Clean up the listener when the component is unmounted
        return () => unsubscribe();
      }
    };

    fetchBooks();
  }, []);
  const goToBookRecommendation = (book) => {
    console.log('book:', book);
    history.push(`/my/bookRecommendation/view/${book.bookId}`, {
      book,
      isFromWishlist: true,
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/my/home' />
          </IonButtons>
          <IonTitle>Wishlist</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {books.map((book) => (
            <IonCard
              className='book-card-wishlist'
              button
              key={book.bookId}
              onClick={() => goToBookRecommendation(book)}
            >
              {/* <div className='card-content-wishlist'> */}
              {/* <div className='thumbnail-wishlist'>
                  <div onClick={() => goToBookRecommendation(book)}>
                    {book.thumbnail ? (
                      <img src={book.thumbnail} />
                    ) : (
                      <IonIcon icon={bookSharp} />
                    )}
                  </div>
                </div>
                <div>
                  <IonCardContent className='card-content-wishlist'>
                    <div className='rating-container'>
                      {[1, 2, 3, 4, 5].map((starNumber) => {
                        let icon;
                        const averageRating = book?.averageRating;
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
                            className='rating-star'
                          />
                        );
                      })}
                    </div>
                  </IonCardContent>
                  <IonCardHeader>
                    <IonCardTitle className='card-title-wishlist'>
                      {book?.title}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>{book?.author}</IonCardContent>
                </div>
              </div> */}
              <IonLabel>
                <div className='flex-align-center'>
                  <div className='full-thumbnail-wishlist'>
                    <div onClick={() => goToBookRecommendation(book)}>
                      {book.thumbnail ? (
                        <img src={book.thumbnail} />
                      ) : (
                        <IonIcon icon={bookSharp} />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className='rating-container-wishlist'>
                      {[1, 2, 3, 4, 5].map((starNumber) => {
                        let icon;
                        const averageRating = book?.averageRating;
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
                            className='rating-star-wishlist'
                          />
                        );
                      })}
                    </div>
                    <h1>{book?.title}</h1>
                    <p>{book?.authors && book?.authors.join(', ')}</p>
                  </div>
                </div>
              </IonLabel>
            </IonCard>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default WishlistPage;
