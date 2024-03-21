import React, { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import {
  fetchThumbnailByISBN,
  fetchThumbnailByTitle,
} from '../functions/APIHelper';

const BookDisplay = ({ book }) => {
  const [thumbnail, setThumbnail] = useState(null);
  //   console.log('Book isbn:', book.isbn.identifier);

  useEffect(() => {
    const fetchThumbnail = async () => {
      // If book is not defined or book.isbn is not defined, don't fetch
      if (!book || !book.isbn) return;

      let thumbnail;
      try {
        thumbnail = await fetchThumbnailByISBN(book.isbn);
      } catch (isbnError) {
        console.error('Failed to fetch thumbnail by ISBN:', isbnError);
      }

      if (!thumbnail) {
        try {
          thumbnail = await fetchThumbnailByTitle(book.title);
        } catch (titleError) {
          console.error('Failed to fetch thumbnail by title:', titleError);
        }
      }

      if (!thumbnail) {
        console.error('Both fetch by ISBN and fetch by title failed');
      }

      setThumbnail(thumbnail);
    };

    fetchThumbnail();
  }, [book]);

  return (
    <IonCard
      onClick={() => {
        console.log('Clicked book ID:', book.id);
      }}
      className='book-card'
      button
      key={book.id}
      routerLink={`/my/books/view/${book.id}`}
    >
      <IonCardHeader>
        <IonCardTitle className='card-title'>{book?.title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className='card-content'>{book?.author}</IonCardContent>
      {thumbnail && <img src={thumbnail} alt={book?.title} />}
    </IonCard>
  );
};

export default BookDisplay;
