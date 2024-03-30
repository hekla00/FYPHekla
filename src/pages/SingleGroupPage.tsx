import {
  IonHeader,
  IonPage,
  IonRow,
  IonCol,
  IonLabel,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardTitle,
  IonFabList,
  IonItem,
  IonList,
  IonListHeader,
  IonRouterLink,
  IonCardContent,
} from '@ionic/react';
import {
  add,
  personAdd,
  chevronUpCircle,
  star,
  starOutline,
  person,
  personCircle,
} from 'ionicons/icons';
import {
  getUsersBooks,
  fetchGroup,
  fetchMembersDataforGroup,
} from '../functions/GroupsHelper';
import { fetchBookBasedOnBookID } from '../functions/BooksHelper';
import {
  fetchThumbnailByISBN,
  fetchThumbnailByTitle,
} from '../functions/APIHelper';
import { useHistory, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { fetchUserSpecificInfo } from '../functions/UserHelper';
import LeaveGroup from '../components/LeaveGroup';
import 'firebase/auth';
import 'firebase/firestore';

const SingleGroupPage: React.FC = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const { groupId } = useParams<{ groupId: string }>();
  //   console.log('SingleGroupPage is being rendered');
  //   console.log('Group ID:', groupId);
  const db = firebase.firestore();
  const history = useHistory();
  //   const groupName = groups[0].name;
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({
    open: false,
    event: undefined,
  });

  const handleCreateGroup = () => {
    history.push('/my/groupcreation');
  };

  const handleAddMemberClick = (groupId) => {
    setShowPopover({ open: false, event: undefined });
    if (groupId) {
      history.push(`/my/addmember/${groupId}`);
    } else {
      console.log('No group selected');
    }
  };

  useEffect(() => {
    fetchGroup(groupId, setGroup, setLoading);
    console.log('fetchGroup has been called');
  }, []);
  console.log('group info', group);
  useEffect(() => {
    fetchMembersDataforGroup(group, setMembersData);
  }, [group, groupId]);

  const fetchReviewsForGroupMembers = async () => {
    // if (selectedGroup) {
    const reviewsDataPromises = membersData.map(async (member) => {
      const userBooksSnapshot = await getUsersBooks(member.id);
      const userID = member.id;

      const userSnapshot = await db.collection('publicUsers').doc(userID).get();
      const userData = userSnapshot.data();

      const reviewIDs = userBooksSnapshot.docs.map((doc) => doc.data().bookID);
      let reviewsData = [];
      if (reviewIDs.length > 0) {
        const reviewsSnapshot = await db
          .collection('bookReviews')
          .where('bookID', 'in', reviewIDs)
          .get();
        reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      const userBooksData = await Promise.all(
        userBooksSnapshot.docs.map(async (doc) => {
          const userBookData = doc.data();
          const review = reviewsData.find(
            (review: { id: string; bookID: string }) =>
              review.bookID === userBookData.bookID
          );
          const book = (await fetchBookBasedOnBookID(userBookData.bookID)) as {
            isbn?: string;
            title?: string;
          };
          // console.log('book', book);
          const userSpecificInfo = await fetchUserSpecificInfo(
            userBookData.bookID,
            userBookData.userID
          );
          let thumbnail;
          try {
            thumbnail = await fetchThumbnailByISBN(book?.isbn);
          } catch (error) {
            thumbnail = await fetchThumbnailByTitle(book?.title);
          }
          console.log(userSpecificInfo);
          return {
            ...userBookData,
            review,
            user: userData,
            book,
            thumbnail,
            // ...userSpecificInfo,
            location: userSpecificInfo?.location,
            tags: userSpecificInfo?.tags,
            purchaseDate: userSpecificInfo?.purchaseDate,
            edition: userSpecificInfo?.edition,
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
    // console.log('rdata', reviewsData);
  };
  useEffect(() => {
    if (membersData) {
      fetchReviewsForGroupMembers();
    }
  }, [membersData]);

  return (
    <IonPage>
      <IonHeader className='header-padding-text'></IonHeader>
      <IonContent>
        <h1 className='h1-padding-left'>{group?.name}</h1>

        <IonRow>
          <IonCol>
            <IonListHeader>
              <IonLabel className='header-label'>Recent Reviews</IonLabel>
            </IonListHeader>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {reviewsData.length > 0 ? (
                reviewsData.slice(0, 2).map((memberReviews, memberIndex) => (
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
                            <IonCard className='card-groups'>
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
                                <IonIcon
                                  icon={person}
                                  style={{ paddingRight: '3px' }}
                                ></IonIcon>
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
                <IonCard className='card-groups'>
                  <div className='card-header'>
                    <IonCardTitle className='small-title'>
                      No reviews available
                    </IonCardTitle>
                  </div>
                </IonCard>
              )}
            </div>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonListHeader>
              <IonLabel className='header-label'>Members</IonLabel>
            </IonListHeader>
            <div style={{ maxHeight: '100px', overflow: 'auto' }}>
              <IonList lines='full'>
                {/* Display the members */}
                {membersData.map((member, index) => (
                  <IonItem key={index}>
                    <IonIcon
                      icon={personCircle}
                      className='icon-spacing'
                    ></IonIcon>
                    <IonLabel className='label-spacing'>
                      {member.email}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </div>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonListHeader>
              <IonLabel className='header-label'>Recently Added Books</IonLabel>
            </IonListHeader>

            <div className='thumbnail-container'>
              {reviewsData.map((userBooksData) =>
                userBooksData.map((userBookData) => (
                  <div key={userBookData.book.title} className='thumbnail'>
                    <div
                      onClick={() =>
                        history.push(
                          `/my/books/view/${userBookData.book.id}`,
                          userBookData
                        )
                      }
                      key={userBookData.book.title}
                    >
                      {
                        userBookData.thumbnail ? (
                          <img src={userBookData.thumbnail} />
                        ) : null
                        // <IonIcon icon={book} />
                      }
                    </div>
                  </div>
                ))
              )}
            </div>
          </IonCol>
        </IonRow>
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton>
            <IonIcon icon={chevronUpCircle}></IonIcon>
          </IonFabButton>
          <IonFabList side='top'>
            <IonFabButton onClick={() => handleAddMemberClick(groupId)}>
              <IonIcon icon={personAdd}></IonIcon>
            </IonFabButton>
            <IonFabButton onClick={handleCreateGroup}>
              <IonIcon icon={add}></IonIcon>
            </IonFabButton>
            {/* <IonFabButton
                  onClick={() => handleLeaveGroup(selectedGroup.groupId)}
                >
                  <IonIcon icon={exit}></IonIcon>
                </IonFabButton> */}
            <LeaveGroup groupId={groupId} />
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default SingleGroupPage;
