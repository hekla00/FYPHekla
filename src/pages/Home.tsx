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
  IonSpinner,
  IonListHeader,
  IonRouterLink,
  IonButton,
  IonButtons,
} from '@ionic/react';
import './Home.css';
import { book, people, arrowRedo, arrowUndo } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { fetchNumBooks, fetchNumGroups } from '../functions/UserHelper';
import { fetchBooks } from '../functions/RecommendationsHelper';
import { bookSharp } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const [numBooks, setNumBooks] = useState(0);
  const [numGroups, setNumGroups] = useState(0);
  const [numBorrowed, setNumBorrowed] = useState(0);
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

          <IonCol>
            <IonListHeader>
              <IonLabel className='header-label'>Recommendations</IonLabel>
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
