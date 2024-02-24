import { IonFabButton, IonIcon, IonAlert } from '@ionic/react';
import { exit } from 'ionicons/icons';
import { firestore } from '../firebase';
import firebase from 'firebase/app';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const LeaveGroup = ({ groupId }) => {
  const currentUser = firebase.auth().currentUser;
  const [showAlert, setShowAlert] = useState(false);
  const history = useHistory();

  const leaveGroup = async () => {
    // Fetch the current group data from Firestore
    const groupRef = firestore.collection('groups').doc(groupId);
    const groupSnapshot = await groupRef.get();
    const groupData = groupSnapshot.data();

    if (groupData && groupData.members) {
      // Remove the current user's ID from the group's members array
      const newMembers = groupData.members.filter(
        (memberId) => memberId !== currentUser.uid
      );

      // Update the group data in Firestore
      await groupRef.update({ members: newMembers });

      // Redirect to the Create Group page
      history.push('/my/groupcreation');
    } else {
      console.log('Group data does not exist or group has no members');
    }
  };

  return (
    <>
      <IonFabButton onClick={() => setShowAlert(true)}>
        <IonIcon icon={exit} />
      </IonFabButton>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={'Confirm'}
        message={'Do you really want to leave this group?'}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              setShowAlert(false);
            },
          },
          {
            text: 'Yes',
            handler: () => {
              leaveGroup();
            },
          },
        ]}
      />
    </>
  );
};

export default LeaveGroup;
