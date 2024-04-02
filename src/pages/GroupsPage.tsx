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
  IonSegment,
  IonSegmentButton,
  IonFabList,
  IonItem,
  IonList,
  IonListHeader,
  IonRouterLink,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { Redirect } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { fetchUserSpecificInfo } from '../functions/UserHelper';
import LeaveGroup from '../components/LeaveGroup';
import 'firebase/auth';
import 'firebase/firestore';
import {
  add,
  personAdd,
  chevronUpCircle,
  star,
  starOutline,
  person,
  personCircle,
} from 'ionicons/icons';
import { fetchMembersData } from '../functions/GroupsHelper';
import { fetchBookBasedOnBookID } from '../functions/BooksHelper';
import {
  fetchThumbnailByISBN,
  fetchThumbnailByTitle,
} from '../functions/APIHelper';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState([]);
  const currentUserId = firebase.auth().currentUser?.uid;
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const db = firebase.firestore();
  const history = useHistory();
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
    const group = groups.find((group) => group.id === groupId);
    if (group) {
      history.push(`/my/addmember/${group.id}`);
    } else {
      console.log('No group selected');
    }
  };

  useEffect(() => {
    if (groups.length === 1) {
      setSelectedGroup(groups[0]);
      fetchMembersData(groups[0], setMembersData);
    }
  }, [groups]);

  const fetchGroups = async () => {
    const db = firebase.firestore();
    db.collection('groups')
      .where('members', 'array-contains', currentUserId)
      .get()
      .then((snapshot) => {
        const groups = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groups);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
      });
  };
  useEffect(() => {
    fetchGroups();
  }, [groups]);

  useEffect(() => {
    if (selectedGroup) {
      fetchMembersData(selectedGroup, setMembersData);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (membersData) {
      fetchReviewsForGroupMembers();
    }
  }, [membersData]);

  const getUsersBooks = async (memberId) => {
    const userBooks = await db
      .collection('userBooks')
      .where('userID', '==', memberId)
      .limit(3)
      .get();
    return userBooks;
  };
  const fetchReviewsForGroupMembers = async () => {
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
          .where('userID', '==', member.id)
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
            location: userSpecificInfo?.location,
            tags: userSpecificInfo?.tags,
            purchaseDate: userSpecificInfo?.purchaseDate,
            edition: userSpecificInfo?.edition,
          };
        })
      );
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

        if (userBookData.book && !fetchedTitles.has(userBookData.book.title)) {
          newThumbnails[userBookData.book.title] = userBookData.thumbnail;
          fetchedTitles.add(userBookData.book.title);
          thumbnailCount++;
        }
      }

      if (thumbnailCount >= 5) {
        break;
      }
    }
    setThumbnails(newThumbnails);
    setReviewsData(resolvedReviewsData);
  };

  if (groups.length === 0 && !loading) {
    console.log('Redirecting to /my/groupcreation');
    return <Redirect to='/my/groupcreation' />;
  } else if (groups.length === 1 && !loading) {
    console.log('Redirecting to one group page');
    return (
      <Redirect
        to={{
          pathname: `/my/oneGroup/${groups[0].id}`,
          state: {
            groupId: groups[0].id,
            name: groups[0].name,
            group: groups[0],
          },
        }}
      />
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const doRefresh = async (event) => {
    await fetchGroups();
    // if (selectedGroup) {
    await fetchMembersData(selectedGroup, setMembersData);
    // }
    // if (membersData) {
    // await fetchReviewsForGroupMembers();
    // }
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader className='header-padding-text'></IonHeader>
      <IonContent>
        <IonRefresher slot='fixed' onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {groups.length > 1 && <h1 className='h1-padding-left'>My Groups</h1>}
        {groups.length > 1 && (
          <IonSegment scrollable className='segment-groups'>
            {groups.map((group, index) => (
              <IonSegmentButton
                key={index}
                onClick={() => setSelectedGroup(group)}
              >
                <IonLabel>{group.name}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        )}
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
              {reviewsData.map((userBooksData, outerIndex) =>
                userBooksData.map((userBookData, innerIndex) => (
                  <div
                    key={`${outerIndex}-${innerIndex}`}
                    className='thumbnail'
                  >
                    <div
                      onClick={() => {
                        if (userBookData.book) {
                          history.push(
                            `/my/books/view/${userBookData.book.id}`,
                            userBookData
                          );
                        }
                      }}
                    >
                      {userBookData.thumbnail ? (
                        <img src={userBookData.thumbnail} />
                      ) : null}
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
            <IonFabButton
              onClick={() => handleAddMemberClick(selectedGroup?.groupId)}
            >
              <IonIcon icon={personAdd}></IonIcon>
            </IonFabButton>
            <IonFabButton onClick={handleCreateGroup}>
              <IonIcon icon={add}></IonIcon>
            </IonFabButton>
            <LeaveGroup groupId={selectedGroup?.groupId} />
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default GroupsPage;
