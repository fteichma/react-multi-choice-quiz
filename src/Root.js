import React from 'react';
import { Route, Switch } from 'react-router-dom';
 
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
  <Switch>
      <Route exact path={ROUTES.QUIZ} component={App} />
      <Route path={ROUTES.LOG_IN} component={Login} />
      <Route path={ROUTES.ADMIN} component={AdminPanel} />
  </Switch>
  )
  }
}
 
export default withAuthentication(Root);