// BarcodeScannerPage.tsx
import { IonPage } from '@ionic/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { scan } from '../components/BarcodeScanner';

const BarcodeScannerPage: React.FC = () => {
  const history = useHistory();

  const handleScan = async () => {
    const scannedIsbn = await scan();
    console.log('Scanned ISBN:', scannedIsbn);
    if (scannedIsbn) {
      history.push({
        pathname: '/my/books/add',
        state: { isbn: scannedIsbn },
      });
    }
  };

  return (
    <IonPage>
      <button onClick={handleScan}>Scan a book</button>
    </IonPage>
  );
};

export default BarcodeScannerPage;
