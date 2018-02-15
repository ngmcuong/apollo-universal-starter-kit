/* eslint-disable react/display-name */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withFormik } from 'formik';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Table, Button, Popconfirm, Form, FormItem, Row, Col } from '../web';
import { createColumnFields, createFormFields } from '../../util';

function dragDirection(dragIndex, hoverIndex, initialClientOffset, clientOffset, sourceClientOffset) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

let BodyRow = props => {
  const {
    isOver,
    connectDragSource,
    connectDropTarget,
    moveRow,
    dragRow,
    clientOffset,
    sourceClientOffset,
    initialClientOffset,
    ...restProps
  } = props;
  const style = { cursor: 'move' };

  let className = restProps.className;
  if (isOver && initialClientOffset) {
    const direction = dragDirection(
      dragRow.index,
      restProps.index,
      initialClientOffset,
      clientOffset,
      sourceClientOffset
    );
    if (direction === 'downward') {
      className += ' drop-over-downward';
    }
    if (direction === 'upward') {
      className += ' drop-over-upward';
    }
  }

  return connectDragSource(connectDropTarget(<tr {...restProps} className={className} style={style} />));
};

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index
    };
  }
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

BodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset()
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset()
  }))(BodyRow)
);

class ListView extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    data: PropTypes.object,
    orderBy: PropTypes.object,
    onOrderBy: PropTypes.func.isRequired,
    updateEntry: PropTypes.func.isRequired,
    deleteEntry: PropTypes.func.isRequired,
    sortEntries: PropTypes.func.isRequired,
    deleteManyEntries: PropTypes.func.isRequired,
    updateManyEntries: PropTypes.func.isRequired,
    loadMoreRows: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    link: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    customTableColumns: PropTypes.object
  };

  state = {
    selectedRowKeys: [],
    loading: false
  };

  components = {
    body: {
      row: BodyRow
    }
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { data, sortEntries } = this.props;
    const dragRow = data.edges[dragIndex];
    const dragReplace = data.edges[hoverIndex];

    sortEntries([dragRow.id, dragReplace.id, dragReplace.rank, dragRow.rank]);
  };

  renderLoadMore = (data, loadMoreRows) => {
    if (data.pageInfo.hasNextPage) {
      return (
        <Button id="load-more" color="primary" onClick={loadMoreRows}>
          Load more ...
        </Button>
      );
    }
  };

  renderOrderByArrow = name => {
    const { orderBy } = this.props;

    if (orderBy && orderBy.column === name) {
      if (orderBy.order === 'desc') {
        return <span className="badge badge-primary">&#8595;</span>;
      } else {
        return <span className="badge badge-primary">&#8593;</span>;
      }
    } else {
      return <span className="badge badge-secondary">&#8645;</span>;
    }
  };

  hendleUpdate = (data, id) => {
    const { updateEntry } = this.props;
    updateEntry(data, { id });
  };

  hendleDelete = id => {
    const { deleteEntry } = this.props;
    deleteEntry({ id });
  };

  onCellChange = (key, id, updateEntry) => {
    return value => {
      updateEntry({ [key]: value }, id);
    };
  };

  hendleDeleteMany = () => {
    const { deleteManyEntries } = this.props;
    const { selectedRowKeys } = this.state;
    deleteManyEntries({ id_in: selectedRowKeys });
    this.setState({ selectedRowKeys: [] });
  };

  hendleUpdateMany = values => {
    const { updateManyEntries } = this.props;
    const { selectedRowKeys } = this.state;
    updateManyEntries(values, { id_in: selectedRowKeys });
    this.setState({ selectedRowKeys: [] });
  };

  orderBy = (e, name) => {
    const { onOrderBy, orderBy } = this.props;

    e.preventDefault();

    let order = 'asc';
    if (orderBy && orderBy.column === name) {
      if (orderBy.order === 'asc') {
        order = 'desc';
      } else if (orderBy.order === 'desc') {
        return onOrderBy({});
      }
    }

    return onOrderBy({ column: name, order });
  };

  rowSelection = {
    onChange: selectedRowKeys => {
      this.setState({ selectedRowKeys });
    }
  };

  render() {
    const { loading, data, loadMoreRows, schema, link, handleChange, handleSubmit, customTableColumns } = this.props;
    const { selectedRowKeys } = this.state;
    const hasSelected = selectedRowKeys.length > 0;

    const title = () => {
      return (
        <Link to={`/${link}/0`}>
          <Button color="primary">Add</Button>
        </Link>
      );
    };

    const footer = () => {
      return (
        <Row>
          <Col span={1}>
            {data && (
              <div>
                <div>
                  <small>
                    ({data.edges ? data.edges.length : 0} / {data.pageInfo.totalCount})
                  </small>
                </div>
                <div>
                  <small>{hasSelected ? `(${selectedRowKeys.length} selected)` : ''}</small>
                </div>
              </div>
            )}
          </Col>
          <Col span={2}>
            <Popconfirm title="Sure to delete?" onConfirm={this.hendleDeleteMany}>
              <Button color="primary" disabled={!hasSelected} loading={loading && !data}>
                Delete
              </Button>
            </Popconfirm>
          </Col>
          <Col span={21}>
            <Form layout="inline" name="post" onSubmit={handleSubmit}>
              {createFormFields(handleChange, schema, {}, null, '', true)}
              {/*error && <Alert color="error">{error}</Alert>*/}
              <FormItem>
                <Button color="primary" type="submit" disabled={!hasSelected} loading={loading && !data}>
                  Update
                </Button>
              </FormItem>
            </Form>
          </Col>
        </Row>
      );
    };

    const columns = createColumnFields(
      schema,
      link,
      this.orderBy,
      this.renderOrderByArrow,
      this.hendleUpdate,
      this.hendleDelete,
      this.onCellChange,
      customTableColumns
    );

    let tableProps = {
      dataSource: data ? data.edges : null,
      columns: columns,
      agination: false,
      size: 'small',
      rowSelection: this.rowSelection,
      loading: loading && !data,
      title: title,
      footer: footer
    };

    // only include this props if table includes rank, taht is used for sorting
    if (schema.keys().includes('rank')) {
      tableProps = {
        ...tableProps,
        components: this.components,
        onRow: (record, index) => ({
          index,
          moveRow: this.moveRow
        })
      };
    }

    return (
      <div>
        {React.createElement(Table, tableProps, null)}
        {data && this.renderLoadMore(data, loadMoreRows)}
      </div>
    );
  }
}

const ListViewWithFormik = withFormik({
  async handleSubmit(values, { resetForm, props: { onSubmit } }) {
    await onSubmit(values);
    resetForm();
  }
});

export default ListViewWithFormik(DragDropContext(HTML5Backend)(ListView));
