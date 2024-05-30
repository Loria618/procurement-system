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

dayjs.extend(customParseFormat);

function Row(props) {
  const { row, handleOpenDeleteDialog, showDeleteButton, allOpen, setAllOpen } = props;
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(allOpen);
  }, [allOpen]);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.supplierName}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'normal', wordWrap: 'break-word', minWidth: '43px' }}>{row.orderContents.length}</TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'normal', wordWrap: 'break-word', minWidth: '35px' }}>
          {row.orderContents.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.createTime}</TableCell>
        <TableCell align="right" sx={{ padding: '0' }}>
          {showDeleteButton && (
            <Button
              className='delete-btn'
              onClick={() => handleOpenDeleteDialog(row.uuid)}
              startIcon={<DeleteIcon />}
              color="error"
            >
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
                    <TableCell sx={{ width: '40%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>商品名称</TableCell>
                    <TableCell align="right" sx={{ width: '20%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>商品价格</TableCell>
                    <TableCell align="right" sx={{ width: '20%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>商品数量</TableCell>
                    <TableCell align="right" sx={{ width: '20%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>商品总价</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.orderContents.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row" sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                        {item.name}
                      </TableCell>
                      <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell align="left"><strong>订单总价</strong></TableCell>
                    <TableCell align="right"><strong>{row.orderContents.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)}</strong></TableCell>
                    <TableCell colSpan={2} />
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
  showDeleteButton: PropTypes.bool.isRequired,
  allOpen: PropTypes.bool.isRequired,
  setAllOpen: PropTypes.func.isRequired,
};

export default function CollapsibleOrder({ orders = [], handleOpenDeleteDialog, showDeleteButton = true }) {
  const [allOpen, setAllOpen] = React.useState(false);

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = dayjs(a.createTime, 'YY-MM-DD HH:mm:ss');
    const dateB = dayjs(b.createTime, 'YY-MM-DD HH:mm:ss');
    return dateB.valueOf() - dateA.valueOf();
  });

  return (
    <>
      <TableContainer component={Paper} className="table-container">
        <Table aria-label="collapsible order">
          <TableHead>
            <TableRow>
              <TableCell>
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => {
                    setAllOpen(!allOpen);
                  }}
                >
                  {allOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </TableCell>
              <TableCell>供货商</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'normal', textAlign: 'center' }}>
                <span style={{ display: 'block' }}>订单</span>
                <span style={{ display: 'block' }}>商品数</span>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'normal', textAlign: 'center' }}>
                <span style={{ display: 'block' }}>订单</span>
                <span style={{ display: 'block' }}>总价</span>
              </TableCell>
              <TableCell align="right">创建时间</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.map((order, index) => (
              <Row key={index} row={order} handleOpenDeleteDialog={handleOpenDeleteDialog} showDeleteButton={showDeleteButton} allOpen={allOpen} setAllOpen={setAllOpen} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
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
  showDeleteButton: PropTypes.bool,
};