import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonPopover,
  IonCardContent,
  IonCardTitle,
  IonListHeader,
  IonCheckbox,
  IonSpinner,
} from '@ionic/react';
import { filter } from 'ionicons/icons';
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
  const [selectedTag, setSelectedTag] = useState([]);
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

  const fetchTags = async () => {
    try {
      const userId = firebase.auth().currentUser?.uid;
      if (!userId) {
        console.error('No user is currently logged in.');
        return;
      }

      // Fetch userBooks and books documents for the current user
      const userBooksSnapshot = await db
        .collection('userBooks')
        .where('userID', '==', userId)
        .get();

      const booksSnapshot = await db.collection('books').get();

      // Create a map of books by their id
      const booksById = {};
      booksSnapshot.docs.forEach((doc) => {
        booksById[doc.id] = doc.data();
      });

      // Extract tags from the userBooks documents and match them with the books
      const tags = {};
      userBooksSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.tags) {
          const tag = typeof data.tags === 'string' ? data.tags : undefined;
          if (tag) {
            if (!tags[tag]) {
              tags[tag] = [];
            }
            // Match the userBook with the corresponding book
            const book = booksById[data.bookId];
            if (book) {
              tags[tag].push(book);
            }
          }
        }
      });

      setTags(Object.values(tags));
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const userId = firebase.auth().currentUser?.uid;
      if (!userId) {
        console.error('No user is currently logged in.');
        return;
      }

      // Fetch userBooks documents for the current user
      const userBooksSnapshot = await db
        .collection('userBooks')
        .where('userID', '==', userId)
        .get();

      // Extract locations from the userBooks documents
      const locations = {};
      userBooksSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const bookLocation = data.location || 'Undefined';

        if (!locations[bookLocation]) {
          locations[bookLocation] = [];
        }
        locations[bookLocation].push(data);
      });

      setLocations(Object.values(locations));
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    if (selectedSegment === 'mine') {
      fetchAllUserBooks(setIsLoading, setAllBooks);
    } else if (selectedSegment === 'all') {
      fetchAllUserAndGroupBooks(setIsLoading, setAllBooks);
    }
  }, [setIsLoading, setAllBooks, selectedSegment]);

  useEffect(() => {
    fetchLocations();
    fetchCategories();
    fetchTags();
  }, [selectedLocation, selectedCategory, selectedTag]);

  useEffect(() => {
    console.log('searchQuery:', searchQuery);
    const nonNullBooks = allBooks.filter((book) => book !== null);
    const filteredBooks = nonNullBooks.filter(
      (book) =>
        (book &&
          book.title &&
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          book.categories) ||
        (book.categories == null &&
          (selectedLocation.length > 0
            ? selectedLocation.includes(book.location)
            : true)) ||
        (selectedLocation == null &&
          (selectedTag.length > 0
            ? book.tags.some((tag) => selectedTag.includes(tag))
            : true)) ||
        selectedTag == null
    );

    setFilteredBooks(filteredBooks);
  }, [allBooks, selectedLocation, selectedCategory, selectedTag, searchQuery]);

  const handleFilterClick = (filter: string, value: string) => {
    setSelectedFilter(filter);
    setSelectedValue(value);
    setShowPopover({ isOpen: false, event: undefined });
  };

  const handleLocationChange = (location) => {
    setIsLoading(true);
    setSelectedLocation((prevLocations) =>
      prevLocations.includes(location)
        ? prevLocations.filter((l) => l !== location)
        : [...prevLocations, location]
    );
    setIsLoading(false);
  };

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
      const newTags = prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag];

      const filteredBooks = allBooks.filter((book) =>
        book.tags ? newTags.every((tag) => book.tags.includes(tag)) : false
      );

      setFilteredBooks(filteredBooks);

      return newTags;
    });
    setIsLoading(false);
  };

  // Group identical categories together
  const allCategories = Array.from(
    new Set(allBooks.flatMap((book) => book.categories || []))
  );

  const allTags = Array.from(
    new Set(allBooks.flatMap((book) => book.tags || []))
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
      <IonHeader>
        <IonToolbar>
          <IonTitle slot='start'>Library</IonTitle>
          <IonLabel
            className='ion-padding'
            slot='end'
            onClick={(e) =>
              setShowPopover({ isOpen: true, event: e.nativeEvent })
            }
          >
            <IonIcon icon={filter} />
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
                  {Object.keys(locations).map((location, index) => (
                    <IonItem key={index}>
                      <IonCheckbox
                        aria-label={location}
                        slot='start'
                        value={location}
                        checked={selectedLocation.includes(location)}
                        onIonChange={(e) =>
                          handleLocationChange(e.detail.value)
                        }
                      />
                      <IonLabel>{location}</IonLabel>
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
              {/* {showCategories && (
                <IonList>
                  {allBooks.map((book, index) =>
                    allCategories.map((category, index) => (
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
                    ))
                  )}
                </IonList>
              )} */}
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
              {/* {showTags && (
                <IonList>
                  {allBooks.map((book, index) =>
                    book.tags
                      ? book.tags.map((tag, index) => (
                          <IonItem key={index}>
                            <IonCheckbox
                              aria-label='tag'
                              slot='start'
                              value={tag}
                              checked={selectedTags.includes(tag)}
                              onIonChange={(e) =>
                                handleTagChange(e.detail.value)
                              }
                            />
                            <IonLabel>{tag}</IonLabel>
                          </IonItem>
                        ))
                      : null
                  )}
                </IonList>
              )} */}
              {showTags && (
                <IonList>
                  {allTags.map((tag, index) => (
                    <IonItem key={index}>
                      <IonCheckbox
                        aria-label='tag'
                        slot='start'
                        value={tag}
                        checked={selectedTags.includes(tag)}
                        onIonChange={(e) => handleTagChange(e.detail.value)}
                      />
                      <IonLabel>{tag}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonList>
          </IonPopover>
        </IonToolbar>
      </IonHeader>
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
                  (selectedTag.length > 0
                    ? book.tags.some((tag) => selectedTag.includes(tag))
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
