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
  IonIcon,
} from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
import { bookSharp } from 'ionicons/icons';
import '../pages/SearchPage.css';
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
      <IonHeader className='header-padding-text'>
        {/* <IonToolbar> */}
        <IonButtons className='button-padding-extra-left' slot='start'>
          <IonButton onClick={onClose}>Cancel</IonButton>
        </IonButtons>
        {/* <IonTitle>Search Results</IonTitle> */}
        {/* </IonToolbar> */}
      </IonHeader>
      <IonContent className='ion-padding'>
        <h1 className='h1-padding-left'>Search Results</h1>
        <IonList>
          {books &&
            books.map((book, index) => (
              <IonItem key={index} button onClick={() => onBookSelect(book)}>
                <IonLabel>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img
                        className='full-thumbnail'
                        src={book.volumeInfo.imageLinks.thumbnail}
                        alt='Book thumbnail'
                        style={{ marginRight: '10px' }}
                      />
                    ) : (
                      <IonIcon
                        slot='start'
                        icon={bookSharp}
                        className='book-icon'
                        style={{ marginRight: '10px' }}
                      />
                    )}
                    <div>
                      <h1>{book.volumeInfo.title}</h1>
                      <p>
                        {book.volumeInfo.authors &&
                          book.volumeInfo.authors.join(', ')}
                      </p>
                    </div>
                  </div>
                </IonLabel>
              </IonItem>
            ))}
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default SearchResultModal;
