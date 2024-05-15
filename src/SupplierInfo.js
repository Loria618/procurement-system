import React, { useState } from 'react';
import SupplierDetails from './SupplierDetails';
import db from './db';
// styling
import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

function SupplierInfo() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [redirectToSupplierDetails, setRedirectToSupplierDetails] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false); // set the state for the success dialog
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // set the state for the confirm dialog

  const handleCheckSupplierName = async () => {
    console.log('Checking supplier name...');
    try {
      const existingSupplier = await db.suppliers.get(name); // check if the supplier name already exists
      if (!name) {
        setOpenConfirmDialog(true); // show the confirm dialog if the supplier name is empty
      } else if (existingSupplier) {
        setOpenConfirmDialog(true); // show the confirm dialog if the supplier name already exists
      } else {
        saveSupplierInfo(); // save the supplier info
      }
    } catch (error) {
      console.error('Error in checking supplier name: ', error);
    }
  };

  const saveSupplierInfo = async () => {
    console.log('Saving supplier info...');
    try {
      await db.suppliers.add({ name, note });
      setOpenSuccessDialog(true); // show the success dialog after saving the supplier info
    } catch (error) {
      console.error('Error in saving supplier information: ', error);
    }
  };

  const handleCloseSuccess = () => {
    console.log('Closing success dialog...');
    setOpenSuccessDialog(false); // close the success dialog
    window.location.reload(); // reload the whole webpage
  };

  const handleContinueAdding = () => {
    console.log('Continuing to add...');
    setOpenConfirmDialog(false); // close the sucess dialog and continue adding
  };

  const handleEditExisting = () => {
    console.log('Editing existing supplier...');
    setOpenConfirmDialog(false);
    setRedirectToSupplierDetails(true); // redirect to the supplier details page
    setSupplierName(name)
  };

  if (redirectToSupplierDetails) {
    return <SupplierDetails supplier={{ name: supplierName }} />;
  };

  const showDialog = () => {
    console.log('Showing dialog...');
    if (openSuccessDialog) {
      console.log('Success dialog is open: Supplier info saved.');
      return (
        <Dialog open={openSuccessDialog} onClose={handleCloseSuccess}>
          <DialogTitle>{"保存成功"}</DialogTitle>
          <DialogContent>
            <DialogContentText>已成功保存供应商信息。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={handleEditExisting} autoFocus>{`前往${name}详情页面进行编辑`}</Button>
            <Button className="confirm-btn" onClick={handleCloseSuccess}>确认并返回</Button>
          </DialogActions>
        </Dialog>
      );
    } else if (!name) {
      console.log('Confirm dialog is open: Supplier name is empty.');
      return (
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>{"未填入供应商名称"}</DialogTitle>
          <DialogContent>
            <DialogContentText>请填入供应商名称。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={handleContinueAdding}>好的</Button>
          </DialogActions>
        </Dialog>
      );
    } else {
      console.log('Confirm dialog is open: Supplier already exists.');
      return (
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>{`已存在“${name}”`}</DialogTitle>
          <DialogContent>
            <DialogContentText>{`前往编辑“${name}”的信息还是继续添加其他供应商？`}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={handleEditExisting} autoFocus>{`前往${name}详情页面进行编辑`}</Button>
            <Button className="cancel-btn" onClick={handleContinueAdding}>继续添加其他供应商</Button>
          </DialogActions>
        </Dialog>
      );
    }
  };

  return (
    <div>
      <div>
        {openSuccessDialog ? (showDialog()) : null}
        {openConfirmDialog ? (showDialog()) : null}
      </div>

      <div>
        <h2>新建供应商</h2>
        <div>
          <label>供应商名称：</label>
          <input type="text" className="company-name-box" placeholder="请输入供应商名称（必填）" value={name} onChange={(e) => setName(e.target.value)} autoFocus/>
        </div>
        <div>
          <label>供应商备注：</label>
          <textarea className="notes-box" placeholder="请输入供应商备注（可选）" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button className="save-btn" onClick={handleCheckSupplierName}>保存供应商信息</Button>
      </div>
    </div>
  );
};

export default SupplierInfo;