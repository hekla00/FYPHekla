import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export const requestPermissions = async () => {
  const { camera } = await BarcodeScanner.requestPermissions();
  return camera === 'granted' || camera === 'limited';
};

export const scan = async () => {
  console.log('scan function called');
  const granted = await requestPermissions();
  if (!granted) {
    return;
  }
  const result = await BarcodeScanner.scan();
  for (const barcode of result.barcodes) {
    if (barcode.format === 'EAN_13' && barcode.rawValue.length === 13) {
      return barcode.rawValue;
    }
  }
  return null;
};
