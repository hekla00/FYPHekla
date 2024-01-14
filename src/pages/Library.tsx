import {
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Library.css";
// import { dummyBooks } from "../dummydata";
import { firestore } from "../firebase";
import { useEffect, useState } from "react";
import { Book, toBook } from "../models";
import { useAuth } from "../authentication";

const Library: React.FC = () => {
  const { userID } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  // fetch books from firestore
  useEffect(() => {
    // reference to the Books collection and the user's books
    const bookRef = firestore
      .collection("users")
      .doc(userID)
      .collection("books");
    // retrieve the data from the Books collection
    bookRef.get().then(({ docs }) =>
      // map the data to the book object
      // set the books state to the mapped data
      setBooks(docs.map(toBook))
    );
  }, [userID]);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Library</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {books.map((book) => (
            <IonItem
              button
              key={book.id}
              routerLink={`/my/books/view/${book.id}`}
            >
              {book.title}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Library;
