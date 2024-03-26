import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonLabel,
  IonTextarea,
  IonIcon,
  IonDatetime,
  IonPopover,
  IonAccordionGroup,
  IonAccordion,
  IonToast,
} from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';
import { firestore } from '../firebase';
import { useHistory, useLocation } from 'react-router';
import firebase from 'firebase/app';
import SearchResultModal from '../components/SearchResultModal';
import { bookSharp } from 'ionicons/icons';
import './ManuallyAddBookPage.css';
// import { v4 as uuidv4 } from 'uuid';
// import takePhoto from '../components/TakePhoto';
import handleISBNSearch from '../components/HandleISBNSearch';

const ManuallyAddBookPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [data, setData] = useState(null);
  const [isbnData, setIsbnData] = useState('');
  const [titleData, setTitleData] = useState('');
  const [authorData, setAuthorData] = useState('');
  const history = useHistory();
  const [location, setLocation] = useState('');
  const [categories, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [languages, setLanguage] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [edition, setEdition] = useState('');
  const isbnDataRef = useRef('');
  const titleDataRef = useRef('');
  const authorDataRef = useRef('');
  const editionDataRef = useRef<string | null>(null);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = firebase.auth().currentUser;
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bookSelected, setBookSelected] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState<
    string | undefined
  >(undefined);
  const [showPurchaseDatePopover, setShowPurchaseDatePopover] = useState({
    isOpen: false,
    event: undefined,
  });
  const [selectedReleaseDate, setSelectedReleaseDate] = useState<
    string | undefined
  >(undefined);
  const [showReleaseDatePopover, setShowReleaseDatePopover] = useState({
    isOpen: false,
    event: undefined,
  });
  // const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const locationISBNData = useLocation<{ isbn: string | null }>();
  const locationTitleData = useLocation();
  const isbn = locationISBNData.state?.isbn;
  const selectedBook = (locationTitleData.state as { book: any })?.book;
  const authorDataSearch = (
    locationTitleData.state as { authorData: string | null }
  )?.authorData;
  const titleDataSearch = (
    locationTitleData.state as { titleData: string | null }
  )?.titleData;
  const descriptionSearch = (
    locationTitleData.state as { description?: string }
  )?.description;
  const publisherSearch = (locationTitleData.state as { publisher?: string })
    ?.publisher;
  const pagesSearch = (locationTitleData.state as { pages?: string })?.pages;
  const releaseDateSearch = (
    locationTitleData.state as { releaseDate?: string }
  )?.releaseDate;
  const category = (locationTitleData.state as { category?: string[] })
    ?.category;
  const editionSearch = (locationTitleData.state as { edition?: string })
    ?.edition;
  const thumbnailUrlSearch = (
    locationTitleData.state as { thumbnailUrl?: string }
  )?.thumbnailUrl;
  const language = (locationTitleData.state as { language?: string })?.language;
  const purchaseDateSearch = (
    locationTitleData.state as { purchaseDate?: string }
  )?.purchaseDate;

  useEffect(() => {
    if (locationISBNData.state?.isbn) {
      handleISBNSearch(
        locationISBNData.state.isbn,
        setTitle,
        setAuthor,
        setShowModal,
        setIsLoading,
        setData,
        setIsbnData,
        setBooks,
        setDescription,
        setPublisher,
        setPages,
        setReleaseDate,
        setCategory,
        setThumbnailUrl,
        setBookSelected,
        setLanguage,
        setPurchaseDate,
        setShowToast,
        setModalData
      );
    } else if (selectedBook) {
      setTitleData(titleDataSearch);
      setAuthorData(authorDataSearch);
      setAuthor(authorDataSearch);
      setTitle(titleDataSearch);
      setDescription(descriptionSearch);
      setPublisher(publisherSearch);
      setPages(pagesSearch);
      setReleaseDate(releaseDateSearch);
      setCategory(category ? category[0] : undefined);
      setEdition(editionSearch);
      setThumbnailUrl(thumbnailUrlSearch);
      setLanguage(language);
      setPurchaseDate(purchaseDateSearch);
      setBookSelected(true);
      const isbn13Obj = selectedBook.industryIdentifiers?.find(
        (identifier: any) => identifier.type === 'ISBN_13'
      );
      if (isbn13Obj) {
        setIsbnData(isbn13Obj.identifier);
      }
    }
  }, [location, selectedBook]);

  const handleAddBook = async () => {
    // console.log('handleAddBook function called');
    const booksRef = firestore.collection('books');
    // const booksRef1 = firestore.collection('books').doc(selectedBook?.id);
    // const bookDoc = await booksRef1;
    const newBookRef = {
      title: titleData || title || '',
      author: authorData || author || authorDataRef.current || '',
      categories: categories || [],
      languages: languages || [],
      publisher: publisher || '',
      description: description || '',
      pages: pages || 0,
      releaseDate: releaseDate
        ? firebase.firestore.Timestamp.fromDate(new Date(releaseDate))
        : selectedReleaseDate
        ? firebase.firestore.Timestamp.fromDate(new Date(selectedReleaseDate))
        : null,
      isbn: isbnData || isbn || isbnDataRef.current || '',
    };
    const bookSnapshot = await booksRef
      .where('isbn', '==', newBookRef.isbn)
      .get();

    let bookId;

    // If a book with the same ISBN is found, use its ID
    if (!bookSnapshot.empty) {
      bookId = bookSnapshot.docs[0].id;
    } else {
      // Otherwise, add the book to the 'books' collection and get the created document
      const bookDocRef = await booksRef.add(newBookRef);

      // Get the ID of the created document
      bookId = bookDocRef.id;
    }

    const userID = firebase.auth().currentUser?.uid;
    console.log('userID book: ', userID);
    if (!userID) {
      console.error('No user is currently logged in.');
      return;
    }
    // console.log('bookRef1: ', bookRef);

    // if (!bookRef || !bookRef.id) {
    //   console.error(
    //     'bookRef is not a document reference or bookRef.id is undefined.'
    //   );
    //   return;
    // }

    const newUserBooksRef = {
      userID: userID,
      bookID: bookId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      location: location || '',
      purchaseDate: selectedPurchaseDate
        ? firebase.firestore.Timestamp.fromDate(new Date(selectedPurchaseDate))
        : null,
      edition: edition || '',
      tags: tags || [],
    };
    // write function that adds the books to the userBooks collection for the current user
    const userBooksRefa = firestore.collection('userBooks');
    // const userBookRefb = await userBooksRefa.add(newUserBooksRef);
    try {
      const userBookRefb = await userBooksRefa.add(newUserBooksRef);
      console.log('userBookRefb: ', userBookRefb);
    } catch (error) {
      console.error('Error adding book: ', error);
    }
    // firebase.firestore().collection('userBooks').add(userBooksRef);

    // console.log('bookRef: ', bookRef);
    // history.goBack();
    history.push('/my/library');
  };

  // setting the book data to the different states based on the book selected
  const handleBookSelect = (book) => {
    setAuthorData(book.volumeInfo.authors.join(', '));
    setTitleData(book.volumeInfo.title);
    setAuthor(book.volumeInfo.authors);
    setTitle(book.volumeInfo.title);
    setDescription(book.volumeInfo.description);
    setPublisher(book.volumeInfo.publisher);
    setPages(book.volumeInfo.pageCount);
    setReleaseDate(book.volumeInfo.publishedDate);
    setCategory(book.volumeInfo.categories);
    setEdition(book.volumeInfo.edition);
    setThumbnailUrl(book.volumeInfo.imageLinks?.thumbnail);
    setLanguage(book.volumeInfo.language);
    setPurchaseDate(book.volumeInfo.purchaseDate);
    setShowModal(false);
    setBookSelected(true);

    const isbn13Obj = book.volumeInfo.industryIdentifiers?.find(
      (identifier: any) => identifier.type === 'ISBN_13'
    );
    if (isbn13Obj) {
      setIsbnData(isbn13Obj.identifier);
    }
  };

  // const handleRatingChange = (newRating) => {
  //   setRating(newRating);
  // };

  // const uploadPhoto = async (photo: string) => {
  //   if (!currentUser) {
  //     throw new Error('User is not authenticated');
  //   }
  //   try {
  //     const response = await fetch(photo);

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch the image');
  //     }

  //     const blob = await response.blob();
  //     const fileType = blob.type.split('/')[1];

  //     const storageRef = firebase.storage().ref();
  //     const photoRef = storageRef.child(`bookImages/${uuidv4()}.${fileType}`);

  //     const snapshot = await photoRef.put(blob);
  //     const url = await snapshot.ref.getDownloadURL();
  //     console.log('url: ', url);
  //     return url;
  //   } catch (error) {
  //     console.error('Failed to upload the image: ', error);
  //     throw error;
  //   }
  // };
  const handlePurchaseDateChange = (e: CustomEvent) => {
    setSelectedPurchaseDate(e.detail.value);
    setShowPurchaseDatePopover({ isOpen: false, event: undefined });
  };

  const handleReleaseDateChange = (e: CustomEvent) => {
    setSelectedReleaseDate(e.detail.value);
    setShowReleaseDatePopover({ isOpen: false, event: undefined });
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Add a Book</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <div className='thumbnail-container-addBook'>
          {bookSelected ? (
            <img src={thumbnailUrl} className='full-thumbnail-addBook' />
          ) : (
            <IonIcon icon={bookSharp} className='book-icon-addBook' />
          )}
        </div>
        {/* <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IonButton
            onClick={async () => {
              console.log('Edit Image button clicked');
              try {
                await takePhoto();
                console.log('takePhoto function called');
              } catch (error) {
                console.log(
                  'Error taking photo, triggering file input click:',
                  error
                );
                document.getElementById('fileInput')?.click();
              }
            }}
            size='small'
          >
            Edit Image
          </IonButton>
        </div> */}
        {/* <input
          id='fileInput'
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = async () => {
                setUploadedPhoto(reader.result as string);
                // Convert the data URL to a blob and upload it to Firebase Storage
                const response = await fetch(reader.result as string);
                const blob = await response.blob();
                const url = await uploadPhoto(blob.toString());
                console.log('Uploaded image URL: ', url);
              };
              reader.readAsDataURL(file);
            }
          }}
        /> */}
        {/* <input
          id='fileInput'
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = async () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const blob = new Blob([arrayBuffer], { type: file.type });

                // Create a URL for the blob and set the uploadedPhoto state
                const url = URL.createObjectURL(blob);
                setUploadedPhoto(url);

                // Upload the blob to a server
                const uploadResponse = await fetch(
                  'https://your-server.com/upload',
                  {
                    method: 'POST',
                    body: blob,
                  }
                );

                if (!uploadResponse.ok) {
                  console.error(
                    'Error uploading image:',
                    uploadResponse.statusText
                  );
                }
              };
              reader.readAsArrayBuffer(file);
            }
          }}
        /> */}
        <IonItem>
          <IonInput
            label='ISBN'
            labelPlacement='stacked'
            value={isbnData}
            clearInput={true}
            onIonChange={(event) => {
              setIsbnData(event.detail.value);
            }}
          />
        </IonItem>
        <SearchResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          books={modalData}
          onBookSelect={handleBookSelect}
        />
        <IonItem>
          <IonInput
            label='Title'
            clearInput={true}
            labelPlacement='stacked'
            value={titleData}
            onIonChange={(event) => {
              setTitleData(event.detail.value);
              titleDataRef.current = event.detail.value;
            }}
          />
        </IonItem>
        <SearchResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          books={modalData}
          onBookSelect={handleBookSelect}
        />
        <IonItem>
          <IonInput
            label='Author'
            labelPlacement='stacked'
            clearInput={true}
            value={authorData}
            onIonChange={(event) => {
              setAuthorData(event.detail.value);
            }}
          />
        </IonItem>
        <SearchResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          books={modalData}
          onBookSelect={handleBookSelect}
        />
        <IonItem>
          <IonInput
            label='Location'
            labelPlacement='stacked'
            clearInput={true}
            debounce={1000}
            value={location}
            onIonChange={(event) => setLocation(event.detail.value)}
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonInput
            label='Tags'
            labelPlacement='stacked'
            clearInput={true}
            debounce={1000}
            value={tags}
            onIonInput={(event) => setTags(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position='stacked'>Purchase Date</IonLabel>
          <IonButton
            onClick={(e) =>
              setShowPurchaseDatePopover({ isOpen: true, event: e.nativeEvent })
            }
          >
            {selectedPurchaseDate
              ? new Date(selectedPurchaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Select Purchase Date'}
          </IonButton>
          <IonPopover
            isOpen={showPurchaseDatePopover.isOpen}
            event={showPurchaseDatePopover.event}
            onDidDismiss={() =>
              setShowPurchaseDatePopover({ isOpen: false, event: undefined })
            }
          >
            <IonDatetime
              value={selectedPurchaseDate}
              onIonChange={handlePurchaseDateChange}
            />
          </IonPopover>
        </IonItem>
        {/* <IonItem onClick={() => setShowPopover(true)}>
          <IonInput
            labelPlacement='stacked'
            label='Purchase Date'
            value={purchaseDate}
            // readonly
          />
          <IonLabel>{purchaseDate}</IonLabel>
        </IonItem> */}

        {/* <IonPopover
          isOpen={showPopover}
          onDidDismiss={() => setShowPopover(false)}
        >
          <IonDatetime
            presentation='date'
            value={purchaseDate || undefined}
            onIonChange={(event) => {
              console.log('event.detail.value: ', event.detail.value);
              console.log('event: ');
              const date = new Date(event.detail.value as string);
              const formattedDate = date.toDateString();
              setPurchaseDate(formattedDate);
              console.log('purchaseDate: ', formattedDate);
              setShowPopover(false);
            }}
          />
        </IonPopover> */}
        <IonAccordionGroup>
          <IonAccordion value='More'>
            <IonItem slot='header'>
              <IonLabel>Additional Information</IonLabel>
            </IonItem>
            <div slot='content'>
              <IonItem>
                <IonTextarea
                  rows={10}
                  label='Description'
                  labelPlacement='stacked'
                  debounce={1000}
                  value={description}
                  onIonChange={(event) => setDescription(event.detail.value)}
                ></IonTextarea>
              </IonItem>
              <IonItem>
                <IonInput
                  label='Genres'
                  labelPlacement='stacked'
                  debounce={1000}
                  value={categories}
                  onIonInput={(event) => setCategory(event.detail.value)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label='Pages'
                  labelPlacement='stacked'
                  debounce={1000}
                  value={pages}
                  onIonChange={(event) => setPages(event.detail.value)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position='stacked'>Release Date</IonLabel>
                <IonButton
                  onClick={(e) =>
                    setShowReleaseDatePopover({
                      isOpen: true,
                      event: e.nativeEvent,
                    })
                  }
                >
                  {releaseDate
                    ? new Date(releaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : selectedReleaseDate
                    ? new Date(selectedReleaseDate).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )
                    : 'Select Release Date'}
                </IonButton>
                <IonPopover
                  isOpen={showReleaseDatePopover.isOpen}
                  event={showReleaseDatePopover.event}
                  onDidDismiss={() =>
                    setShowReleaseDatePopover({
                      isOpen: false,
                      event: undefined,
                    })
                  }
                >
                  <IonDatetime
                    value={selectedReleaseDate}
                    onIonChange={handleReleaseDateChange}
                  />
                </IonPopover>
              </IonItem>
              {/* <IonItem onClick={() => setShowPopover(true)}>
                <IonInput
                  labelPlacement='stacked'
                  label='Release Date'
                  value={releaseDate}
                  readonly
                />
              </IonItem> */}

              {/* <IonPopover
                isOpen={showPopover}
                onDidDismiss={() => setShowPopover(false)}
              >
                <IonDatetime
                  presentation='date'
                  value={releaseDate || undefined}
                  onIonChange={(event) => {
                    const date = new Date(event.detail.value as string);
                    const formattedDate = date.toISOString().split('T')[0];
                    setReleaseDate(formattedDate);
                    setShowPopover(false);
                  }}
                />
              </IonPopover> */}
              <IonItem>
                <IonInput
                  label='Edition'
                  labelPlacement='stacked'
                  debounce={1000}
                  value={edition}
                  onIonChange={(event) => {
                    setEdition(event.detail.value);
                    editionDataRef.current = event.detail.value;
                  }}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label='Publisher'
                  labelPlacement='stacked'
                  debounce={1000}
                  value={publisher}
                  onIonChange={(event) => setPublisher(event.detail.value)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label='Languages'
                  labelPlacement='stacked'
                  debounce={1000}
                  value={languages}
                  onIonChange={(event) => setLanguage(event.detail.value)}
                />
              </IonItem>
              <IonList>
                {data?.docs?.map((author) => (
                  <IonItem key={author.key}>
                    <IonLabel>{author.name}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </div>
          </IonAccordion>
        </IonAccordionGroup>
        <IonButton expand='block' onClick={handleAddBook}>
          Add Book
        </IonButton>
      </IonContent>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message='No book was found.'
        duration={2000}
      />
    </IonPage>
  );
};

export default ManuallyAddBookPage;
