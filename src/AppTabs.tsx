import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonLabel,
} from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import {
  library as LibraryIcon,
  home as HomeIcon,
  add as AddIcon,
  search as SearchIcon,
  apps as MoreIcon,
} from 'ionicons/icons';
import React from 'react';
// Importing pages
import Home from './pages/Home';
import Library from './pages/Library';
import BookPage from './pages/BookPage';
import { useAuth } from './authentication';
import SettingsPage from './pages/SettingsPage';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import ManuallyAddBookPage from './pages/ManuallyAddBookPage';
import LoanBorrowTrackingPage from './pages/LoanBorrowTracking';
import LoanBorrowTracking from './pages/LoanBorrowTracking';

setupIonicReact();

const AppTabs: React.FC = () => {
  // Assiging the loggedIn value from the authContext to the loggedIn variable
  // calling the useAuth hook
  const { loggedIn } = useAuth();
  // If the user is not logged in, redirect to the login page
  if (!loggedIn) {
    return <Redirect to='/login' />;
  }
  return (
    <IonTabs>
      {/* By using IonRouterOutlet there will be animations when
      the user navigates between pages */}
      <IonRouterOutlet>
        {/* Setting the routes for the tabs */}
        {/* my is used in front for pages that only authenticated users can access */}
        <Route path='/my/home' exact={true} component={Home} />
        <Route path='/my/library' component={Library} exact={true} />
        <Route path='/my/books/view/:id' component={BookPage} exact={true} />
        <Route
          path='/my/books/add'
          component={ManuallyAddBookPage}
          exact={true}
        />
        <Route path='/my/settings' component={SettingsPage} exact={true} />
        <Route
          path='/my/bookTracking'
          component={LoanBorrowTracking}
          exact={true}
        />
        <Route exact path='/' render={() => <Redirect to='/my/home' />} />
      </IonRouterOutlet>
      {/* Setting the tab bar at the bottom of the page */}
      {/* Setting the tabs */}
      <IonTabBar slot='bottom'>
        <IonTabButton tab='home' href='/my/home'>
          {/* Setting the type of icon and the label under the icons */}
          <IonIcon icon={HomeIcon} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab='library' href='/my/library'>
          <IonIcon icon={LibraryIcon} />
          <IonLabel>Library</IonLabel>
        </IonTabButton>
        {/* TODO */}
        <IonTabButton tab='add' href='/my/books/add'>
          <IonIcon icon={AddIcon} />
          <IonLabel>Add</IonLabel>
        </IonTabButton>
        <IonTabButton tab='' href=''>
          <IonIcon icon={SearchIcon} />
          <IonLabel>Search</IonLabel>
        </IonTabButton>
        <IonTabButton tab='SettingsPage' href='/my/settings'>
          <IonIcon icon={MoreIcon} />
          <IonLabel>More</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
export default AppTabs;
