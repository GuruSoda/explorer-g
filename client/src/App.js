import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

// import 'materialize-css/dist/css/materialize.min.css';
// import Navbar from 'components/Navbar'
import ListItems from 'components/ListItems'
import Search from 'components/Search'

function App() {

  return (
      <div className="container">
        <ListItems/>
      </div>
/*
    <Router>
      <div className="container">
        <Switch>
          <Route path="/" exact component={ListItems} />
          <Route path="/search" component={Search} />
          <Route component={ () => (<h1>Not Found</h1>) } />
        </Switch>
      </div>
    </Router>
*/
  );
}

export default App;
