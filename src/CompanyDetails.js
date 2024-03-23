import React, { useState, useEffect } from 'react';
import CreatePurchaseForm from './CreatePurchaseForm';
import db from './db';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Button from '@mui/material/Button';

// Assuming 'db' is your Dexie database instance as you've used 'db' in your previous messages.
async function deleteCompany(companyName) {
  try {
    await db.transaction('rw', db.companies, async () => {
      await db.companies.delete(companyName);
    });
    console.log("Company deleted successfully");
  } catch (error) {
    console.error("Error deleting the company:", error);
  }
}

const CompanyDetails = ({ company }) => {
  const [showCreatePurchaseForm, setShowCreatePurchaseForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFormAlert, setShowDeleteFormAlert] = useState(false);
  const [deleteFormAlertMessage, setDeleteFormAlertMessage] = useState('');
  const [currentCompany, setCurrentCompany] = useState(company);

  useEffect(() => {
    const fetchCompany = async () => {
      const updatedCompany = await db.companies.get(company.name);
      setCurrentCompany(updatedCompany);
    };

    fetchCompany();
  }, [company.name]);

  const showDetails = () => {
    setShowCreatePurchaseForm(false);
  };

  const showPurchaseForm = () => {
    setShowCreatePurchaseForm(true);
  };

  const handleBack = () => {
    setShowCreatePurchaseForm(false);
    // Fetch the updated company data after creating a new form
    const fetchCompany = async () => {
      const updatedCompany = await db.companies.get(company.name);
      setCurrentCompany(updatedCompany);
    };
    fetchCompany();
  };

  const handleCompanyDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  }

  const handleDeleteThisCompany = async () => {
    try {
      await deleteCompany(currentCompany.name); // Call the deleteCompany function with the current company name
    } catch (error) {
      console.error('Error deleting the company:', error);
    }
    setShowDeleteConfirm(false); // Close the delete confirmation modal
    window.location.reload();
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  }

  const handleDeleteForm = async (formIndex) => {
    // Make sure we actually have forms and the index is valid
    if (currentCompany.forms && formIndex >= 0 && formIndex < currentCompany.forms.length) {
      // Remove the form at the specified index
      const updatedForms = [
        ...currentCompany.forms.slice(0, formIndex),
        ...currentCompany.forms.slice(formIndex + 1)
      ];

      try {
        // Update the company in IndexedDB with the new forms array
        await db.companies.update(currentCompany.name, { forms: updatedForms });

        // Update the local state with the updated forms
        setCurrentCompany({ ...currentCompany, forms: updatedForms });
        setShowDeleteFormAlert(true);
        setDeleteFormAlertMessage('已删除表单。');
      } catch (error) {
        console.error('删除表单时出错：', error);
        setShowDeleteFormAlert(true);
        setDeleteFormAlertMessage('删除失败！');
      }
    } else {
      setShowDeleteFormAlert(true);
      setDeleteFormAlertMessage('表单索引无效，无法删除。');
    }
  };

  const handleCloseDeleteFormAlert = () => {
    setShowDeleteFormAlert(false);
    setDeleteFormAlertMessage('');
  };

  const handleExportForm = (form) => {
    // Convert form data to a JSON blob and create a URL for it
    // const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(form));
    // const downloadAnchorNode = document.createElement('a');
    // downloadAnchorNode.setAttribute("href", dataStr);
    // downloadAnchorNode.setAttribute("download", `${form.date}-form.json`);
    // document.body.appendChild(downloadAnchorNode); // required for firefox
    // downloadAnchorNode.click();
    // downloadAnchorNode.remove();
  };

  if (showCreatePurchaseForm) {
    // 如果状态为true，显示CreatePurchaseForm组件，并传递公司名称
    return <CreatePurchaseForm companyName={currentCompany.name} onBack={handleBack} />;
  }

  return (
    <div>
      <h2>{currentCompany.name}</h2>
      <p>{currentCompany.note}</p>
      <Button onClick={handleCompanyDeleteConfirm}>删除公司信息</Button>
      <Dialog open={showDeleteConfirm}>
        <DialogTitle>确定要删除该公司的信息吗？</DialogTitle>
        <DialogContent>
          <DialogContentText>这将删除包含该公司所有进货表单在内的全部内容，确定吗？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteThisCompany}>确认删除</Button>
          <Button onClick={handleCancelDelete}>取消</Button>
        </DialogActions>
      </Dialog>
      <Button onClick={showPurchaseForm}>新建进货表单</Button>
      <h1>全部进货表单</h1>
      <div>
        {currentCompany.forms && currentCompany.forms.length > 0 ? (
          currentCompany.forms.map((form, index) => (
            <div key={index}>
              <h2>{form.date}</h2>
              <table>
                <thead>
                  <tr>
                    <th>商品名称</th>
                    <th>单价</th>
                    <th>数量</th>
                    <th>总价</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => (
                    <tr key={idx}> {/* Use the unique key for each item */}
                      <td>{item.name}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.quantity) * (item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button onClick={() => handleDeleteForm(index)}>删除表单</Button>
              <Button onClick={() => handleExportForm(index)}>导出表单</Button>
            </div>
          ))
        ) : (
          <p>暂无表单。</p>
        )}
      </div>
      <Dialog open={showDeleteFormAlert} onClose={handleCloseDeleteFormAlert}>
        <DialogTitle>表单操作结果</DialogTitle>
        <DialogContent>
          <DialogContentText>{deleteFormAlertMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteFormAlert}>确定</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CompanyDetails;