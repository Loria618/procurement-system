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
async function deleteSupplier(supplierName) {
  try {
    await db.transaction('rw', db.suppliers, async () => {
      await db.suppliers.delete(supplierName);
    });
    console.log("Supplier deleted successfully");
  } catch (error) {
    console.error("Error deleting the Supplier:", error);
  }
}

const SupplierDetails = ({ supplier }) => {
  const [showCreatePurchaseForm, setShowCreatePurchaseForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFormAlert, setShowDeleteFormAlert] = useState(false);
  const [deleteFormAlertMessage, setDeleteFormAlertMessage] = useState('');
  const [currentSupplier, setCurrentSupplier] = useState(supplier);

  useEffect(() => {
    const fetchSupplier = async () => {
      const updatedSupplier = await db.suppliers.get(supplier.name);
      setCurrentSupplier(updatedSupplier);
    };

    fetchSupplier();
  }, [supplier.name]);

  const showPurchaseForm = () => {
    setShowCreatePurchaseForm(true);
  };

  const handleBack = () => {
    setShowCreatePurchaseForm(false);
    // Fetch the updated Supplier data after creating a new form
    const fetchSupplier = async () => {
      const updatedSupplier = await db.suppliers.get(supplier.name);
      setCurrentSupplier(updatedSupplier);
    };
    fetchSupplier();
  };

  const handleSupplierDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  }

  const handleDeleteThisSupplier = async () => {
    try {
      await deleteSupplier(currentSupplier.name); // Call the deleteSupplier function with the current Supplier name
    } catch (error) {
      console.error('Error deleting the Supplier:', error);
    }
    setShowDeleteConfirm(false); // Close the delete confirmation modal
    window.location.reload();
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  }

  const handleDeleteForm = async (formIndex) => {
    // Make sure we actually have forms and the index is valid
    if (currentSupplier.forms && formIndex >= 0 && formIndex < currentSupplier.forms.length) {
      // Remove the form at the specified index
      const updatedForms = [
        ...currentSupplier.forms.slice(0, formIndex),
        ...currentSupplier.forms.slice(formIndex + 1)
      ];

      try {
        // Update the Supplier in IndexedDB with the new forms array
        await db.suppliers.update(currentSupplier.name, { forms: updatedForms });

        // Update the local state with the updated forms
        setCurrentSupplier({ ...currentSupplier, forms: updatedForms });
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
    // 如果状态为true，显示CreatePurchaseForm组件，并传递供应商名称
    return <CreatePurchaseForm supplierName={currentSupplier.name} onBack={handleBack} />;
  }

  return (
    <div>
      <h2>{currentSupplier.name}</h2>
      <p>{currentSupplier.note}</p>
      <Button onClick={handleSupplierDeleteConfirm}>删除供应商信息</Button>
      <Dialog open={showDeleteConfirm}>
        <DialogTitle>确定要删除该供应商的信息吗？</DialogTitle>
        <DialogContent>
          <DialogContentText>这将删除包含该供应商所有进货表单在内的全部内容，确定吗？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteThisSupplier}>确认删除</Button>
          <Button onClick={handleCancelDelete}>取消</Button>
        </DialogActions>
      </Dialog>
      <Button onClick={showPurchaseForm}>新建进货表单</Button>
      <h1>全部进货表单</h1>
      <div>
        {currentSupplier.forms && currentSupplier.forms.length > 0 ? (
          currentSupplier.forms.map((form, index) => (
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

export default SupplierDetails;