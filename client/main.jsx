import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

const root = document.createElement('root');
document.body.appendChild(root);

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
  <Router history={browserHistory}>
    <Route path="/" component={App} />
  </Router>
  ,
  root
);
