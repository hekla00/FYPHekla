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
} from "@ionic/react";
import React, { useState } from "react";
import { firestore } from "../firebase";
import { useAuth } from "../authentication";
import { useHistory } from "react-router";

const ManuallyAddBookPage: React.FC = () => {
  const { userID } = useAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const history = useHistory();

  const handleAddBook = async () => {
    const booksRef = firestore
      .collection("users")
      .doc(userID)
      .collection("books");
    const newBookRef = { title, author };
    const bookRef = await booksRef.add(newBookRef);
    console.log("bookRef: ", bookRef);
    history.goBack();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Add Book</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonInput
            label="Title"
            labelPlacement="stacked"
            value={title}
            onIonChange={(event) => setTitle(event.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Author"
            labelPlacement="stacked"
            value={author}
            onIonChange={(event) => setAuthor(event.detail.value)}
          />
        </IonItem>
        <IonButton expand="block" onClick={handleAddBook}>
          Add Book
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ManuallyAddBookPage;
