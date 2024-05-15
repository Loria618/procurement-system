import React, { useState } from 'react';
import SupplierDetails from './SupplierDetails';
import { useTable } from 'react-table';
import db from './db';
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

function SupplierInfo() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [supplierName, setSupplierName] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [items, setItems] = useState([]);

  const [redirectToSupplierDetails, setRedirectToSupplierDetails] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);

  const handleAddItem = () => {
    console.log('Adding item: ', itemName, 'price: ', itemPrice);
    if (!itemName || !itemPrice) {
      setOpenAddItemDialog(true);
    } else {
      setItems([...items, { name: itemName, price: itemPrice }]);
      setItemName('');
      setItemPrice('');
    }
  };  

  const columns = React.useMemo(
    () => [
      {
        Header: '商品名称',
        accessor: 'name',
      },
      {
        Header: '单价',
        accessor: 'price',
      },
    ],
    []
  );

  const data = React.useMemo(() => items, [items]);

  const tableInstance = useTable({ columns, data });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  const isAllItemsValie = items.every((item) => item.name && item.price);

  const handleDeleteItem = (index) => {
    console.log('Deleting item: ', index)
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };  

  const handleSaveAttempt = async () => {
    try {
        const existingSupplier = await db.suppliers.get({name: supplierName}); // check if the supplier name already exists in the database
        if (!name) {
          setOpenConfirmDialog(true); // show a dialog to confirm the supplier name is not empty
        } else if (existingSupplier) {
          setOpenConfirmDialog(true); // show a dialog to confirm the supplier name is not duplicate
        } else if (!items.length || !isAllItemsValie) {
          setOpenConfirmDialog(true)
        } else {
          saveSupplierInfo(); // save the supplier info if all conditions are met
        }
      } catch (error) {
        console.error('error when checking for existing supplier:', error);
    }
  };

  const saveSupplierInfo = async () => {
    try {
      await db.suppliers.add({ name, note, items });
      setOpenSuccessDialog(true); // show a success dialog after saving the supplier info
    } catch (error) {
      console.error('error when saving supplier info:', error);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccessDialog(false); // close the success dialog
    window.location.reload(); // reload the page
  };

  const handleContinueAdding = () => {
    setOpenConfirmDialog(false); // close the confirm dialog and continue adding
  };

  const handleEditExisting = () => {
    setOpenConfirmDialog(false);
    setRedirectToSupplierDetails(true); // redirect to the supplier details page
    setSupplierName(name)
  };

  if (redirectToSupplierDetails) {
    return <SupplierDetails supplier={{ name: supplierName }} />;
  };

  return (
    <div>
      <h2>新建供应商</h2>
      <div>
        <label>供应商名称：</label>
        <input type="text" className="company-name-box" placeholder="请输入供应商名称（必填）" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>供应商备注：</label>
        <textarea className="notes-box" placeholder="请输入供应商备注（可选）" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div>
        <label>商品名称：</label>
        <input className="item-name-box" type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} />
        <label>单价：</label>
        <input className="item-price-box" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
        <Button
          className="add-item-btn"
          component="label"
          tabIndex={-1}
          onClick={handleAddItem}
          startIcon={<AddShoppingCartIcon />}
        >
          添加商品
        </Button>
        <Dialog
          open={openAddItemDialog}
          onClose={() => setOpenAddItemDialog(false)}
          aria-labelledby="alert-dialog-add-item-title"
          aria-describedby="alert-dialog-add-item-description"
        >
          <DialogTitle id="alert-dialog-add-item-title">{"商品名称和单价不可留空"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-add-item-description">
              请输入商品名称和单价。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={() => setOpenAddItemDialog(false)} autoFocus>好的</Button>
          </DialogActions>
        </Dialog>
      </div>
      <table {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                        <th>Actions</th> {/* Add an Actions header for the delete button column */}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, index) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            ))}
                            <td>
                                <Button 
                                    className="delete-btn"
                                    startIcon={<DeleteIcon />} 
                                    onClick={() => handleDeleteItem(index)}
                                >
                                    删除
                                </Button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>

      <Button onClick={handleSaveAttempt}>保存供应商信息</Button>

      <Dialog open={openSuccessDialog} onClose={handleCloseSuccess}>
        <DialogTitle>{"保存成功"}</DialogTitle>
        <DialogContent>
          <DialogContentText>已成功保存供应商信息。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccess} autoFocus>好的</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          {(!name) ? (
          <React.Fragment>
            <DialogTitle>{"未填入供应商名称"}</DialogTitle>
            <DialogContent>
              <DialogContentText>请填入供应商名称。</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleContinueAdding}>好的</Button>
            </DialogActions>
          </React.Fragment>
            ) : (isAllItemsValie) ? (
                <React.Fragment>
                  <DialogTitle>{"商品名称和单价不可留空"}</DialogTitle>
                  <DialogContent>
                    <DialogContentText>请输入商品名称和单价。</DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleContinueAdding}>好的</Button>
                  </DialogActions>
                </React.Fragment>
            ) : (
          <React.Fragment>
            <DialogTitle>{`已存在“${name}”`}</DialogTitle>
            <DialogContent>
              <DialogContentText>{`前往编辑“${name}”的信息还是继续添加其他供应商？`}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditExisting} autoFocus>{`前往${name}详情页面进行编辑`}</Button>
              <Button onClick={handleContinueAdding}>继续添加其他供应商</Button>
            </DialogActions>
          </React.Fragment>
          )}
      </Dialog>
    </div>
  );
}

export default SupplierInfo;
