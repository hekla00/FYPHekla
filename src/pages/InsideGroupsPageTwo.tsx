import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/app';
import { useLocation, useHistory } from 'react-router-dom';
import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonList,
  IonItem,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonListHeader,
  IonAvatar,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonRouterLink,
} from '@ionic/react';
import {
  chevronUpCircle,
  personAdd,
  star,
  starOutline,
  book,
} from 'ionicons/icons';
import LeaveGroup from '../components/LeaveGroup';
import { fetchBookBasedOnBookID } from '../functions/BooksHelper';
import { fetchGroup, fetchMembersData } from '../functions/GroupsHelper';
import 'firebase/performance';
import './Groups.css';
import {
  fetchThumbnailByISBN,
  fetchThumbnailByTitle,
} from '../functions/APIHelper';

const InsideGroupsPageTwo: React.FC = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation<{ group: any }>();
  const groupData = location.state?.group;
  const history = useHistory();
  const [membersData, setMembersData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const perf = firebase.performance();
  const db = firebase.firestore();
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    fetchGroup(groupId, setGroup, setLoading);
  }, [groupId]);

  useEffect(() => {
    const getUsersBooks = async (memberId) => {
      const userBooks = await db
        .collection('userBooks')
        .where('userID', '==', memberId)
        .limit(3)
        .get();
      return userBooks;
    };
    const fetchReviewsForGroupMembers = async () => {
      const trace = perf.trace('fetchGroup');
      trace.start();

      const reviewsDataPromises = membersData.map(async (member) => {
        const userBooksSnapshot = await getUsersBooks(member.id);
        const userID = member.id;

        const userSnapshot = await db
          .collection('publicUsers')
          .doc(userID)
          .get();
        const userData = userSnapshot.data();

        const reviewIDs = userBooksSnapshot.docs.map(
          (doc) => doc.data().bookID
        );
        const reviewsSnapshot = await db
          .collection('bookReviews')
          .where('bookID', 'in', reviewIDs)
          .get();
        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userBooksData = await Promise.all(
          userBooksSnapshot.docs.map(async (doc) => {
            const userBookData = doc.data();
            const review = reviewsData.find(
              (review: { id: string; bookID: string }) =>
                review.bookID === userBookData.bookID
            );
            const book = (await fetchBookBasedOnBookID(
              userBookData.bookID
            )) as { isbn?: string; title?: string };
            // console.log('book', book);
            let thumbnail;
            try {
              thumbnail = await fetchThumbnailByISBN(book?.isbn);
            } catch (error) {
              thumbnail = await fetchThumbnailByTitle(book?.title);
            }
            return {
              ...userBookData,
              review,
              user: userData,
              book,
              thumbnail,
            };
          })
        );

        // console.log('userBooksData', userBooksData);
        return userBooksData;
      });

      const resolvedReviewsData = await Promise.all(reviewsDataPromises);
      const newThumbnails = {};
      const fetchedTitles = new Set();
      let thumbnailCount = 0;

      for (const userBooksData of resolvedReviewsData) {
        for (const userBookData of userBooksData) {
          if (thumbnailCount >= 5) {
            break;
          }

          if (!fetchedTitles.has(userBookData.book.title)) {
            newThumbnails[userBookData.book.title] = userBookData.thumbnail;
            fetchedTitles.add(userBookData.book.title);
            thumbnailCount++;
          }
        }

        if (thumbnailCount >= 5) {
          break;
        }
      }
      //   console.log('newThumbnails', newThumbnails);
      setThumbnails(newThumbnails);
      setReviewsData(resolvedReviewsData);
      trace.stop();
    };
    fetchReviewsForGroupMembers();
  }, [membersData]);

  useEffect(() => {
    if (group) {
      fetchMembersData(group, setMembersData);
    }
  }, [group]);

  const handleAddMemberClick = () => {
    history.push('/my/addmember');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{group ? group.name : 'Loading...'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonListHeader>
                <IonLabel className='header-label'>Recent Reviews</IonLabel>
              </IonListHeader>
              {reviewsData.length > 0 ? (
                reviewsData.slice(0, 3).map((memberReviews, memberIndex) => (
                  <div key={memberIndex}>
                    {memberReviews
                      .filter(
                        (review) =>
                          review.review !== undefined &&
                          review.book !== undefined
                      )
                      .map((review, bookIndex) =>
                        review.book?.id ? (
                          <IonRouterLink
                            routerLink={`/my/books/view/${review.book.id}`}
                            key={bookIndex}
                          >
                            <IonCard>
                              <div className='card-header'>
                                <IonCardTitle className='small-title'>
                                  {review.book?.title}
                                </IonCardTitle>

                                <div className='rating-container'>
                                  {[1, 2, 3, 4, 5].map((starNumber) => (
                                    <IonIcon
                                      key={starNumber}
                                      icon={
                                        starNumber <= review.review?.rating
                                          ? star
                                          : starOutline
                                      }
                                      className='rating-star'
                                    />
                                  ))}
                                </div>
                              </div>

                              <IonCardTitle className='username'>
                                {review.user?.firstName || review.user?.email}
                              </IonCardTitle>
                              <IonCardContent className='card-content'>
                                {review.review?.review}
                              </IonCardContent>
                            </IonCard>
                          </IonRouterLink>
                        ) : null
                      )}
                  </div>
                ))
              ) : (
                <p>No reviews available</p>
              )}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonListHeader>
                <IonLabel className='header-label'>
                  Recently Added Books
                </IonLabel>
              </IonListHeader>
              <div className='thumbnail-container'>
                {reviewsData.map((userBooksData) =>
                  userBooksData.map((userBookData) => (
                    <div key={userBookData.book.title} className='thumbnail'>
                      <IonRouterLink
                        routerLink={`/my/books/view/${userBookData.book.id}`}
                        key={userBookData.book.title}
                      >
                        {userBookData.thumbnail ? (
                          <img src={userBookData.thumbnail} />
                        ) : (
                          <IonIcon icon={book} />
                        )}
                      </IonRouterLink>
                    </div>
                  ))
                )}
              </div>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonListHeader>
                <IonLabel className='header-label'>Members</IonLabel>
              </IonListHeader>
              <IonList lines='full'>
                {/* Display the members */}
                {membersData.map((member, index) => (
                  <IonItem key={index}>
                    <IonAvatar slot='start'>
                      <img src={member.profile || '/placeholder1.jpg'} />
                    </IonAvatar>
                    <IonLabel>{member.email}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
        {/* <p>Group ID: {group ? group.id : 'Loading...'}</p> */}
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton>
            <IonIcon icon={chevronUpCircle}></IonIcon>
          </IonFabButton>
          <IonFabList side='top'>
            {/* <IonFabButton>
                <IonIcon icon={settings}></IonIcon>
              </IonFabButton> */}
            <IonFabButton onClick={handleAddMemberClick}>
              <IonIcon icon={personAdd}></IonIcon>
            </IonFabButton>
            <LeaveGroup groupId={group.id} />
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
console.log('Outside InsideGroupsPageTwo function');
export default InsideGroupsPageTwo;
