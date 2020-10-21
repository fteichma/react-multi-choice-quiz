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
import Custom from './Custom';
import EmailingPage from './Emailing';

import { withFirebase } from '../Firebase';
import { AuthUserContext, withAuthorization } from '../Session';

import { compose } from 'recompose';

import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import QuestionAnswerRoundedIcon from '@material-ui/icons/QuestionAnswerRounded';
import HelpRoundedIcon from '@material-ui/icons/HelpRounded';
import FormatPaintRoundedIcon from '@material-ui/icons/FormatPaintRounded';
import EmailRoundedIcon from '@material-ui/icons/EmailRounded';

const AdminPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
    <Admin />
)}
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
    minWidth: 200,
    borderRight: `2px solid ${theme.palette.divider}`,
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
    fontSize: 15
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
        tab : 0,
        totUsers : 0,
        totQuest: 0,
        loading: false,
    };
}
componentDidMount() {
  this.setState({
    tab : localStorage.getItem('tab') ? localStorage.getItem('tab') : 0,
  })
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
  handleChange = (e, newValue) => {
    this.setState({tab:newValue});
    localStorage.setItem('tab',newValue);
  };
  getDb() {
    let db = this.props.firebase.db;
    let responsesRef = db.ref("responses");
    let questionsRef = db.ref("questions");
    responsesRef.on('value',(snap)=>{
      let data = snap.val();
      if(data) {
      this.setState({
        totUsers : Object.keys(data).length
      })
      } else {
        this.setState({
          totUsers : 0,
        })
      }
    })
    questionsRef.on('value',(snap)=>{
      let data = snap.val();
      if(data) {
      this.setState({
        totQuest : Object.keys(data).length
      })
      } else {
        this.setState({
          totQuest : 0,
        })
      }
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
        value={Number(this.state.tab)}
        onChange={this.handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}>
        <Tab icon={<DashboardRoundedIcon fontSize="13" style={{marginRight:"0.5em"}}/>} label="Dashboard" {...a11yProps(0)} className={classes.tab} />
        <Tab icon={<QuestionAnswerRoundedIcon fontSize="13" style={{marginRight:"0.5em"}}/>}  label="Réponses" {...a11yProps(1)} className={classes.tab}/>
        <Tab icon={<HelpRoundedIcon fontSize="13" style={{marginRight:"0.5em"}}/>} label="Questions" {...a11yProps(2)} className={classes.tab}/>
        <Tab icon={<FormatPaintRoundedIcon fontSize="13" style={{marginRight:"0.5em"}}/>} label="Personnalisation" {...a11yProps(3)} className={classes.tab}/>
        <Tab icon={<EmailRoundedIcon fontSize="13" style={{marginRight:"0.5em"}}/>} label="Emailing" {...a11yProps(4)} className={classes.tab}/>
        {/* <Tab label="Mon compte" {...a11yProps(4)} className={classes.tab}/> */}
      </Tabs>
      <TabPanel value={Number(this.state.tab)} index={0}>
        {loading ? <Loading /> : <Dashboard totUsers={this.state.totUsers} totQuest={this.state.totQuest} />}
      </TabPanel>
      <TabPanel value={Number(this.state.tab)} index={1}>
      <h1>Réponses</h1>
        {loading ? <Loading /> : <Responses answers={this.state.answers} /> }
      </TabPanel>
      <TabPanel value={Number(this.state.tab)} index={2}>
      {loading ? <Loading /> : <Questions questions={this.state.questions}/>}
      </TabPanel>
      <TabPanel value={Number(this.state.tab)} index={3}>
      {loading ? <Loading /> : <Custom />}
      </TabPanel>
      <TabPanel value={Number(this.state.tab)} index={4}>
      {loading ? <Loading /> : <EmailingPage tab={this.state.tab} />}
      </TabPanel>
      {/* <TabPanel value={tab} index={4}>
        <h1>Mon compte</h1>
        <Button
             variant="contained"
             color="primary"
             style={{ textTransform: "none" }}>
            Se déconnecter
           </Button>
      </TabPanel> */}
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