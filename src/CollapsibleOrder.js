import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with customParseFormat plugin
dayjs.extend(customParseFormat);

function Row(props) {
  const { row, handleDeleteOrder, showDeleteButton } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.supplierName}
        </TableCell>
        <TableCell align="right">{row.createTime}</TableCell>
        <TableCell align="right">{row.orderContents.length}</TableCell>
        <TableCell align="right">
          {row.orderContents.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)}
        </TableCell>
        <TableCell align="right">
          {showDeleteButton && (
            <Button
              className='delete-btn'
              onClick={() => handleDeleteOrder(row.uuid)}
              startIcon={<DeleteIcon />}
              color="error"
            >
              删除订单
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                订单详情
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>商品名称</TableCell>
                    <TableCell align="right">商品价格</TableCell>
                    <TableCell align="right">商品数量</TableCell>
                    <TableCell align="right">商品总价</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.orderContents.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {item.name}
                      </TableCell>
                      <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right"><strong>订单总价</strong></TableCell>
                    <TableCell align="right"><strong>{row.orderContents.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    orderContents: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired,
        totalPrice: PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    supplierName: PropTypes.string.isRequired,
    createTime: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
  }).isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  showDeleteButton: PropTypes.bool.isRequired,
};

export default function CollapsibleOrder({ orders = [], handleDeleteOrder, showDeleteButton = true }) {
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = dayjs(a.createTime, 'YY-MM-DD HH:mm:ss');
    const dateB = dayjs(b.createTime, 'YY-MM-DD HH:mm:ss');
    return dateB.valueOf() - dateA.valueOf();
  });

  return (
    <TableContainer component={Paper} className="table-container">
      <Table aria-label="collapsible order">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>供货商</TableCell>
            <TableCell align="right">创建时间</TableCell>
            <TableCell align="right">订单商品数</TableCell>
            <TableCell align="right">订单总价</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedOrders.map((order, index) => (
            <Row key={index} row={order} handleDeleteOrder={handleDeleteOrder} showDeleteButton={showDeleteButton} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CollapsibleOrder.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      orderContents: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired,
          quantity: PropTypes.number.isRequired,
          totalPrice: PropTypes.number.isRequired,
        }).isRequired
      ).isRequired,
      supplierName: PropTypes.string.isRequired,
      createTime: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  showDeleteButton: PropTypes.bool,
};
