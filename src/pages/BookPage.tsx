import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Home.css";
import { useParams, useRouteMatch } from "react-router";
// import { dummyBooks } from "../dummydata";
import { firestore } from "../firebase";
import { useEffect, useState } from "react";
import { Book, toBook } from "../models";
import { useAuth } from "../authentication";
interface RouteParams {
  id: string;
}

const BookPage: React.FC = () => {
  const { userID } = useAuth();
  const match = useRouteMatch<RouteParams>();
  const { id } = match.params;
  const [book, setBook] = useState<Book>();

  useEffect(() => {
    const bookRef = firestore
      .collection("users")
      .doc(userID)
      .collection("books")
      .doc(id);
    bookRef.get().then((doc) =>
      // set the book state to the fetched book
      // toBook is a function that takes a doc and returns a book with its data
      setBook(toBook(doc))
    );
  }, [userID, id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{book?.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">Author: {book?.author}</IonContent>
    </IonPage>
  );
};

export default BookPage;
