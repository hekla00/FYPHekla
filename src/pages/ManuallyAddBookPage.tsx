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
import { useHistory } from 'react-router';
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
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleAddBook = async () => {
    const booksRef = firestore.collection('books');
    const newBookRef = {
      title,
      author,
      location,
      categories,
      tags,
      languages,
      publisher,
      description,
      review,
      pages,
      releaseDate,
      purchaseDate,
      edition,
      notes,
      rating,
    };
    const bookRef = await booksRef.add(newBookRef);

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

  // create function that calls an Restful API that has a query parameter q and returns a JSON response
  const handleAuthorSearch = async (author) => {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        author
      )}`
    );
    const data = await response.json();
    setData(data);
    console.log('data: ', data);
    console.log('author: ', author);
    // check if author is found in the data and assign the author to the author state
    if (data?.author) {
      setAuthor(data.author);
    }
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
    setTitle(book.volumeInfo.title);
    setAuthor(book.volumeInfo.authors);
    setDescription(book.volumeInfo.description);
    setPublisher(book.volumeInfo.publisher);
    setPages(book.volumeInfo.pageCount);
    setReleaseDate(book.volumeInfo.publishedDate);
    setCategory(book.volumeInfo.categories);
    setThumbnailUrl(book.volumeInfo.imageLinks?.thumbnail);
    setLanguage(book.volumeInfo.language);
    setShowModal(false);
    setBookSelected(true);
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
      const fileType = blob.type.split('/')[1]; // Extract file type from MIME type

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
        {/* <div className='thumbnail-container'>
          {bookSelected ? (
            <img src={thumbnailUrl} className='full-thumbnail' />
          ) : (
            <IonIcon icon={bookSharp} className='book-icon' />
          )}
        </div> */}
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
          {/* <IonButton
            onClick={() => {
              document.getElementById('fileInput')?.click();
            }}
            size='small'
          >
            Edit Image
          </IonButton> */}
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
            onIonChange={(event) => {
              setIsbnData(event.detail.value);
              isbnDataRef.current = event.detail.value;
            }}
          />
          <IonButton
            slot='end'
            onClick={() => handleISBNSearch(isbnDataRef.current)}
          >
            <IonIcon icon={search} />
          </IonButton>
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
            debounce={1000}
            clearInput={true}
            labelPlacement='stacked'
            value={title}
            onIonChange={(event) => setTitle(event.detail.value)}
            onIonBlur={() => console.log('onIonBlur')}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label='Author'
            labelPlacement='stacked'
            clearInput={true}
            debounce={1000}
            value={author}
            onIonChange={(event) => setAuthor(event.detail.value)}
            // onIonChange={(event) => handleAuthorSearch(event.detail.value)}
            onIonBlur={(event) => handleAuthorSearch(author)}
          />
        </IonItem>
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
                <IonButton
                  slot='end'
                  onClick={() => {
                    handleAddCategory(newCategory);
                    setShowModal(true);
                  }}
                >
                  <IonIcon icon={AddIcon} />
                </IonButton>
              </IonItem>
              <IonList>
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
              </IonList>
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
                  onIonChange={(event) => setEdition(event.detail.value)}
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
