import React, { useRef } from 'react';
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
interface SearchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: any[];
  onBookSelect: (book: any) => void;
}

const SearchResultModal: React.FC<SearchResultModalProps> = ({
  isOpen,
  onClose,
  books,
  onBookSelect,
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === 'confirm') {
      onClose();
    }
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      onWillDismiss={(ev) => onWillDismiss(ev)}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonButton onClick={onClose}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Search Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <IonList>
          {books &&
            books.map((book, index) => (
              <IonItem key={index} button onClick={() => onBookSelect(book)}>
                <IonLabel>
                  <h2>{book.volumeInfo.title}</h2>
                  <p>
                    {book.volumeInfo.authors &&
                      book.volumeInfo.authors.join(', ')}
                  </p>
                </IonLabel>
              </IonItem>
            ))}
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default SearchResultModal;
