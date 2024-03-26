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
  IonIcon,
  IonBadge,
  IonSpinner,
  IonListHeader,
} from '@ionic/react';
import './Home.css';
import { book, people, list, calendarClearSharp } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import {
  fetchNumBooks,
  fetchNumGroups,
  fetchNumBooksInWishlist,
  fetchNumLoans,
} from '../functions/UserHelper';
import { fetchBooks } from '../functions/RecommendationsHelper';
import { bookSharp } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const [numBooks, setNumBooks] = useState(0);
  const [numGroups, setNumGroups] = useState(0);
  const [numBorrowed, setNumBorrowed] = useState(0);
  const [numBooksInWishlist, setNumBooksInWishlist] = useState(0);
  const [numLoaned, setNumLoaned] = useState(0);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

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
    fetchNumBooksInWishlist(setNumBooksInWishlist);
    fetchNumLoans(setNumLoaned);
    getBooks();
  }, []);

  const goToBookRecommendation = (book) => {
    history.push(`/my/bookRecommendation/view/${book.id}`, { book });
  };

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
                      Library
                    </IonCardTitle>
                  </div>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='6'>
              <IonCard href='/my/groups'>
                <IonCardHeader className='card-header-home'>
                  <div className='card-top-home'>
                    <IonIcon icon={people} />
                    <div className='card-badge-home'>
                      <IonBadge>{numGroups}</IonBadge>
                    </div>
                  </div>
                  <div className='card-content-home'>
                    <IonCardTitle className='small-font-home'>
                      Groups
                    </IonCardTitle>
                  </div>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='6'>
              <IonCard href='/my/wishlist'>
                <IonCardHeader className='card-header-home'>
                  <div className='card-top-home'>
                    <IonIcon icon={list} />
                    <div className='card-badge-home'>
                      <IonBadge>{numBooksInWishlist}</IonBadge>
                    </div>
                  </div>
                  <div className='card-content-home'>
                    <IonCardTitle className='small-font-home'>
                      Wishlist
                    </IonCardTitle>
                  </div>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            <IonCol size='6'>
              <IonCard href='/my/bookTracking'>
                <IonCardHeader className='card-header-home'>
                  <div className='card-top-home'>
                    <IonIcon icon={calendarClearSharp} />
                    <div className='card-badge-home'>
                      <IonBadge>{numLoaned > 0 ? numLoaned : 0}</IonBadge>
                    </div>
                  </div>
                  <div className='card-content-home'>
                    <IonCardTitle className='small-font-home'>
                      Loan Tracking
                    </IonCardTitle>
                  </div>
                </IonCardHeader>
              </IonCard>
            </IonCol>
          </IonRow>
          <IonCol>
            <IonListHeader>
              <IonLabel className='header-label-home'>Recommendations</IonLabel>
            </IonListHeader>
            <div className='thumbnail-container'>
              {isLoading ? (
                <IonSpinner />
              ) : (
                books.map((book, index) => (
                  <div key={index} className='thumbnail-home'>
                    <div onClick={() => goToBookRecommendation(book)}>
                      {book.volumeInfo.imageLinks?.thumbnail ? (
                        <img src={book.volumeInfo.imageLinks.thumbnail} />
                      ) : (
                        <IonIcon icon={bookSharp} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </IonCol>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
