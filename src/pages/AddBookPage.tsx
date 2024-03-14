import { IonPage } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AddBookActionSheet from '../components/AddBookActionSheet';
import { scan } from '../components/BarcodeScanner';

const AddBookPage: React.FC = () => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [isbn, setIsbn] = useState<string | null>(null);
  const history = useHistory();
  const location = useLocation();

  const handleButtonClick = async (path: string) => {
    if (path === '/my/barcodeScanner') {
      const scannedIsbn = await scan();
      setIsbn(scannedIsbn);
      console.log('Scanned ISBN:', scannedIsbn);
      if (scannedIsbn) {
        history.push({
          pathname: '/my/books/add',
          state: { isbn: scannedIsbn },
        });
      }
    } else if (path === '/my/add') {
      if (!isbn) {
        history.push('/my/books/add');
      } else {
        setShowActionSheet(true);
      }
    } else {
      history.push(path);
      setShowActionSheet(false);
    }
  };

  useEffect(() => {
    setShowActionSheet(location.pathname === '/my/add');
  }, [location]);

  return (
    <IonPage>
      <AddBookActionSheet
        isOpen={showActionSheet}
        onButtonClick={handleButtonClick}
        onDidDismiss={() => {
          setShowActionSheet(false);
          //   history.goBack();
          if (location.pathname === '/my/add') {
            history.push('/my/home');
          }
        }}
      />
    </IonPage>
  );
};

export default AddBookPage;
