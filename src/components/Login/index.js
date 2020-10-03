import React from "react";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import {
  Box,
  withStyles,
  TextField,
  Button,
} from "@material-ui/core";

import { ToastContainer } from 'react-toastify';
/* import Notify from "../../notify"; */

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

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email : "",
            password : ""
        };
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }
    handleEmailChange = (e) => {
        this.setState({
            email : e.target.value
        })
    }

    handlePasswordChange = (e) => {
      this.setState({
          password : e.target.value
      })
  }
  /* login = (e) => {
      e.preventDefault();
      const {email, password} = this.state;
        auth.signInWithEmailAndPassword(email,password).then(
          (result) => {
            localStorage.setItem('log',result);
            this.props.history.push("/admin");
          }
        ).catch((error) => {
          Notify(error.message, "error");
        })
    }; */
  render() {
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.container}>
          <Box
            borderRadius={15}
            className={classes.paper}
            width={500}
            bgcolor="#fff"
          >
            <form onSubmit={this.login} autoComplete="yes">
              <TextField
                id="email"
                name="email"
                label="Adresse email"
                className="mb-4"
                onChange={this.handleEmailChange}
                value={this.state.email}
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
                onChange={this.handlePasswordChange}
                value={this.state.password}
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

export default withStyles(styles)(Login);