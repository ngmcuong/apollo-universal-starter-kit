import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';
// import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
// import LastPageIcon from '@material-ui/icons/LastPage';
// import Grid from '@material-ui/core/Grid';
import { Button } from '.';

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5
  }
});

class TablePaginationActions extends React.Component {
  // handleFirstPageButtonClick = event => {
  //   this.props.onChangePage(event, 0);
  // };

  handleBackButtonClick = event => {
    console.log('handleBackButtonClick page --->', this.props.page);

    this.props.onChangePage(event, this.props.page + 1);
  };

  handleNextButtonClick = event => {
    console.log('handleNextButtonClick page --->', this.props.page);

    this.props.onChangePage(event, this.props.page + 1);
  };

  // handleLastPageButtonClick = event => {
  //   this.props.onChangePage(
  //     event,
  //     Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1)
  //   );
  // };

  render() {
    const { classes, count, page, rowsPerPage } = this.props;

    console.log('this.props.page --->', this.props.page);
    console.log('Math.ceil(count / rowsPerPage) --->', Math.ceil(count / rowsPerPage));

    return (
      <div className={classes.root}>
        {/* <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          <FirstPageIcon />
        </IconButton> */}
        <IconButton onClick={this.handleBackButtonClick} disabled={page === 0} aria-label="Previous Page">
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage)}
          aria-label="Next Page"
        >
          <KeyboardArrowRight />
        </IconButton>
        {/* <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          <LastPageIcon />
        </IconButton> */}
      </div>
    );
  }
}

TablePaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, {
  withTheme: true
})(TablePaginationActions);

export default class Pagination extends React.Component {
  state = {
    page: 0
  };
  componentDidMount() {
    console.log('componentDidMount --->', 'componentDidMount');
  }

  handleChangePage = (event, page) => {
    console.log('Pagination page --->', page);
    this.setState({ page }, this.props.handlePageChange(this.props.pagination, page + 1));
  };

  // handleChangeRowsPerPage = event => {
  //   this.setState({ rowsPerPage: event.target.value });
  // };

  render() {
    const { page } = this.state;
    console.log('STATE page --->', page);
    const {
      itemsPerPage,
      handlePageChange,
      hasNextPage,
      pagination,
      total,
      loadMoreText,
      defaultPageSize
    } = this.props;

    return (
      <Fragment>
        {pagination === 'relay' ? (
          hasNextPage ? (
            <div>
              <div>
                <small>
                  ({itemsPerPage} / {total})
                </small>
              </div>
              <Button id="load-more" color="primary" onClick={() => handlePageChange(pagination)}>
                {loadMoreText}
              </Button>
            </div>
          ) : null
        ) : (
          <TablePagination
            component="div"
            rowsPerPageOptions={[]}
            count={total}
            rowsPerPage={defaultPageSize}
            page={page}
            onChangePage={this.handleChangePage}
            // SelectProps={{
            //   native: true
            // }}
            // onChangeRowsPerPage={this.handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActionsWrapped}
          />
        )}
      </Fragment>
    );
  }
}

Pagination.propTypes = {
  itemsPerPage: PropTypes.number,
  handlePageChange: PropTypes.func,
  hasNextPage: PropTypes.bool,
  pagination: PropTypes.string,
  total: PropTypes.number,
  loadMoreText: PropTypes.string,
  defaultPageSize: PropTypes.number
};