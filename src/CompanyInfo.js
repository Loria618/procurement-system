import React, { useState } from 'react';
import CompanyDetails from './CompanyDetails';
import db from './db';
// styling
import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

function CompanyInfo() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [redirectToCompanyDetails, setRedirectToCompanyDetails] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false); // set the state for the success dialog
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // set the state for the confirm dialog

  const handleCheckCompanyName = async () => {
    console.log('Checking company name...');
    try {
      const existingCompany = await db.companies.get(name); // check if the company name already exists
      if (!name) {
        setOpenConfirmDialog(true); // show the confirm dialog if the company name is empty
      } else if (existingCompany) {
        setOpenConfirmDialog(true); // show the confirm dialog if the company name already exists
      } else {
        saveCompanyInfo(); // save the company info
      }
    } catch (error) {
      console.error('Error in checking company name: ', error);
    }
  };

  const saveCompanyInfo = async () => {
    console.log('Saving company info...');
    try {
      await db.companies.add({ name, note });
      setOpenSuccessDialog(true); // show the success dialog after saving the company info
    } catch (error) {
      console.error('Error in saving company information: ', error);
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
    console.log('Editing existing company...');
    setOpenConfirmDialog(false);
    setRedirectToCompanyDetails(true); // redirect to the company details page
    setCompanyName(name)
  };

  if (redirectToCompanyDetails) {
    return <CompanyDetails company={{ name: companyName }} />;
  };

  const showDialog = () => {
    console.log('Showing dialog...');
    if (openSuccessDialog) {
      console.log('Success dialog is open: Company info saved.');
      return (
        <Dialog open={openSuccessDialog} onClose={handleCloseSuccess}>
          <DialogTitle>{"保存成功"}</DialogTitle>
          <DialogContent>
            <DialogContentText>已成功保存公司信息。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={handleCloseSuccess} autoFocus>确认并返回</Button>
          </DialogActions>
        </Dialog>
      );
    } else if (!name) {
      console.log('Confirm dialog is open: Company name is empty.');
      return (
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>{"未填入公司名称"}</DialogTitle>
          <DialogContent>
            <DialogContentText>请填入公司名称。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={handleContinueAdding} autoFocus>好的</Button>
          </DialogActions>
        </Dialog>
      );
    } else {
      console.log('Confirm dialog is open: Company already exists.');
      return (
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>{`已存在“${name}”`}</DialogTitle>
          <DialogContent>
            <DialogContentText>{`前往编辑“${name}”的信息还是继续添加其他公司？`}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={handleEditExisting} autoFocus>{`前往${name}详情页面进行编辑`}</Button>
            <Button className="cancel-btn" onClick={handleContinueAdding}>继续添加其他公司</Button>
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
        <h2>新建公司</h2>
        <div>
          <label>公司名称：</label>
          <input type="text" className="company-name-box" placeholder="请输入公司名称（必填）" value={name} onChange={(e) => setName(e.target.value)} autoFocus/>
        </div>
        <div>
          <label>公司备注：</label>
          <textarea className="notes-box" placeholder="请输入公司备注（可选）" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button className="save-btn" onClick={handleCheckCompanyName}>保存公司信息</Button>
      </div>
    </div>
  );
};

export default CompanyInfo;