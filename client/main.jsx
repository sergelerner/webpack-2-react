import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { Route } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import './styles/style.scss';

const root = document.createElement('root');
document.body.appendChild(root);

const history = createBrowserHistory();

class App extends Component {
  render() {
    return (
      <main>
        <h1>Hello World!!!</h1>
      </main>
    );
  }
}

ReactDOM.render(
  <Router history={history}>
    <Route path="/" component={App} />
  </Router>
  ,
  root,
);
