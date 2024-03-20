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
import { filter, home, grid, pricetag } from 'ionicons/icons';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { IonSearchbar } from '@ionic/react';
import {
  fetchAllUserAndGroupBooks,
  fetchAllUserBooks,
} from '../functions/UserHelper';
import BookDisplay from '../components/BookDisplay';

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

  const handleSegmentChange = (event: CustomEvent) => {
    setSelectedSegment(event.detail.value);
  };

  const fetchLocations = async () => {
    try {
      const db = firebase.firestore();
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

      //   console.log('bookIds', bookIds);
      // Fetch books documents for the extracted book IDs
      const booksPromises = bookIds.map((ID) =>
        db.collection('books').doc(ID).get()
      );
      const booksSnapshots = await Promise.all(booksPromises);
      const locations = {};
      booksSnapshots.forEach((snapshot) => {
        const data = snapshot.data();
        const location = data && data.location ? data.location : 'Undefined';
        if (!locations[location]) {
          locations[location] = [];
        }
        locations[location].push(data);
      });
      setLocations(locations as any[]);
    } catch (error) {
      console.error('Error fetching locations: ', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const db = firebase.firestore();
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
      const db = firebase.firestore();
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
      const tags = {};
      booksSnapshots.forEach((snapshot) => {
        const data = snapshot.data();
        console.log('book data:', data);
        const bookTags = data && data.tags ? data.tags : ['Undefined'];
        bookTags.forEach((tag) => {
          if (!tags[tag]) {
            tags[tag] = [];
          }
          tags[tag].push(data);
        });
      });
      // console.log('tags:', tags);
      setTags(Object.values(tags) as any[]);
    } catch (error) {
      console.error('Error fetching tags:', error);
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
        (book && book.title) ||
        book.categories ||
        (selectedLocation.length > 0
          ? selectedLocation.includes(book.location)
          : true) ||
        (selectedTag.length > 0
          ? book.tags.some((tag) => selectedTag.includes(tag))
          : true) ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                Category
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
          <IonSegmentButton value='group1'>
            <IonLabel>Group 1</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value='group2'>
            <IonLabel>Group 2</IonLabel>
          </IonSegmentButton>
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
          filteredBooks.map((book) => <BookDisplay book={book} key={book.id} />)
        )}
      </IonContent>
    </IonPage>
  );
};

export default LibraryPage;
