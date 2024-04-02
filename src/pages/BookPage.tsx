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
  IonPopover,
  IonList,
  IonModal,
  IonToast,
} from '@ionic/react';
import {
  add,
  ellipsisHorizontalCircleOutline,
  starHalf,
  starOutline,
  pencil,
  bookSharp,
  trash as trashIcon,
  star,
  arrowBackCircle,
  checkmarkCircle,
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
import { handleDelete } from '../functions/BooksHelper';
import { useLocation } from 'react-router-dom';
import Loans from '../components/Loans';
import { fetchLoanDetails, returnBook } from '../functions/UserHelper';

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLoansModal, setShowLoansModal] = useState(false);
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const location = useLocation();
  const [userOwnsBook, setUserOwnsBook] = useState(false);
  const [loanDetails, setLoanDetails] = useState([]);
  // From groups page or book display
  const bookLocation = (location.state as { location?: string })?.location;
  const bookTags = (location.state as { tags?: string[] })?.tags;
  const thumbnail = (location.state as { thumbnail?: string })?.thumbnail;
  const bookFromLocation = (location.state as { book?: typeof book })?.book;
  const bookEdition = (location.state as { edition?: string })?.edition;
  // from book display
  const userSpecificData = (location.state as { userSpecificData?: any })
    ?.userSpecificData;
  console.log('bookpage user', userSpecificData);
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({
    open: false,
    event: undefined,
  });
  const [showToast, setShowToast] = useState(false);

  // Formatting date from firebase
  let year;
  let formattedDate;
  if (book?.releaseDate instanceof firebase.firestore.Timestamp) {
    const releaseDate = book.releaseDate.toDate();
    year = releaseDate.getFullYear();
    formattedDate = releaseDate.toLocaleDateString();
  } else if (bookFromLocation?.releaseDate) {
    let releaseDate;
    if (
      typeof bookFromLocation.releaseDate === 'string' ||
      typeof bookFromLocation.releaseDate === 'number'
    ) {
      releaseDate = new Date(bookFromLocation.releaseDate);
    } else if (
      bookFromLocation.releaseDate instanceof firebase.firestore.Timestamp
    ) {
      releaseDate = bookFromLocation.releaseDate.toDate();
    }
    if (releaseDate) {
      year = releaseDate.getFullYear();
      formattedDate = releaseDate.toLocaleDateString();
    }
  }

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
                setBook(toBook(bookDoc));
                setUserOwnsBook(true);
                fetchLoanDetails(id, currentUser.uid).then((details) => {
                  setLoanDetails(details);
                });
              });
          } else {
            console.log("The book does not exist in the user's books");
          }
        });
    } else {
      console.log('No user is signed in');
    }
  }, [id]);
  // console.log(userSpecificData?.location);

  const handleEdit = () => {
    history.push({
      pathname: `/my/edit/${book.id}`,
      state: { book: book },
    });
  };

  return (
    <IonPage>
      <IonHeader className='header-padding-text'>
        {/* <IonToolbar> */}
        {/* <IonButtons className='button-padding' slot='start'> */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            position: 'sticky',
            // backgroundColor: 'transparent',
            zIndex: 1,
            top: 0,
          }}
        >
          <IonBackButton />
          {userOwnsBook && (
            <IonIcon
              icon={ellipsisHorizontalCircleOutline}
              style={{
                cursor: 'pointer',
                fontSize: '30px',
                paddingRight: '10px',
              }}
              onClick={(e) =>
                setShowPopover({ open: true, event: e.nativeEvent })
              }
            />
          )}
          {/* <IonButton
              onClick={(e) =>
                setShowPopover({ open: true, event: e.nativeEvent })
              }
            >
              <IonIcon
                slot='icon-only'
                icon={ellipsisHorizontalCircleOutline}
              ></IonIcon>
            </IonButton> */}
        </div>
        {/* </IonButtons> */}
        <IonPopover
          isOpen={showPopover.open}
          event={showPopover.event}
          onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
        >
          <IonList>
            {/* <IonItem onClick={handleEdit}> */}
            {/* <IonItem>
              <IonIcon slot='end' icon={pencil}></IonIcon>
              <IonLabel>Edit Book</IonLabel>
            </IonItem> */}
            <IonItem onClick={() => setShowReviewModal(true)}>
              <IonIcon slot='end' icon={add}></IonIcon>
              <IonLabel>Edit Review</IonLabel>
            </IonItem>
            <IonItem onClick={() => setShowLoansModal(true)}>
              <IonIcon slot='end' icon={add}></IonIcon>
              <IonLabel>Add Loan</IonLabel>
            </IonItem>
            <IonItem onClick={() => handleDelete(book?.id, history)}>
              <IonIcon slot='end' icon={trashIcon}></IonIcon>
              <IonLabel>Delete Book</IonLabel>
            </IonItem>
          </IonList>
        </IonPopover>

        {/* <IonTitle>{book?.title || bookFromLocation?.title}</IonTitle> */}
        {/* </IonToolbar> */}
      </IonHeader>
      <IonContent className='ion-padding'>
        <div className='thumbnail-container-recom'>
          {thumbnail ? (
            <img src={thumbnail} className='full-thumbnail-recom' />
          ) : (
            <IonIcon icon={bookSharp} className='book-icon-recom' />
          )}
        </div>
        {rating ? (
          <div className='rating-container-recom'>
            {[1, 2, 3, 4, 5].map((starNumber) => {
              let icon;
              // const averageRating = rating;
              if (starNumber <= rating) {
                icon = star; // Full star
              } else if (starNumber <= rating + 0.5) {
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
        ) : null}
        <div className='book-title-recom'>
          <IonText className='book-title-recom'>
            {book?.title || bookFromLocation?.title}
          </IonText>
        </div>
        <div className='book-authors-recom'>
          <IonText className='book-authors-recom'>
            {book?.author || bookFromLocation?.author}
          </IonText>
        </div>
        <div className='book-details-container-recom'>
          <div className='book-details-recom'>
            <IonLabel className='book-details'>Published</IonLabel>
            <IonLabel className='book-publication-year-recom'>
              {year || formattedDate}
            </IonLabel>
          </div>
          <div className='book-details-recom'>
            <IonLabel className='book-details'>Pages</IonLabel>
            <IonLabel className='book-pages-recom'>
              {book?.pages || bookFromLocation?.pages}
            </IonLabel>
          </div>
        </div>
        {userOwnsBook && !rating && !review ? (
          <IonButton
            className='button-book'
            onClick={() => setShowReviewModal(true)}
          >
            Review Book
          </IonButton>
        ) : null}
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Description</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.description || bookFromLocation?.description}
          </IonCardContent>
        </IonCard>
        {review ? (
          <IonCard className='IonCard'>
            <IonCardHeader className='IonCardHeader'>Review</IonCardHeader>
            <IonCardContent className='IonCardContent'>{review}</IonCardContent>
          </IonCard>
        ) : null}
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Location</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {/* {book?.location || bookFromLocation?.location}
             */}
            {userSpecificData?.location ||
              bookLocation ||
              bookFromLocation?.location ||
              book?.location}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Tags</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {/* {book?.tags || bookFromLocation?.tags}
             */}
            {userSpecificData?.tags || bookTags}
          </IonCardContent>
        </IonCard>
        {userOwnsBook && notes ? (
          <IonCard className='IonCard'>
            <IonCardHeader className='IonCardHeader'>
              Private Notes
            </IonCardHeader>
            <IonCardContent className='IonCardContent'>{notes}</IonCardContent>
          </IonCard>
        ) : null}
        {userOwnsBook &&
          loanDetails.map((loan, index) => (
            <IonCard key={index} className='IonCard'>
              <IonCardHeader className='IonCardHeader'>Loans</IonCardHeader>
              <IonCardContent>
                <div className='loan-details'>
                  <span className='contact-name'>
                    {loan.contactName || 'Unknown'}
                  </span>
                  {loan.loaned ? (
                    <button
                      onClick={() =>
                        returnBook(book.id, currentUser.uid, () =>
                          setShowToast(true)
                        )
                      }
                    >
                      <IonIcon icon={arrowBackCircle} /> Loaned
                    </button>
                  ) : (
                    <p>
                      <IonIcon icon={checkmarkCircle} /> Returned
                    </p>
                  )}
                </div>
                {/* <br /> */}
                {loan.startDate?.toDate().toLocaleDateString()} -{' '}
                {loan.endDate?.toDate().toLocaleDateString()}
              </IonCardContent>
            </IonCard>
          ))}
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Purchase Date</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {/* {book?.purchaseDate || bookFromLocation?.purchaseDate}
             */}
            {userSpecificData?.purchaseDate?.toDate().toLocaleDateString()
              ? userSpecificData?.purchaseDate?.toDate().toLocaleDateString()
              : 'No purchase date available'}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Edition</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {/* {book?.edition || bookFromLocation?.edition} */}
            {userSpecificData?.edition || bookEdition}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>Genres</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.categories || bookFromLocation?.categories}
          </IonCardContent>
        </IonCard>
        <IonCard className='IonCard'>
          <IonCardHeader className='IonCardHeader'>ISBN</IonCardHeader>
          <IonCardContent className='IonCardContent'>
            {book?.isbn || bookFromLocation?.isbn}
          </IonCardContent>
        </IonCard>
        <IonModal
          isOpen={showReviewModal}
          onDidDismiss={() => setShowReviewModal(false)}
        >
          <RatingsReviews
            showModal={showReviewModal}
            setShowModal={setShowReviewModal}
            userID={currentUser?.uid}
            book={book}
          />
        </IonModal>
        <IonModal
          isOpen={showLoansModal}
          onDidDismiss={() => setShowLoansModal(false)}
        >
          <Loans
            showModal={showLoansModal}
            setShowModal={setShowLoansModal}
            book={book}
            userID={currentUser?.uid}
          />
        </IonModal>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message='Book returned successfully.'
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default BookPage;
