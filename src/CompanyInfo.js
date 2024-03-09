import React, { useState } from 'react';
import db from './db';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CompanyDetails from './CompanyDetails';

function CompanyInfo() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [redirectToCompanyDetails, setRedirectToCompanyDetails] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false); // 控制成功对话框的状态
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // 控制确认对话框的状态

  const handleCheckCompanyName = async () => {
      try {
        const existingCompany = await db.companies.get(name); // 检查是否存在同名公司
        if (!name) {
          setOpenConfirmDialog(true); // 如果未填入公司名称，显示确认对话框
        } else if (existingCompany) {
          setOpenConfirmDialog(true); // 如果存在同名公司，显示确认对话框
        } else {
          saveCompanyInfo(); // 如果不存在同名公司，直接保存信息
        }
      } catch (error) {
        console.error('检查公司名称时出错:', error);
      }
  };

  const saveCompanyInfo = async () => {
    try {
      await db.companies.add({ name, note });
      setOpenSuccessDialog(true); // 保存成功后显示成功提示对话框
    } catch (error) {
      console.error('保存公司信息时出错:', error);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccessDialog(false); // 关闭成功提示对话框
    window.location.reload(); // 刷新页面
  };

  const handleContinueAdding = () => {
    setOpenConfirmDialog(false); // 关闭确认对话框，用户可以继续添加其他公司
  };

  const handleEditExisting = () => {
    setOpenConfirmDialog(false);
    setRedirectToCompanyDetails(true); // 前往现有的同名公司页面
    setCompanyName(name)
  };

  if (redirectToCompanyDetails) {
    return <CompanyDetails company={{ name: companyName }} />;
  };

  return (
    <div>
      <h2>新建公司</h2>
      <div>
        <label>公司名称：</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>公司备注：</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <Button onClick={handleCheckCompanyName}>保存公司信息</Button>

      <Dialog open={openSuccessDialog} onClose={handleCloseSuccess}>
        <DialogTitle>{"保存成功"}</DialogTitle>
        <DialogContent>
          <DialogContentText>已成功保存公司信息。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccess} autoFocus>好的</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          {(!name) ? (
          <React.Fragment>
            <DialogTitle>{"未填入公司名称"}</DialogTitle>
            <DialogContent>
              <DialogContentText>请填入公司名称。</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleContinueAdding}>好的</Button>
            </DialogActions>
          </React.Fragment>
            ) : (
          <React.Fragment>
            <DialogTitle>{`已存在“${name}”`}</DialogTitle>
            <DialogContent>
              <DialogContentText>{`前往编辑“${name}”的信息还是继续添加其他公司？`}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditExisting} autoFocus>{`前往${name}详情页面进行编辑`}</Button>
              <Button onClick={handleContinueAdding}>继续添加其他公司</Button>
            </DialogActions>
          </React.Fragment>
          )}
      </Dialog>
    </div>
  );
}

export default CompanyInfo;
