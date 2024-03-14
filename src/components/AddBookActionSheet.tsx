import { IonActionSheet } from '@ionic/react';
import React from 'react';

interface AddBookActionSheetProps {
  isOpen: boolean;
  onButtonClick: (path: string) => void;
  onDidDismiss: () => void;
}

const AddBookActionSheet: React.FC<AddBookActionSheetProps> = ({
  isOpen,
  onButtonClick,
  onDidDismiss,
}) => {
  return (
    <IonActionSheet
      isOpen={isOpen}
      onDidDismiss={onDidDismiss}
      buttons={[
        {
          text: 'Manually Insert',
          handler: () => onButtonClick('/my/books/add'),
        },
        {
          text: 'Search',
          handler: () => onButtonClick('/my/search'),
        },
        {
          text: 'Barcode Scanner',
          handler: () => onButtonClick('/my/barcodeScanner'),
        },
      ]}
    />
  );
};

export default AddBookActionSheet;
