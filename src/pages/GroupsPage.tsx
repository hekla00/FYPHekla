import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRow,
  IonCol,
  IonLabel,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardTitle,
  IonGrid,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonFabList,
  IonItem,
  IonAvatar,
  IonList,
  IonListHeader,
  IonRouterLink,
  IonCardContent,
  IonButtons,
  IonPopover,
  IonButton,
} from '@ionic/react';
import { Redirect } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import LeaveGroup from '../components/LeaveGroup';
import 'firebase/auth';
import 'firebase/firestore';
import {
  add,
  personAdd,
  chevronUpCircle,
  star,
  starOutline,
  book,
  ellipsisHorizontalCircleOutline,
  exit,
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
  // console.log('currentUserId', currentUserId);
  const [loading, setLoading] = useState(true);
  const [membersData, setMembersData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  // console.log('selectedGroup', selectedGroup);
  const [showActionSheet, setShowActionSheet] = useState(false);
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

  const handleAddMemberClick = () => {
    setShowPopover({ open: false, event: undefined });
    if (selectedGroup) {
      history.push('/my/addmember');
    } else {
      console.log('No group selected');
    }
  };
  const handleInsideGroup = (groupId: string) => {
    history.push({
      pathname: `/my/insideGroups/${groupId}`,
      state: { groupId: groupId },
    });
  };
  useEffect(() => {
    if (groups.length > 1 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups]);
  useEffect(() => {
    const fetchGroups = async () => {
      const db = firebase.firestore();
      // console.log('currentUserId', currentUserId);
      db.collection('groups')
        .where('members', 'array-contains', currentUserId)
        .get()
        .then((snapshot) => {
          const groups = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // console.log('groups', groups);
          setGroups(groups);
          // console.log('groups after', groups);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching groups:', error);
        });
    };
    fetchGroups();
  }, [groups]);

  useEffect(() => {
    if (selectedGroup) {
      fetchMembersData(selectedGroup, setMembersData);
    }
  }, [selectedGroup]);

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
      // if (selectedGroup) {
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
    };
    fetchReviewsForGroupMembers();
  }, [selectedGroup]);

  const handleLeaveGroup = async (groupId) => {
    <LeaveGroup groupId={groupId} />;
  };

  if (groups.length === 0 && !loading) {
    console.log('Redirecting to /my/groupcreation');
    return <Redirect to='/my/groupcreation' />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <IonPage>
      <IonHeader>
        {/* <IonToolbar>
          {groups.length !== 1 && <IonTitle>My Groups</IonTitle>}
          {groups.length === 1 && <IonTitle>{groups[0]?.name}</IonTitle>} */}
        <div className='header-container-groups'>
          <IonButtons
            // slot='end'
            onClick={(e) =>
              setShowPopover({ open: true, event: e.nativeEvent })
            }
          >
            <IonIcon
              slot='icon-only'
              icon={ellipsisHorizontalCircleOutline}
            ></IonIcon>
          </IonButtons>

          <IonPopover
            isOpen={showPopover.open}
            event={showPopover.event}
            onDidDismiss={() =>
              setShowPopover({ open: false, event: undefined })
            }
          >
            <IonList>
              <IonItem onClick={handleAddMemberClick}>
                <IonIcon slot='end' icon={personAdd}></IonIcon>
                <IonLabel>Add Member</IonLabel>
              </IonItem>

              <IonItem onClick={handleCreateGroup}>
                <IonIcon slot='end' icon={add}></IonIcon>
                <IonLabel>Create Group</IonLabel>
              </IonItem>

              <IonItem onClick={handleLeaveGroup}>
                <IonIcon slot='end' icon={exit}></IonIcon>
                <IonLabel>Leave Group</IonLabel>
              </IonItem>
            </IonList>
          </IonPopover>
        </div>
        {/* </IonToolbar> */}
      </IonHeader>
      <IonContent>
        {groups.length > 1 && (
          <IonSegment scrollable className='segment-groups'>
            {groups.map((group, index) => (
              <IonSegmentButton
                // value={selectedGroup?.id}
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
            {reviewsData.length > 0 ? (
              reviewsData.slice(0, 1).map((memberReviews, memberIndex) => (
                <div key={memberIndex}>
                  {memberReviews
                    .filter(
                      (review) =>
                        review.review !== undefined && review.book !== undefined
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
              <p className='ion-padding'>No reviews available</p>
            )}
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
        <IonRow>
          <IonCol>
            <IonListHeader>
              <IonLabel className='header-label'>Recently Added Books</IonLabel>
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
        {/* <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton>
            <IonIcon icon={chevronUpCircle}></IonIcon>
          </IonFabButton>
          <IonFabList side='top'>
            <IonFabButton onClick={handleAddMemberClick}>
              <IonIcon icon={personAdd}></IonIcon>
            </IonFabButton>
            <IonFabButton onClick={handleCreateGroup}>
              <IonIcon icon={add}></IonIcon>
            </IonFabButton>
            <IonFabButton onClick={handleLeaveGroup}>
              <IonIcon icon={exit}></IonIcon>
            </IonFabButton> */}
        {/* <LeaveGroup groupId={groupId} /> */}
        {/* </IonFabList>
        </IonFab> */}
      </IonContent>
    </IonPage>
  );
};

export default GroupsPage;
