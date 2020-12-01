import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import TablePagination from "@material-ui/core/TablePagination";

import { withFirebase } from "../Firebase";
import { compose } from "recompose";

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  tableRow: {
    "& > *": {
      borderBottom: "unset",
    },
  },
  table: {
    minWidth: 750,
  },
  bold: {
    fontWeight: 600,
  },
});

class ResponsesBase extends React.Component {
  constructor(props) {
    super();
    this.state = {
      open: {},
      page: 0,
      rowsPerPage: 10,
      loading: true,
      answers: [],
    };
  }
  componentDidMount() {
    this.getResponses();
  }
  handleChangePage = (e, newPage) => {
    this.setState({
      page: newPage,
    });
  };
  handleChangeRowsPerPage = (e) => {
    this.setState({
      rowsPerPage: e.target.value,
    });
  };
  setOpen = (key) => {
    this.setState({
      open: { ...this.state.open, [key]: this.state.open[key] ? false : true },
    });
  };
  getResponses() {
    let db = this.props.firebase.db;
    let responsesRef = db.ref("responses");
    responsesRef
      .orderByChild("createdAt")
      .once("value")
      .then((snap) => {
        let data = snap.val();
        if (data) {
          let answers = Object.keys(data).map((i) => data[i]);
          this.setState({
            answers: answers.reverse(),
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      });
  }
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page, answers } = this.state;
    return (
      <Paper className={classes.root}>
        <TableContainer>
          <Table aria-label="collapsible table" className={classes.table}>
            <TableHead className={classes.thead}>
              <TableRow>
                <TableCell />
                <TableCell>Email</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {answers
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, key) => (
                  <React.Fragment key={key}>
                    <TableRow className={classes.tableRow}>
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => this.setOpen(key)}
                        >
                          {this.state.open[key] ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {Object.keys(row.answers)
                          .filter(
                            (el) => row.answers[el.toString()].type === "email"
                          )
                          .map((el) => row.answers[el.toString()].value)}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.date}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse
                          in={this.state.open[key]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box margin={1}>
                            <Table size="small" aria-label="purchases">
                              <TableBody>
                                {Object.keys(row.answers).map((el, key) => {
                                  return (
                                    <TableRow key={key + "_answers"}>
                                      <TableCell component="th" scope="row">
                                        {row.answers[el.toString()].question}
                                      </TableCell>
                                      <TableCell align="right">
                                        {row.answers[el.toString()].value}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={answers?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

const ResponsesPage = () => <Responses />;

const Responses = compose(withFirebase, withStyles(styles))(ResponsesBase);

export default ResponsesPage;

export { Responses };
