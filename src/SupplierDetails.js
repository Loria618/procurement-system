import React, { useState, useEffect } from 'react';
import db from './db';
// procurement template
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
// collapsible template
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// styling
import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';

function createData(name, price) {
  return { name, price };
}

function SupplierDetails({ supplier }) {

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    if (!itemName || !itemPrice) {
      setOpenAddItemDialog(true);
    } else {
      console.log('Adding item: ', itemName, 'price: ', itemPrice);
      const newItem = createData(itemName, parseFloat(itemPrice));
      setItems([...items, newItem]);
      setItemName('');
      setItemPrice('');
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // const handleSaveItems = async () => {
  //   try {
  //     const procurementTemplate = items.map(item => [item.name, item.price]);
  //     await db.suppliers.update(supplier.name, { templates: procurementTemplate });
  //     alert("Template saved successfully!");
  //   } catch (error) {
  //     console.error("Failed to save template:", error);
  //     alert("Error saving template.");
  //   }
  // };

  return (
    <div>
      <h2>{supplier.name}进货模板</h2>
      <p>{supplier.note}</p>
      <div>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField type="text" className="item-input" label="商品名称" variant="outlined" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          <TextField type="number" className="item-input" label="商品单价" variant="outlined" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
        </Box>
        <Button className="add-item-btn" tabIndex={-1} onClick={handleAddItem} startIcon={<AddShoppingCartIcon />}>添加商品</Button>
        <Dialog open={openAddItemDialog} onClose={() => setOpenAddItemDialog(false)}>
          <DialogTitle>{"商品名称和单价不可留空"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              请输入商品名称和单价。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={() => setOpenAddItemDialog(false)} autoFocus>好的</Button>
          </DialogActions>
        </Dialog>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="item table">
            <TableHead>
              <TableRow>
                <TableCell>商品名称</TableCell>
                <TableCell align="right">商品价格</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {item.name}
                  </TableCell>
                  <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Button className='delete-btn' onClick={() => handleDeleteItem(index)} startIcon={<DeleteIcon />} color="error">删除商品</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <Button onClick={handleSaveItems} startIcon={<SaveIcon />}>为{supplier.name}保存模板</Button> */}
      </div>
    </div>
  );
}

export default SupplierDetails;