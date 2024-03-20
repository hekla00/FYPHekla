import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';

const BookDisplay = ({ book }) => (
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
  </IonCard>
);

export default BookDisplay;
