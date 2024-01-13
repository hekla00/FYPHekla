import { IonApp, IonLoading, setupIonicReact } from "@ionic/react";
import { Route, Redirect, Switch } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import React from "react";
// Importing pages
import LoginPage from "./pages/LoginPage";
import AppTabs from "./AppTabs";
import { authContext, useAuthInit } from "./authentication";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";

setupIonicReact();

const App: React.FC = () => {
  const { loading, auth } = useAuthInit();
  console.log("auth: ", auth);

  if (loading) {
    return <IonLoading isOpen />;
  }
  return (
    <IonApp>
      {/* Making the AuthContext available accross the app */}
      <authContext.Provider value={auth}>
        <IonReactRouter>
          {/* Swith always renders a single route even if there
          are multiple rautes that match the requested path */}
          <Switch>
            <Route exact path="/login">
              <LoginPage />
            </Route>
            <Route exact path="/register">
              <RegisterPage />
            </Route>
            {/* path prop is set to "/my" and thus when the URL
            matches it will return/render the AppTabs component */}
            <Route path="/my">
              <AppTabs />
            </Route>
            <Redirect exact path="/" to="/my/home" />
            {/* Route that does not specify a path 
            So if no route matches the paths above the NotFoundPage 
            will be rendered*/}
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </IonReactRouter>
      </authContext.Provider>
    </IonApp>
  );
};
export default App;
