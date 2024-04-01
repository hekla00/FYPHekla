import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonItem,
  IonInput,
} from '@ionic/react';
import { useParams, useHistory, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import { Book, toBook } from '../models';

const EditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [book, setBook] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const db = firebase.firestore();
  const location = useLocation<{ book: Book }>();
  const bookFromLocation = location.state.book;
  const [isbnData, setIsbnData] = useState('');
  // add more state variables for other fields

  useEffect(() => {
    const fetchBook = async () => {
      const bookDoc = await db.collection('books').doc(id).get();
      const bookData = bookDoc.data();
      setBook(bookData);
      setTitle(bookData.title);
      setAuthor(bookData.author);
      // set other fields
    };

    fetchBook();
  }, [id]);

  const handleSave = async () => {
    await db.collection('books').doc(id).update({
      title,
      author,
      // update other fields
    });
    history.push('/'); // redirect to home page after saving
  };

  if (!book) return 'Loading...';

  return (
    <IonPage>
      <IonHeader className='header-padding-text'>
        <IonButtons className='button-padding' slot='start'>
          <IonBackButton />
        </IonButtons>
      </IonHeader>
      <IonContent>
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
      </IonContent>
    </IonPage>

    // <div>
    //   <input value={title} onChange={(e) => setTitle(e.target.value)} />
    //   <input value={author} onChange={(e) => setAuthor(e.target.value)} />
    //   {/* add more input fields for other fields */}
    //   <button onClick={handleSave}>Save</button>
    // </div>
  );
};

export default EditPage;
