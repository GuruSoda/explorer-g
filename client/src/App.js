import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
// import 'materialize-css/dist/css/materialize.min.css';
// import Navbar from 'components/Navbar'
import ListItems from 'components/ListItems'
import Search from 'components/Search'
import Login from 'components/Login'
import keycloak from 'config/Keycloak'

const initOptions = {
  onLoad: 'check-sso',
}
// <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions} LoadingComponent={<div>Loading...</div>}>
function App() {

  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions}>

      {console.log('Location pathname:', window.location.pathname)}
      {console.log('Location:', window.location) }      

      <Router basename={window.location.pathname}>
        <div className="container">
          <Switch>
            <Route path="/" exact component={ListItems} />
            <Route path="/search" component={Search} />
            <Route path="/login" component={Login} />
            <Route component={ () => (<h1>Not Found</h1>) } />
          </Switch>
        </div>
      </Router>
    </ReactKeycloakProvider>
  );
}

export default App;
