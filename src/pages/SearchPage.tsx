import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import { bookSharp } from 'ionicons/icons';
import handleAuthorSearch from '../components/HandleAuthorSearch';
import handleTitleSearch from '../components/HandleTitleSearch';
import handleISBNSearch from '../components/HandleISBNSearch';
import { useHistory } from 'react-router-dom';
import './SearchPage.css';

export const SearchPage = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [data, setData] = useState(null);
  const [isbnData, setIsbnData] = useState('');
  const [titleData, setTitleData] = useState('');
  const [authorData, setAuthorData] = useState('');
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
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bookSelected, setBookSelected] = useState(false);
  const [rating, setRating] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const history = useHistory();

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchText(event.target.elements.search.value);
  };

  const handleBookSelect = (book) => {
    setAuthorData(book.authors.join(', '));
    setTitleData(book.title);
    setAuthor(book.authors);
    setTitle(book.title);
    setDescription(book.description);
    setPublisher(book.publisher);
    setPages(book.pageCount);
    setReleaseDate(book.publishedDate);
    setCategory((oldCategories) =>
      Array.from(
        new Set([
          ...oldCategories,
          ...(book.categories ? [book.categories] : []),
        ])
      )
    );
    setEdition(book.edition);
    setThumbnailUrl(book.imageLinks?.thumbnail);
    setLanguage(book.language);
    setNotes(book.notes);
    setPurchaseDate(book.purchaseDate);
    setRating(book.rating);
    setReview(book.review);
    setShowModal(false);
    setBookSelected(book);

    const isbn13Obj = book.industryIdentifiers?.find(
      (identifier: any) => identifier.type === 'ISBN_13'
    );
    if (isbn13Obj) {
      setIsbnData(isbn13Obj.identifier);
    }
    // Sending book details of the selected book to the add book page
    if (book) {
      history.push('/my/books/add', {
        book: book,
        authorData: book.authors,
        titleData: book.title,
        author: book.authors,
        title: book.title,
        description: book.description,
        publisher: book.publisher,
        pages: book.pageCount,
        releaseDate: book.publishedDate,
        category: Array.from(new Set(book.categories)) || [],
        edition: book.edition,
        thumbnailUrl: book.imageLinks?.thumbnail,
        language: book.language,
        isbnData: isbn13Obj?.identifier,
        notes: book.notes,
        purchaseDate: book.purchaseDate,
        rating: book.rating,
        review: book.review,
      });
    }
  };
  useEffect(() => {
    let isCancelled = false;

    const search = async () => {
      let isbnResults = [];
      if (
        searchText.length === 10 ||
        (searchText.length === 13 && !isNaN(Number(searchText)))
      ) {
        // Search by ISBN
        isbnResults = await handleISBNSearch(
          searchText,
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
          setCategory((oldCategories) =>
            Array.from(new Set([...oldCategories, categories]))
          ),
          setThumbnailUrl,
          setBookSelected,
          setLanguage,
          setShowToast,
          setNotes,
          setPurchaseDate
        );
        console.log('isbnResults: ', isbnResults);
        if (!isCancelled) {
          setResults(isbnResults);
        }
      } else {
        // Search by title or author
        const titleResultsPromise = await handleTitleSearch(
          searchText,
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
          setCategory((oldCategories) =>
            Array.from(new Set([...oldCategories, categories]))
          ),
          setThumbnailUrl,
          setBookSelected,
          setLanguage,
          setNotes,
          setPurchaseDate,
          setRating
        );
        const authorResultsPromise = await handleAuthorSearch(
          searchText,
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
          setCategory((oldCategories) =>
            Array.from(
              new Set([...oldCategories, ...(categories ? [categories] : [])])
            )
          ),
          setThumbnailUrl,
          setBookSelected,
          setLanguage,
          setNotes,
          setPurchaseDate,
          setRating
        );
        const [titleResults, authorResults] = await Promise.all([
          titleResultsPromise,
          authorResultsPromise,
        ]);
        if (!isCancelled) {
          // Removing duplicate results
          const combinedResults = [...titleResults, ...authorResults];
          const uniqueResults = combinedResults.filter((result, index) => {
            const _result = JSON.stringify(result);
            return (
              index ===
              combinedResults.findIndex(
                (obj) => JSON.stringify(obj) === _result
              )
            );
          });
          setResults(uniqueResults);
        }
      }
    };
    if (searchText !== '') {
      search();
    } else {
      setResults([]);
    }

    return () => {
      isCancelled = true;
    };
  }, [searchText]);
  return (
    <IonPage>
      <IonHeader className='header-padding-text'>
        {/* <IonToolbar>
          <IonTitle>Search</IonTitle>
        </IonToolbar> */}
        <IonButtons className='button-padding' slot='start'>
          <IonBackButton />
        </IonButtons>
      </IonHeader>
      <IonContent>
        <IonSearchbar
          className='search-bar-padding'
          value={searchText}
          placeholder='Search by title, author or ISBN'
          onIonInput={(e) => setSearchText(e.detail.value!)}
        />
        <IonList>
          {results &&
            results.map((result, index) => (
              <IonItem
                key={index}
                button
                onClick={() => handleBookSelect(result)}
              >
                <IonLabel>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {result.imageLinks?.thumbnail ? (
                      <img
                        className='full-thumbnail'
                        src={result.imageLinks.thumbnail}
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
                      <h1>{result.title}</h1>
                      <p>{result.authors && result.authors.join(', ')}</p>
                    </div>
                  </div>
                </IonLabel>
              </IonItem>
            ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;
