import { Camera, CameraResultType } from '@capacitor/camera';
const takePhoto = async () => {
  const image = await Camera.getPhoto({
    // quality: 50,
    allowEditing: false,
    resultType: CameraResultType.Uri,
  });

  // image.webPath will contain a path that can be set as an image src.
  // You can access the original file using image.path, which can be
  // used to read the file as data, or upload it using the fetch API.
  console.log(image.webPath);
};

export default takePhoto;
