import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonText,
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLoading,
} from '@ionic/react';
import './Home.css';
import { book, people, arrowRedo, arrowUndo } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { fetchNumBooks, fetchNumGroups } from '../functions/UserHelper';
import { fetchBooks } from '../functions/RecommendationsHelper';
import { bookSharp, star, starOutline, starHalf } from 'ionicons/icons';

const Home: React.FC = () => {
  const [numBooks, setNumBooks] = useState(0);
  const [numGroups, setNumGroups] = useState(0);
  const [numBorrowed, setNumBorrowed] = useState(0);
  const [numLoaned, setNumLoaned] = useState(0);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getBooks = async () => {
    setIsLoading(true);
    const allBooks = await fetchBooks();

    // Randomly select 5 books
    const selectedBooks = allBooks.sort(() => 0.5 - Math.random()).slice(0, 5);

    setBooks(selectedBooks);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNumBooks(setNumBooks);
    fetchNumGroups(setNumGroups);
    getBooks();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size='6'>
              <IonCard href='/my/library'>
                <IonCardHeader className='card-header-home'>
                  <div className='card-top-home'>
                    <IonIcon icon={book} />
                    <div className='card-badge-home'>
                      <IonBadge>{numBooks}</IonBadge>
                    </div>
                  </div>
                  <div className='card-content-home'>
                    <IonCardTitle className='small-font-home'>
                      Books
                    </IonCardTitle>
                  </div>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='6'>
              <IonCard href='/my/groups'>
                <IonCardHeader className='card-header'>
                  <IonIcon icon={people} />
                  <div className='title-container-home'>
                    <IonCardTitle className='small-font-home'>
                      Groups
                    </IonCardTitle>
                  </div>
                  <IonBadge>{numGroups}</IonBadge>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='6'>
              <IonCard href='/my/bookTracking'>
                <IonCardHeader className='card-header-home'>
                  <div className='card-top-home'>
                    <IonIcon icon={arrowRedo} />
                    <div className='card-badge-home'>
                      <IonBadge>{numBorrowed > 0 ? numBorrowed : 0}</IonBadge>
                    </div>
                  </div>
                  <div className='card-content-home'>
                    <IonCardTitle className='small-font-home'>
                      Borrowed Books
                    </IonCardTitle>
                  </div>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='6'>
              <IonCard href='/my/bookTracking'>
                <IonCardHeader className='card-header'>
                  <IonBadge>{numLoaned > 0 ? numLoaned : 0}</IonBadge>
                  <div className='title-container-home'>
                    <IonCardTitle className='small-font-home'>
                      Loaned Books
                    </IonCardTitle>
                  </div>
                  <IonIcon icon={arrowUndo} />
                </IonCardHeader>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonText className='ion-padding'>Recommendations</IonText>
          <IonLoading isOpen={isLoading} message={'Loading...'} />
          <IonList>
            {books.map((book, index) => (
              <IonItem key={index}>
                <IonLabel>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img
                        className='full-thumbnail'
                        src={book.volumeInfo.imageLinks.thumbnail}
                        alt='Book thumbnail'
                        style={{ marginRight: '10px' }}
                      />
                    ) : (
                      <IonIcon
                        slot='start'
                        icon={bookSharp}
                        className='book-icon'
                        style={{ marginRight: '10px' }}
                      />
                    )}
                    <div className='book-details-home'>
                      <div>
                        {[1, 2, 3, 4, 5].map((starNumber) => {
                          const rating =
                            Math.round(book.volumeInfo.averageRating * 2) / 2;
                          let icon;
                          if (starNumber <= rating) {
                            icon = star;
                          } else if (starNumber - 0.5 === rating) {
                            icon = starHalf;
                          } else {
                            icon = starOutline;
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
                      <h1>{book.volumeInfo.title}</h1>
                      <p>
                        {book.volumeInfo.authors &&
                          book.volumeInfo.authors.join(', ')}
                      </p>
                    </div>
                  </div>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
