import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonPopover,
  IonListHeader,
  IonCheckbox,
  IonSpinner,
} from '@ionic/react';
import { filter, filterCircleOutline } from 'ionicons/icons';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { IonSearchbar } from '@ionic/react';
import {
  fetchAllUserAndGroupBooks,
  fetchAllUserBooks,
} from '../functions/UserHelper';
import BookDisplay from '../components/BookDisplay';
import { fetchSelectedGroupBooks } from '../functions/UserHelper';

const LibraryPage: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [showPopover, setShowPopover] = useState({
    isOpen: false,
    event: undefined,
  });
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showLocations, setShowLocations] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [isLoaned, setIsLoaned] = useState(null);
  const [showLoanedFilter, setShowLoanedFilter] = useState(null);

  const db = firebase.firestore();

  const handleSegmentChange = (event: CustomEvent) => {
    setSelectedSegment(event.detail.value);
  };

  const fetchCategories = async () => {
    try {
      const userId = firebase.auth().currentUser?.uid;
      console.log('userId lib', userId);
      if (!userId) {
        console.error('No user is currently logged in.');
        return;
      }

      // Fetch userBooks documents for the current user
      const userBooksSnapshot = await db
        .collection('userBooks')
        .where('userID', '==', userId)
        .get();

      // Extract book IDs from the userBooks documents
      const bookIds = userBooksSnapshot.docs.map((doc) => doc.data().bookID);
      console.log('bookIds:', bookIds);

      // Fetch books documents for the extracted book IDs
      const booksPromises = bookIds.map((ID) =>
        db.collection('books').doc(ID).get()
      );
      const booksSnapshots = await Promise.all(booksPromises);
      const categories = {};
      booksSnapshots.forEach((snapshot) => {
        const data = snapshot.data();
        console.log('book data:', data);
        const bookCategories =
          data && data.categories ? data.categories : ['Undefined'];
        bookCategories.forEach((category) => {
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(data);
        });
      });
      console.log('categories:', categories);
      setCategories(Object.values(categories));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // const fetchTags = async () => {
  //   const userBooksCollection = db.collection('userBooks');
  //   const snapshot = await userBooksCollection.get();
  //   const tags = snapshot.docs
  //     .map((doc) => {
  //       const data = doc.data();
  //       return data.tags;
  //     })
  //     .flat()
  //     .filter((tag) => tag);
  //   const uniqueTags = [...new Set(tags)];
  //   setTags(uniqueTags);
  // };
  const [tagObjects, setTagObjects] = useState([]);

  const fetchTags = async () => {
    const userBooksCollection = db.collection('userBooks');
    const snapshot = await userBooksCollection.get();
    const tags = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const tagsArray = Array.isArray(data.tags) ? data.tags : [data.tags];
        return tagsArray.map((tag) => ({ tag, bookID: data.bookID }));
      })
      .flat()
      .filter((tag) => tag.tag);
    const uniqueTags = [...new Set(tags.map((tag) => tag.tag))];
    setTags(uniqueTags);
    setTagObjects(tags);
  };

  useEffect(() => {
    fetchTags();
  }, [selectedTags]);

  const fetchLocations = async () => {
    const userBooksCollection = db.collection('userBooks');
    const snapshot = await userBooksCollection.get();
    const locations = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return { location: data.location, bookID: data.bookID };
      })
      .filter((location) => location.location);
    const uniqueLocations = [...new Set(locations)];
    setLocations(uniqueLocations);
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedLocation]);
  useEffect(() => {
    if (selectedSegment === 'mine') {
      fetchAllUserBooks(setIsLoading, setAllBooks);
    } else if (selectedSegment === 'all') {
      fetchAllUserAndGroupBooks(setIsLoading, setAllBooks);
    }
  }, [setIsLoading, setAllBooks, selectedSegment]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [selectedCategory, selectedTags]);

  useEffect(() => {
    console.log('searchQuery:', searchQuery);
    const currentUserId = firebase.auth().currentUser?.uid;
    const nonNullBooks = allBooks.filter((book) => book !== null);

    const fetchLoanedStatus = async (bookId) => {
      const loanSnapshot = await db
        .collection('bookLoans')
        .where('bookID', '==', bookId)
        .get();

      if (!loanSnapshot.empty) {
        const loanData = loanSnapshot.docs[0].data();
        return loanData ? loanData.loaned : false;
      } else {
        return false;
      }
    };

    const filterAndSetBooks = async () => {
      const loanedStatuses = await Promise.all(
        nonNullBooks.map((book) => fetchLoanedStatus(book.id))
      );
      const filteredBooks = [];
      for (let i = 0; i < nonNullBooks.length; i++) {
        const book = nonNullBooks[i];
        const loaned = loanedStatuses[i];
        const locationData = locations.find(
          (location) => location.bookID === book.id
        );
        console.log('Book ID:', book.id);
        locations.forEach((location) => {
          console.log('Location bookID:', location.bookID);
        });
        console.log('Locations:', locations);
        // console.log('Book ID:', book.id);
        const bookLocation = locationData ? locationData.location : null;
        console.log('Selected locations:', selectedLocation);
        console.log('Book location:', bookLocation);
        const tagData = tagObjects.filter(
          (tagObject) => tagObject.bookID === book.id
        );
        const bookTags = tagData
          ? tagData.map((tagObject) => tagObject.tag)
          : [];

        // const tagData = tags.find((tags) => tags.bookID === book.id);
        console.log('tags', tags);
        tags.forEach((tag) => {
          console.log('tag book ID', tag.bookID);
        });
        // const bookTags = tagData ? tagData.map((tag) => tag.tag) : [];
        console.log('selected tag', selectedTags);
        console.log('tagData', tagData);

        const isLoanedCondition = isLoaned === null || loaned === isLoaned;
        const searchQueryCondition =
          book.title &&
          book.title.toLowerCase().includes(searchQuery.toLowerCase());
        const locationCondition =
          selectedLocation.length > 0
            ? selectedLocation.includes(bookLocation)
            : true;
        const tagCondition =
          selectedTags.length > 0
            ? selectedTags.some((tag) => bookTags.includes(tag))
            : true;

        if (
          isLoanedCondition &&
          searchQueryCondition &&
          locationCondition &&
          tagCondition
        ) {
          filteredBooks.push({
            ...book,
            isOwnedByCurrentUser: book.owner === currentUserId,
          });
        }
      }
      setFilteredBooks(filteredBooks);
    };

    filterAndSetBooks();
  }, [
    allBooks,
    selectedLocation,
    selectedCategory,
    selectedTags,
    searchQuery,
    isLoaned,
  ]);

  const handleFilterClick = (filter: string, value: string) => {
    setSelectedFilter(filter);
    setSelectedValue(value);
    setShowPopover({ isOpen: false, event: undefined });
  };

  const handleLocationChange = (location) => {
    setIsLoading(true);
    setSelectedLocation((prevLocations) => {
      const newLocation = prevLocations.includes(location)
        ? prevLocations.filter((l) => l !== location)
        : [...prevLocations, location];
      return newLocation;
    });
  };

  useEffect(() => {
    setIsLoading(false);
  }, [selectedLocation]);

  const handleCategoryChange = (category) => {
    setIsLoading(true);
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category];

      const filteredBooks = allBooks.filter((book) =>
        book.categories
          ? newCategories.every((category) =>
              book.categories.includes(category)
            )
          : false
      );

      setFilteredBooks(filteredBooks);

      return newCategories;
    });
    setIsLoading(false);
  };
  const handleTagChange = (tag) => {
    setIsLoading(true);
    setSelectedTags((prevTags) => {
      return prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag];
    });
  };

  useEffect(() => {
    setIsLoading(false);
  }, [selectedTags]);

  // Group identical categories together
  const allCategories = Array.from(
    new Set(allBooks.flatMap((book) => book.categories || []))
  );

  useEffect(() => {
    const fetchGroups = async () => {
      const currentUserId = firebase.auth().currentUser?.uid;
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

  const handleGroupChange = (groupId) => {
    setSelectedSegment(groupId);
    if (!groupId) {
      console.log('No group selected');
      return;
    }
    fetchSelectedGroupBooks(setIsLoading, setAllBooks, groupId);

    // setFilteredBooks(groupBooks);
  };
  return (
    <IonPage>
      <IonHeader className='header-padding'></IonHeader>
      <IonContent className='ion-padding'>
        <IonSegment
          value={selectedSegment}
          onIonChange={handleSegmentChange}
          scrollable
        >
          <IonSegmentButton value='all'>
            <IonLabel>All</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value='mine'>
            <IonLabel>My Books</IonLabel>
          </IonSegmentButton>
          {groups.map((group, index) => (
            <IonSegmentButton
              value={group.id}
              key={index}
              onClick={() => handleGroupChange(group.id)}
            >
              <IonLabel>{group.name}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
        <div className='search-filter-container'>
          <IonSearchbar
            placeholder='Search for books'
            value={searchQuery}
            onIonInput={(e) => {
              const term = e.detail.value || '';
              setSearchQuery(term);
              if (term) {
                const nonNullBooks = allBooks.filter((book) => book !== null);
                const newFilteredBooks = nonNullBooks.filter(
                  (book) =>
                    book.title &&
                    book.categories &&
                    (selectedLocation.length > 0
                      ? selectedLocation.includes(book.location)
                      : true) &&
                    (selectedTags.length > 0
                      ? book.tags.some((tag) => selectedTags.includes(tag))
                      : true) &&
                    book.title.toLowerCase().includes(term.toLowerCase())
                );
                setFilteredBooks(newFilteredBooks);
              } else {
                setFilteredBooks(allBooks);
              }
            }}
            onIonClear={() => setFilteredBooks(allBooks)}
          />
          <IonLabel
            className='ion-padding'
            slot='end'
            onClick={(e) =>
              setShowPopover({ isOpen: true, event: e.nativeEvent })
            }
          >
            <IonIcon style={{ fontSize: '30px' }} icon={filterCircleOutline} />
          </IonLabel>
          <IonPopover
            isOpen={showPopover.isOpen}
            event={showPopover.event}
            onDidDismiss={() =>
              setShowPopover({ isOpen: false, event: undefined })
            }
          >
            <IonList>
              <IonListHeader>Filter By</IonListHeader>
              <IonItem button onClick={() => setShowLocations(!showLocations)}>
                Location
              </IonItem>
              {showLocations && (
                <IonList>
                  {locations.map((locationObj, index) => (
                    <IonItem key={index}>
                      <IonCheckbox
                        aria-label={locationObj.location}
                        slot='start'
                        value={locationObj.location}
                        checked={selectedLocation.includes(
                          locationObj.location
                        )}
                        onIonChange={(e) =>
                          handleLocationChange(locationObj.location)
                        }
                      />
                      <IonLabel>{locationObj.location}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
              <IonItem
                button
                onClick={() => setShowCategories(!showCategories)}
              >
                Genre
              </IonItem>
              {showCategories && (
                <IonList>
                  {allCategories.map((category, index) => (
                    <IonItem key={index}>
                      <IonCheckbox
                        aria-label='category'
                        slot='start'
                        value={category}
                        checked={selectedCategories.includes(category)}
                        onIonChange={(e) =>
                          handleCategoryChange(e.detail.value)
                        }
                      />
                      <IonLabel>{category}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
              <IonItem button onClick={() => setShowTags(!showTags)}>
                Tags
              </IonItem>
              {showTags && (
                <IonList>
                  {tags.map((tag, index) => (
                    <IonItem key={index}>
                      <IonCheckbox
                        aria-label='tag'
                        slot='start'
                        value={tag}
                        checked={selectedTags.includes(tag)}
                        onIonChange={(e) => handleTagChange(tag)}
                      />
                      <IonLabel>{tag}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonList>
            <IonItem
              button
              onClick={() => setShowLoanedFilter(!showLoanedFilter)}
            >
              Loaned
            </IonItem>
            {showLoanedFilter && (
              <IonList>
                <IonItem>
                  <IonCheckbox
                    aria-label='all'
                    slot='start'
                    value={null}
                    checked={isLoaned === null}
                    onIonChange={() => setIsLoaned(null)}
                  />
                  <IonLabel>All</IonLabel>
                </IonItem>
                <IonItem>
                  <IonCheckbox
                    aria-label='loaned'
                    slot='start'
                    value={true}
                    checked={isLoaned === true}
                    onIonChange={(e) =>
                      setIsLoaned(e.detail.checked ? true : null)
                    }
                  />
                  <IonLabel>Loaned</IonLabel>
                </IonItem>
                <IonItem>
                  <IonCheckbox
                    aria-label='notLoaned'
                    slot='start'
                    value={false}
                    checked={isLoaned === false}
                    onIonChange={(e) =>
                      setIsLoaned(e.detail.checked ? false : null)
                    }
                  />
                  <IonLabel>Not Loaned</IonLabel>
                </IonItem>
              </IonList>
            )}
          </IonPopover>
        </div>
        {isLoading ? (
          <IonSpinner />
        ) : (
          // filteredBooks.map((book, index) => (
          //   <BookDisplay book={book} key={`${book.id}-${index}`} />
          // ))
          filteredBooks.map((book) => <BookDisplay book={book} key={book.id} />)
        )}
      </IonContent>
    </IonPage>
  );
};

export default LibraryPage;
