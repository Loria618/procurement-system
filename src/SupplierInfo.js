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
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

function SupplierInfo() {
  const [supplierName, setSupplierName] = useState('');
  const [note, setNote] = useState('');
  const [redirectToSupplierDetails, setRedirectToSupplierDetails] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleCheckSupplierName = async () => {
    console.log('Checking supplier name...');
    try {
      const existingSupplier = await db.suppliers.get(supplierName); // check if the supplier name already exists
      if (!supplierName) {
        setOpenConfirmDialog(true);
      } else if (existingSupplier) {
        setOpenConfirmDialog(true);
      } else {
        saveSupplierInfo();
      }
    } catch (error) {
      console.error('Error in checking supplier name: ', error);
    }
  };

  const saveSupplierInfo = async () => {
    console.log('Saving supplier info...');
    try {
      await db.suppliers.add({ supplierName, note });
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error in saving supplier information: ', error);
    }
  };

  const handleCloseSuccess = () => {
    console.log('Closing success dialog...');
    setOpenSuccessDialog(false);
    window.location.reload();
  };

  const handleContinueAdding = () => {
    console.log('Continuing to add...');
    setOpenConfirmDialog(false);
  };

  const handleEditExisting = () => {
    console.log('Editing existing supplier...');
    setOpenConfirmDialog(false);
    setRedirectToSupplierDetails(true);
    setSupplierName(supplierName)
  };

  if (redirectToSupplierDetails) {
    return <SupplierDetails supplier={{ supplierName: supplierName }} />;
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
            <Button className="confirm-btn" onClick={handleEditExisting} autoFocus>{`前往${supplierName}详情页面进行编辑`}</Button>
            <Button className="confirm-btn" onClick={handleCloseSuccess}>确认并返回</Button>
          </DialogActions>
        </Dialog>
      );
    } else if (!supplierName) {
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
          <DialogTitle>{`已存在“${supplierName}”`}</DialogTitle>
          <DialogContent>
            <DialogContentText>{`前往编辑“${supplierName}”的信息还是继续添加其他供应商？`}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={handleEditExisting} autoFocus>{`前往${supplierName}详情页面进行编辑`}</Button>
            <Button className="cancel-btn" onClick={handleContinueAdding}>继续添加其他供应商</Button>
          </DialogActions>
        </Dialog>
      );
    }
  };

  const handleBackToMainPage = () => {
    window.location.reload();
  }

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
          <input type="text" className="company-name-box" placeholder="请输入供应商名称（必填）" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} autoFocus />
        </div>
        <div>
          <label>供应商备注：</label>
          <textarea className="notes-box" placeholder="请输入供应商备注（可选）" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button className="save-btn" onClick={handleCheckSupplierName}>保存供应商信息</Button>
      </div>
      <div>
        <Button onClick={handleBackToMainPage} startIcon={<HomeRoundedIcon />}>返回首页</Button>
      </div>
    </div>
  );
};

export default SupplierInfo;