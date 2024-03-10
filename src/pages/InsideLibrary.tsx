import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import './Library.css';
import { firestore } from '../firebase';
import { useEffect, useState } from 'react';
import { Book, toBook } from '../models';
import { useAuth } from '../authentication';
import firebase from 'firebase/app';
import { useLocation } from 'react-router-dom';

interface InsideLibraryProps {
  selectedFilter: string | null;
  selectedValue: string | null;
}

const InsideLibrary: React.FC<InsideLibraryProps> = ({
  selectedFilter,
  selectedValue,
}) => {
  const { userID } = useAuth();
  const location = useLocation();
  // const selectedFilter = (location as any).state?.filter;
  // const selectedValue = (location as any).state?.value;
  const [books, setBooks] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;

    if (!currentUser) {
      console.log('No user is signed in');
      return;
    }

    if (!selectedFilter || !selectedValue) {
      console.log('No filter is selected');
      return;
    }
    if (currentUser && selectedFilter && selectedValue) {
      const userBooksRef = firestore.collection('userBooks');

      return userBooksRef
        .where('userID', '==', currentUser.uid)
        .onSnapshot(({ docs }) => {
          const bookPromises = docs.map((doc) =>
            firestore.collection('books').doc(doc.data().bookID).get()
          );
          Promise.all(bookPromises).then((bookDocs) => {
            const filteredBooks = bookDocs
              .map((doc) => toBook(doc))
              .filter((book) =>
                Array.isArray(book[selectedFilter])
                  ? book[selectedFilter].includes(selectedValue)
                  : book[selectedFilter] === selectedValue
              );

            const groupedBooks =
              selectedFilter === 'categories' || selectedFilter === 'tags'
                ? groupBy(filteredBooks, selectedFilter)
                : { [selectedValue]: filteredBooks };

            setBooks(groupedBooks);
          });
        });
    } else {
      console.log('No user is signed in or no filter is selected');
    }
  }, [selectedFilter, selectedValue]);

  const groupBy = (array: any[], key: string) =>
    array.reduce((result, currentValue) => {
      (currentValue[key] || []).forEach((item: any) => {
        (result[item] = result[item] || []).push(currentValue);
      });
      return result;
    }, {});

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{selectedValue}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {Object.entries(books).map(([group, booksInGroup]) => (
          <div key={group}>
            <h2>
              {group} ({booksInGroup.length})
            </h2>
            {booksInGroup.map((book: any) => (
              <IonCard
                className='book-card'
                button
                key={book.id}
                routerLink={`/my/books/view/${book.id}`}
              >
                <IonCardHeader>
                  <IonCardTitle className='card-title'>
                    {book?.title}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className='card-content'>
                  {book?.author}
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default InsideLibrary;
