import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
 
import App from './components/App';
import Login from './components/Login';
import AdminPanel from './components/Admin';
 
import * as ROUTES from './constants/routes';
import { withAuthentication } from './components/Session';
 
class Root extends React.Component {
  constructor(props){
    super();
  }
  render() {
  return(
  <Router>
      <Route exact path={ROUTES.QUIZ} component={App} />
      <Route path={ROUTES.LOG_IN} component={Login} />
      <Route path={ROUTES.ADMIN} component={AdminPanel} />
  </Router>
  )
  }
}
 
export default withAuthentication(Root);