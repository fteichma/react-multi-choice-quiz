import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { withRouter } from 'react-router-dom';
import {
  Box,
  withStyles,
  Button,
  Tab,
  Tabs, 
  Container,
} from "@material-ui/core";

import Questions from './Questions';
import Responses from './Responses';
import Dashboard from './Dashboard';
import Loading from '../Loading';

import { withFirebase } from '../Firebase';
import { AuthUserContext, withAuthorization } from '../Session';

import { compose } from 'recompose';

const AdminPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
  <div>
    <Admin />
  </div>)}
  </AuthUserContext.Consumer>
)

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    display: 'flex',
    minHeight: "100vh",
    overflowY : "auto",
    textTransform:"none",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: "#051E34",
    color:"#eee",
    "& .MuiTab-wrapper": {
        flexDirection: "row",
        justifyContent: "flex-start",
        padding : "0.2em 0.5em"
      },
      "& .Mui-selected": {
        background: "#64b5f60d",
        border:"none",
        color:"#64b5f6"
      }
  },
  tab: {
    textTransform:"none",
    textAlign:"left",
    fontSize: 13
  }
})

const theme = createMuiTheme({
  palette:{
    primary:{
      main: "#0072AB",
    },
    secondary:{
      main : "#64b5f6"
    }
  }
}
)

function TabPanel(props) {
  const {children, value, index, classes, ...other} = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          className={"tabpanel"}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
      >
          {value === index && (
              <Container style={{padding:"0 25px", width:"100%"}}>
                  <Box>
                      {children}
                  </Box>
              </Container>
          )}
      </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

class AdminBase extends Component {
  constructor(props) {
    super();
    this.state = {
        value : 0,
        totUsers : 0,
        totQuest: 0,
        loading: false,
    };
}
componentDidMount() {
  //LOCALHOST SPEED
/*   if(localStorage.getItem("answers")) {
    this.setState({
      totUsers: JSON.parse(localStorage.getItem("totUsers")),
      answers : JSON.parse(localStorage.getItem("answers")),
      loading: false,
      questions: JSON.parse(localStorage.getItem("questions")),
      totQuest : JSON.parse(localStorage.getItem("totQuest"))
    })
  }
  else {
    this.getDb();
  } */
  this.getDb();
}
componentWillUnmount() {
  this.props.firebase.users().off();
}
  handleChange = (event, newValue) => {
    this.setState({value:newValue});
  };
  /* getDb() {
    const answers = db.collection("answers");
    answers
    .orderBy('createdAt','desc')
      .onSnapshot((docSnapshot) => {
          let data = docSnapshot.docs.map(doc => doc.data())
          if(data) {
            this.setState({
              totUsers: docSnapshot.docs.length,
              answers : data,
              loading: false,
            })
            localStorage.setItem("totUsers", docSnapshot.docs.length);
            localStorage.setItem("answers", JSON.stringify(data));
          }
      }, err => {
          console.log("Error getting documents: ", err);
      })
      const questions = db.collection("questions");
      questions
      .orderBy('createdAt')
      .get()
      .then((querySnapshot) => {
      let data = querySnapshot.docs.map(doc => doc.data());
      if(data) {
        data.map(doc => console.log(doc.length))
        this.setState({
          totQuest : querySnapshot.docs.length,
          questions: data
        })
      }
      localStorage.setItem("totQuest", querySnapshot.docs.length);
      localStorage.setItem("questions", JSON.stringify(data));
    });
    
  } */
  getDb() {
    let db = this.props.firebase.db;
    let responsesRef = db.ref("responses");
    responsesRef.on('value',(snap)=>{
      let data = snap.val();
      this.setState({
        answers : Object.keys(data).map(i => data[i]),
        totUsers : Object.keys(data).length
      })
      console.log(this.state.answers);
    });
  }
  render() {
    const { classes } = this.props;
    const {loading} = this.state;
  return (
    <MuiThemeProvider theme={theme}>
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={this.state.value}
        onChange={this.handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >
        <Tab label="Dashboard" {...a11yProps(0)} className={classes.tab} />
        <Tab label="Réponses" {...a11yProps(1)} className={classes.tab}/>
        <Tab label="Questions" {...a11yProps(2)} className={classes.tab}/>
        <Tab label="Conditions" {...a11yProps(3)} className={classes.tab}/>
        <Tab label="Personnalisation" {...a11yProps(4)} className={classes.tab}/>
        <Tab label="Mon compte" {...a11yProps(5)} className={classes.tab}/>
      </Tabs>
      <TabPanel value={this.state.value} index={0}>
        {loading ? <Loading /> : <Dashboard totUsers={this.state.totUsers} totQuest={this.state.totQuest} />}
      </TabPanel>
      <TabPanel value={this.state.value} index={1}>
      <h1>Réponses</h1>
        {loading ? <Loading /> : <Responses answers={this.state.answers} /> }
      </TabPanel>
      <TabPanel value={this.state.value} index={2}>
      {loading ? <Loading /> : <Questions questions={this.state.questions}/>}
      </TabPanel>
      <TabPanel value={this.state.value} index={3}>
      <h1>Conditions</h1>
      </TabPanel>
      <TabPanel value={this.state.value} index={4}>
      <h1>Personnalisation</h1>
      </TabPanel>
      <TabPanel value={this.state.value} index={5}>
        <h1>Mon compte</h1>
        <Button
             variant="contained"
             color="primary"
             style={{ textTransform: "none" }}>
            Se déconnecter
           </Button>
      </TabPanel>
    </div>
    </MuiThemeProvider>
  );
      }
}

const condition = authUser => !!authUser;

const Admin = compose(
  withRouter,
  withFirebase,
  withStyles(styles),
  withAuthorization(condition)
)(AdminBase);

export default AdminPage

export {Admin}