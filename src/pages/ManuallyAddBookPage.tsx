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
  IonThumbnail,
  IonDatetime,
  IonPopover,
  IonAccordionGroup,
  IonAccordion,
  IonToast,
  IonActionSheet,
} from '@ionic/react';
import { search } from 'ionicons/icons';
import { Camera, CameraResultType } from '@capacitor/camera';
import React, { useState, useRef, useEffect } from 'react';
import { firestore } from '../firebase';
import { useAuth } from '../authentication';
import { useHistory, useLocation } from 'react-router';
import firebase from 'firebase/app';
import SearchResultModal from '../components/SearchResultModal';
import { add as AddIcon, bookSharp, star, starOutline } from 'ionicons/icons';
import './ManuallyAddBookPage.css';
import { v4 as uuidv4 } from 'uuid';
// import CategoriesModal from '../components/CategoriesModal';
import { isPlatform } from '@ionic/react';

const ManuallyAddBookPage: React.FC = () => {
  const { userID } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [data, setData] = useState(null);
  const [isbnData, setIsbnData] = useState('');
  const [titleData, setTitleData] = useState('');
  const [authorData, setAuthorData] = useState('');
  const history = useHistory();
  const [location, setLocation] = useState('');
  const [categories, setCategory] = useState([]);
  const [tags, setTags] = useState('');
  const [languages, setLanguage] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [review, setReview] = useState('');
  const [pages, setPages] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [edition, setEdition] = useState('');
  const [notes, setNotes] = useState('');
  const isbnDataRef = useRef('');
  const titleDataRef = useRef('');
  const authorDataRef = useRef('');
  const editionDataRef = useRef<string | null>(null);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = firebase.auth().currentUser;
  const [newCategory, setNewCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bookSelected, setBookSelected] = useState(false);
  const [rating, setRating] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [authorInput, setAuthorInput] = useState('');
  const [key, setKey] = useState(0);
  const locationData = useLocation<{ isbn: string | null }>();
  const isbn = locationData.state?.isbn;

  useEffect(() => {
    if (locationData.state?.isbn) {
      handleISBNSearch(locationData.state.isbn);
    }
  }, [location]);

  const handleAddBook = async () => {
    const booksRef = firestore.collection('books');
    const newBookRef = {
      title: titleData || title || '',
      author: authorData || author || authorDataRef.current || '',
      location: location || '',
      categories: categories || [],
      tags: tags || [],
      languages: languages || [],
      publisher: publisher || '',
      description: description || '',
      review: review || '',
      pages: pages || 0,
      releaseDate: releaseDate || null,
      purchaseDate: purchaseDate || null,
      edition: edition || '',
      notes: notes || '',
      rating: rating || 0,
      isbn: isbnData || isbn || isbnDataRef.current || '',
    };
    const bookRef = await booksRef.add(newBookRef);
    // Clearing the fields
    // setTitle('');
    // setAuthor('');
    // setLocation('');
    // setCategory([]);
    // setTags('');
    // setLanguage('');
    // setPublisher('');
    // setDescription('');
    // setReview('');
    // setPages('0');
    // setReleaseDate(null);
    // setPurchaseDate(null);
    // setEdition('');
    // setNotes('');
    // setRating(0);

    const userID = firebase.auth().currentUser?.uid;
    console.log('userID book: ', userID);
    if (!userID) {
      console.error('No user is currently logged in.');
      return;
    }
    console.log('bookRef1: ', bookRef);

    if (!bookRef || !bookRef.id) {
      console.error(
        'bookRef is not a document reference or bookRef.id is undefined.'
      );
      return;
    }

    const newUserBooksRef = {
      userID,
      bookID: bookRef.id,
    };
    // write function that adds the books to the userBooks collection for the current user
    const userBooksRefa = firestore.collection('userBooks');
    const userBookRefb = await userBooksRefa.add(newUserBooksRef);
    // firebase.firestore().collection('userBooks').add(userBooksRef);

    console.log('bookRef: ', bookRef);
    // history.goBack();
    history.push('/my/library');
  };

  const handleISBNSearch = async (isbn) => {
    console.log('isbn1: ', isbn);
    setShowModal(false);
    // Setting loading to true when the search starts
    setIsLoading(true);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn+${encodeURIComponent(
        isbn
      )}`
    );
    const data = await response.json();

    // Setting loading to false when the search ends
    setIsLoading(false);
    setData(data);
    console.log('data: ', data);
    console.log('isbn: ', isbn);
    // check if author is found in the data and assign the author to the author state
    if (data?.isbnData) {
      setIsbnData(data.isbn);
    }

    const books = data.items.map((item) => item.volumeInfo);
    console.log('books: ', books);
    setBooks(books);
    if (data.items.length === 1) {
      const book = data.items[0].volumeInfo;
      console.log('book: ', book);
      setTitle(book.title);
      setAuthor(book.authors);
      setDescription(book.description);
      setPublisher(book.publisher);
      setPages(book.pageCount);
      setReleaseDate(book.publishedDate);
      setCategory(book.categories);
      setThumbnailUrl(book.imageLinks?.thumbnail);
      setShowModal(false);
      setBookSelected(true);
      setLanguage(book.language);
      setIsbnData(book.isbn);
    } else if (data.items.length > 1) {
      // inject data into modal
      setModalData(data.items);
      // show model to select book
      setShowModal(true);
    } else {
      // If no book is found, show a message to the user
      // create a toast message to show the user that no book was found
      setShowToast(true);
    }
  };

  // setting the book data to the different states based on the book selected
  const handleBookSelect = (book) => {
    setAuthorData(book.volumeInfo.authors[0]);
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
    setShowModal(false);
    setBookSelected(true);

    const isbn13Obj = book.volumeInfo.industryIdentifiers?.find(
      (identifier: any) => identifier.type === 'ISBN_13'
    );
    if (isbn13Obj) {
      setIsbnData(isbn13Obj.identifier);
    }
  };

  const handleAddCategory = (newCategory) => {
    if (newCategory.trim() !== '') {
      setCategory((prevCategories) => [...prevCategories, newCategory]);
      console.log('categories: ', [...categories, newCategory]);
      setNewCategory(''); // Clear the input field
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setCategory(categories.filter((category) => category !== categoryToRemove));
  };

  useEffect(() => {
    console.log('categories2: ', categories);
  }, [categories]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };
  // Handler for title search
  const handleTitleSearch = async (title) => {
    console.log('title1: ', title);
    setShowModal(false);
    // Setting loading to true when the search starts
    setIsLoading(true);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn+${encodeURIComponent(
        title
      )}`
    );
    const data = await response.json();

    // Setting loading to false when the search ends
    setIsLoading(false);
    setData(data);
    console.log('data: ', data);
    console.log('title: ', title);
    // check if author is found in the data and assign the author to the author state
    if (data?.titleData) {
      setIsbnData(data.title);
    }

    const books = data.items.map((item) => item.volumeInfo);
    console.log('books: ', books);
    setBooks(books);
    if (data.items.length === 1) {
      const book = data.items[0].volumeInfo;
      console.log('book: ', book);
      setTitle(book.title);
      setAuthor(book.authors);
      setDescription(book.description);
      setPublisher(book.publisher);
      setPages(book.pageCount);
      setReleaseDate(book.publishedDate);
      setCategory(book.categories);
      setThumbnailUrl(book.imageLinks?.thumbnail);
      setShowModal(false);
      setBookSelected(true);
      setLanguage(book.language);
    } else if (data.items.length > 1) {
      // inject data into modal
      setModalData(data.items);
      // show model to select book
      setShowModal(true);
    } else {
      // If no book is found, show a message to the user
      // create a toast message to show the user that no book was found
      setShowToast(true);
    }
  };

  // Handler for author search
  const handleAuthorSearch = async (author) => {
    console.log('author1: ', author);
    setShowModal(false);
    // Setting loading to true when the search starts
    setIsLoading(true);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn+${encodeURIComponent(
        author
      )}`
    );
    const data = await response.json();

    // Setting loading to false when the search ends
    setIsLoading(false);
    setData(data);
    console.log('data: ', data);
    console.log('author: ', author);
    // check if author is found in the data and assign the author to the author state
    if (data?.authorData) {
      setIsbnData(data.author);
    }

    const books = data.items.map((item) => item.volumeInfo);
    console.log('books: ', books);
    setBooks(books);
    if (data.items.length === 1) {
      const book = data.items[0].volumeInfo;
      console.log('book: ', book);
      setTitle(book.title);
      setAuthor(book.authors);
      setDescription(book.description);
      setPublisher(book.publisher);
      setPages(book.pageCount);
      setReleaseDate(book.publishedDate);
      setCategory(book.categories);
      setThumbnailUrl(book.imageLinks?.thumbnail);
      setShowModal(false);
      setBookSelected(true);
      setLanguage(book.language);
    } else if (data.items.length > 1) {
      // inject data into modal
      setModalData(data.items);
      // show model to select book
      setShowModal(true);
    } else {
      // If no book is found, show a message to the user
      // create a toast message to show the user that no book was found
      setShowToast(true);
    }
  };

  const uploadPhoto = async (photo: string) => {
    if (!currentUser) {
      throw new Error('User is not authenticated');
    }
    try {
      const response = await fetch(photo);

      if (!response.ok) {
        throw new Error('Failed to fetch the image');
      }

      const blob = await response.blob();
      const fileType = blob.type.split('/')[1];

      const storageRef = firebase.storage().ref();
      const photoRef = storageRef.child(`bookImages/${uuidv4()}.${fileType}`);

      const snapshot = await photoRef.put(blob);
      const url = await snapshot.ref.getDownloadURL();
      console.log('url: ', url);
      return url;
    } catch (error) {
      console.error('Failed to upload the image: ', error);
      throw error;
    }
  };

  // const handleToggleChange = (categoryId: string, isChecked: boolean) => {
  //   setCategories((prevCategories) =>
  //     prevCategories.map((category) =>
  //       category.id === categoryId
  //         ? { ...category, selected: isChecked }
  //         : category
  //     )
  //   );
  // };

  const takePhoto = async () => {
    const image = await Camera.getPhoto({
      // quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });

    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // used to read the file as data, or upload it using the fetch API.
    console.log(image.webPath);
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
        <div className='thumbnail-container'>
          {uploadedPhoto ? (
            <img src={uploadedPhoto} className='full-thumbnail' />
          ) : bookSelected ? (
            <img src={thumbnailUrl} className='full-thumbnail' />
          ) : (
            <IonIcon icon={bookSharp} className='book-icon' />
          )}
        </div>
        <div
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
        </div>
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
        <input
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
        />
        <div className='rating-container'>
          {[1, 2, 3, 4, 5].map((starNumber) => (
            <IonIcon
              key={starNumber}
              icon={starNumber <= rating ? star : starOutline}
              onClick={() => handleRatingChange(starNumber)}
              className='rating-star'
            />
          ))}
        </div>
        <IonItem>
          <IonInput
            label='ISBN'
            labelPlacement='stacked'
            value={isbnData}
            clearInput={true}
            onIonChange={(event) => {
              setIsbnData(event.detail.value);
              // isbnDataRef.current = event.detail.value;
            }}
          />
          {isbnData && (
            <IonButton slot='end' onClick={() => handleISBNSearch(isbnData)}>
              <IonIcon icon={search} />
            </IonButton>
          )}
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
          {titleData && (
            <IonButton slot='end' onClick={() => handleTitleSearch(titleData)}>
              <IonIcon icon={search} />
            </IonButton>
          )}
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
              // authorDataRef.current = event.detail.value;
            }}
          />
          {authorData && (
            <IonButton
              slot='end'
              onClick={() => handleAuthorSearch(authorData)}
            >
              <IonIcon icon={search} />
            </IonButton>
          )}
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
          <IonTextarea
            rows={4}
            label='Review'
            labelPlacement='stacked'
            debounce={1000}
            value={review}
            onIonChange={(event) => setReview(event.detail.value)}
          ></IonTextarea>
        </IonItem>
        <IonItem>
          <IonInput
            label='Tags'
            labelPlacement='stacked'
            clearInput={true}
            debounce={1000}
            value={tags}
            onIonChange={(event) => setTags(event.detail.value)}
          />
        </IonItem>
        <IonItem onClick={() => setShowPopover(true)}>
          <IonInput
            labelPlacement='stacked'
            label='Purchase Date'
            value={purchaseDate}
            readonly
          />
        </IonItem>

        <IonPopover
          isOpen={showPopover}
          onDidDismiss={() => setShowPopover(false)}
        >
          <IonDatetime
            presentation='date'
            value={purchaseDate || undefined}
            onIonChange={(event) => {
              const date = new Date(event.detail.value as string);
              const formattedDate = date.toISOString().split('T')[0];
              setPurchaseDate(formattedDate);
              setShowPopover(false);
            }}
          />
        </IonPopover>
        <IonItem>
          <IonTextarea
            rows={4}
            label='Private Notes'
            labelPlacement='stacked'
            debounce={1000}
            value={notes}
            onIonChange={(event) => setNotes(event.detail.value)}
          ></IonTextarea>
        </IonItem>
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
              {/* <IonItem>
          <IonInput
            label='Categories'
            labelPlacement='stacked'
            debounce={1000}
            value={categories}
            onIonChange={(event) => setCategory(event.detail.value)}
          />
        </IonItem> */}
              <IonItem>
                <IonInput
                  label='Categories'
                  labelPlacement='stacked'
                  clearInput={true}
                  // debounce={1000}
                  value={newCategory}
                  onIonChange={(event) => setNewCategory(event.detail.value)}
                  // onIonBlur={() => handleAddCategory(newCategory)}
                />
                {/* <IonButton
                  slot='end'
                  onClick={() => {
                    handleAddCategory(newCategory);
                    // setShowModal(true);
                  }}
                >
                  <IonIcon icon={AddIcon} />
                </IonButton> */}
              </IonItem>
              {/* <IonList>
                {categories.map((category, index) => (
                  <IonItem key={index}>
                    <IonLabel>{category}</IonLabel>

                    <IonButton
                      // style={{ color: 'red' }}
                      onClick={() => handleRemoveCategory(category)}
                    >
                      Remove
                    </IonButton>
                  </IonItem>
                ))}
              </IonList> */}
              <IonItem>
                <IonInput
                  label='Pages'
                  labelPlacement='stacked'
                  debounce={1000}
                  value={pages}
                  onIonChange={(event) => setPages(event.detail.value)}
                />
              </IonItem>
              <IonItem onClick={() => setShowPopover(true)}>
                <IonInput
                  labelPlacement='stacked'
                  label='Release Date'
                  value={releaseDate}
                  readonly
                />
              </IonItem>

              <IonPopover
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
              </IonPopover>
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
