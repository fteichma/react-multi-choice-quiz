import React from "react";
import { createMuiTheme, withStyles } from "@material-ui/core/styles";
import { Paper, Box } from "@material-ui/core";

const styles = (theme) => ({
  paper: {
    padding: "1.5em 2em",
    width: 240,
    minWidth: 175,
    marginRight: "1em",
    marginBottom: "1em",
  },
});

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#0072AB",
    },
    secondary: {
      main: "#64b5f6",
    },
  },
});

class Dashboard extends React.Component {
  render() {
    const { classes, totUsers, totQuest, totEmail } = this.props;
    return (
      <>
        <h2>Dashboard</h2>
        <Box display="flex" justifyContent="flex-start" alignItems="flex-start">
          <Paper elevation={3} className={classes.paper}>
            <h2
              style={{
                fontSize: 18,
                padding: 0,
                margin: 0,
              }}
            >
              Tot. utilisateurs
            </h2>
            <p
              style={{
                fontSize: 40,
                padding: 0,
                margin: "0.2em 0 0",
                fontWeight: 400,
                color: theme.palette.primary.main,
              }}
            >
              {totUsers ?? 0}
            </p>
          </Paper>
          <Paper elevation={3} className={classes.paper}>
            <h2
              style={{
                fontSize: 18,
                padding: 0,
                margin: 0,
              }}
            >
              Tot. questionnaires
            </h2>
            <p
              style={{
                fontSize: 40,
                padding: 0,
                margin: "0.2em 0 0",
                fontWeight: 400,
                color: theme.palette.primary.main,
              }}
            >
              {totQuest ?? 0}
            </p>
          </Paper>
          <Paper elevation={3} className={classes.paper}>
            <h2
              style={{
                fontSize: 18,
                padding: 0,
                margin: 0,
              }}
            >
              Tot. emailing
            </h2>
            <p
              style={{
                fontSize: 40,
                padding: 0,
                margin: "0.2em 0 0",
                fontWeight: 400,
                color: theme.palette.primary.main,
              }}
            >
              {totEmail ?? 0}
            </p>
          </Paper>
        </Box>
      </>
    );
  }
}

export default withStyles(styles)(Dashboard);
