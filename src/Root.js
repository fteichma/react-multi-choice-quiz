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
    <div>
      <Route exact path={ROUTES.APP} component={App} />
      <Route path={ROUTES.LOG_IN} component={Login} />
      <Route path={ROUTES.ADMIN} component={AdminPanel} />
    </div>
  </Router>
  )
  }
}
 
export default withAuthentication(Root);