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
import { useParams } from "react-router";
import { dummyBooks } from "../dummydata";

const BookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const book = dummyBooks.find((book) => book.id === id);
  if (!book) {
    throw new Error(`No book found with id ${id}`);
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{book.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">Author: {book.author}</IonContent>
    </IonPage>
  );
};

export default BookPage;
