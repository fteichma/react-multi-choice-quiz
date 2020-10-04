import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import {
  Box,
  withStyles,
  TextField,
  Button,
} from "@material-ui/core";
import { ToastContainer } from 'react-toastify';
import Notify from "../../notify";

const LogInPage = () => (
  <div>
    <LogInForm />
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  error: '',
};

const styles = (theme) => ({
  paper: {
    padding: 50,
    boxShadow: "none",
    [theme.breakpoints.up("sm")]: {
      boxShadow: "0 10px 20px rgba(0,0,0,.2)",
    },
  },
  logo: {
    marginBottom: 25,
  },
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbfbfb",
  },
});

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#0072AB",
    },
  },
});

class LogInFormBase extends Component {
    constructor(props) {
        super();
        this.state = { ...INITIAL_STATE };
        this.handleChange = this.handleChange.bind(this);    
    }
    handleChange = (event) => {
      const { target: { name, value } } = event
      this.setState({ [name]: value })
    }
    onSubmit = event => {
      const { email, password } = this.state;
   
      this.props.firebase
        .doSignInWithEmailAndPassword(email, password)
        .then(() => {
          this.setState({ ...INITIAL_STATE });
          this.props.history.push(ROUTES.ADMIN);
        })
        .catch(error => {
          Notify(error.message, "error");   
        });
   
      event.preventDefault();
    };
  render() {
    const { classes } = this.props;
    const { email, password } = this.state;
    const isInvalid = password === "" || email === '';
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.container}>
          <Box
            borderRadius={15}
            className={classes.paper}
            width={500}
            bgcolor="#fff"
          >
            <form onSubmit={this.onSubmit} autoComplete="yes">
              <TextField
                id="email"
                name="email"
                label="Adresse email"
                className="mb-4"
                onChange={this.handleChange}
                value={email || ''}
                type="email"
                fullWidth
                required
                variant="outlined"
                size="small"
                style={{
                  marginBottom:30
                }}
              />
              <TextField
                id="password"
                name="password"
                label="Mot de passe"
                className="mb-4"
                onChange={this.handleChange}
                value={password || ''}
                type="password"
                fullWidth
                required
                variant="outlined"
                size="small"
                style={{
                  marginBottom:30
                }}
              />
              <Button
             /* onClick={this.login} */
             variant="contained"
             color="primary"
             fullWidth
             style={{ textTransform: "none" }}
             type="submit"
             disabled={isInvalid}
           >
            Se connecter
           </Button>
            </form>
          </Box>
        </div>
        <ToastContainer />
      </MuiThemeProvider>
    );
  }
}

const LogInForm = compose(
  withRouter,
  withFirebase,
  withStyles(styles)
)(LogInFormBase);

export default LogInPage;

export {LogInForm}