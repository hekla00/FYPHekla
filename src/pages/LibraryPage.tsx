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
  IonAccordionGroup,
  IonAccordion,
  IonCard,
  IonCardHeader,
  IonChip,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { home, grid, pricetag } from 'ionicons/icons';
import firebase from 'firebase/app';
import 'firebase/firestore';

const LibraryPage: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [locations, setLocations] = useState<{ [key: string]: any[] }>({});
  const history = useHistory();
  const [categories, setCategories] = useState({});
  const [tags, setTags] = useState({});

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
      setLocations(locations);
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
      setCategories(categories);
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
      const categories = {};
      const tags = {};
      booksSnapshots.forEach((snapshot) => {
        const data = snapshot.data();
        console.log('book data:', data);
        const bookCategories =
          data && data.categories ? data.categories : ['Undefined'];
        const bookTags = data && data.tags ? data.tags : ['Undefined'];
        bookCategories.forEach((category) => {
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(data);
        });
        bookTags.forEach((tag) => {
          if (!tags[tag]) {
            tags[tag] = [];
          }
          tags[tag].push(data);
        });
      });
      console.log('categories:', categories);
      console.log('tags:', tags);
      setCategories(categories);
      setTags(tags);
    } catch (error) {
      console.error('Error fetching categories and tags:', error);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchCategories();
    fetchTags();
  }, []);

  const handleLocationClick = (location: string, books: any[]) => {
    history.push('/my/insidelibrary', {
      filter: 'location',
      value: location,
      books,
    });
  };
  const handleCategoryClick = (category: string, books: any[]) => {
    history.push('/my/insidelibrary', {
      filter: 'categories',
      value: category,
      books,
    });
  };

  const handleTagClick = (tagName: string, books: any[]) => {
    history.push('/my/insidelibrary', { filter: 'tags', value: tagName });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Library</IonTitle>
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
        <IonAccordionGroup>
          <IonAccordion value='first'>
            <IonItem slot='header'>
              <IonLabel>Location</IonLabel>
            </IonItem>
            <div slot='content'>
              {Object.entries(locations).map(([location, books], index) => (
                <IonCard key={index}>
                  <IonCardHeader
                    onClick={() => handleLocationClick(location, books)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IonIcon icon={home} style={{ marginRight: '5px' }} />
                      {location === 'Undefined' ? 'No Location' : location}
                    </div>
                  </IonCardHeader>
                </IonCard>
              ))}
            </div>
          </IonAccordion>
          <IonAccordion value='second'>
            <IonItem slot='header'>
              <IonLabel>Categories</IonLabel>
            </IonItem>
            <div slot='content'>
              {Object.entries(categories).map(([category, books], index) => (
                <IonCard key={index}>
                  <IonCardHeader
                    onClick={() =>
                      handleCategoryClick(category, books as any[])
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IonIcon icon={grid} style={{ marginRight: '5px' }} />
                      {category === 'Undefined' ? 'No Category' : category}
                    </div>
                  </IonCardHeader>
                </IonCard>
              ))}
            </div>
          </IonAccordion>
          <IonAccordion value='thrid'>
            <IonItem slot='header'>
              <IonLabel>Tags</IonLabel>
            </IonItem>
            <div slot='content'>
              {Object.entries(tags).map(([tag, books], index) => (
                <IonChip
                  key={index}
                  onClick={() => handleTagClick(tag, books as any[])}
                >
                  <IonIcon icon={pricetag} style={{ marginRight: '5px' }} />{' '}
                  {tag === 'Undefined' ? 'No Tag' : tag}
                </IonChip>
              ))}
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

export default LibraryPage;
