import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import CompanyDetails from './CompanyDetails';
import SupplierInfo from './SupplierInfo';
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

const CreateOrderForm = ({ companyName }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showNoSuppliersDialog, setShowNoSuppliersDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNoSelectedDialog, setShowNoSelectedDialog] = useState(false);

  // Fetch suppliers from the database
  useEffect(() => {
    const fetchSuppliers = async () => {
      const loadedSuppliers = await db.suppliers.toArray();
      setIsLoading(false);
      if (loadedSuppliers.length === 0) {
        setShowNoSuppliersDialog(true);  // Show dialog if no suppliers
      } else {
        setSuppliers(loadedSuppliers);
        setShowNoSuppliersDialog(false);
      }
      setIsLoading(false);
    };
    fetchSuppliers();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const handleAddItem = (supplier) => {
    const newItem = {
      supplierName: supplier.name,
      itemName: supplier.itemName,
      unitPrice: supplier.itemPrice,
      quantity: 1,
      totalPrice: supplier.itemPrice
    };
    setOrderItems(prevItems => [...prevItems, newItem]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = orderItems.map((item, idx) => {
      if (idx === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity;
        }
        return updatedItem;
      }
      return item;
    });
    setOrderItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    setOrderItems(prevItems => prevItems.filter((_, idx) => idx !== index));
  };

  // Save the new order
  const handleSaveOrder = async () => {
    if (!selectedSupplier) {
      setShowNoSelectedDialog(true);
      return;
    }
    for (const item of orderItems) {
      await db.procurementOrders.add({
        companyName,
        supplierName: item.supplierName, // Assuming each item knows its supplier
        itemName: item.itemName,
        unitPrice: parseFloat(item.unitPrice),
        quantity: parseInt(item.quantity, 10),
        totalPrice: parseFloat(item.totalPrice),
        creationDate: new Date()
      });
      setShowSuccessDialog(true);
    };

    const handleRedirectToCompanyDetails = () => {
      // Redirect to the company details page
      return (<CompanyDetails companyName={companyName} />)
    }

    const handleRedirectToSupplierInfo = () => {
      // Redirect to the supplier info page
      return (<SupplierInfo />)
    }

    return (
      <div>
        <h2>为{companyName}创建进货表单</h2>
        {isLoading ? <p>Loading...</p> : suppliers.map((supplier, index) => (
          <Button key={index} startIcon={<AddShoppingCartIcon />} onClick={() => handleAddItem(supplier)}>添加 {supplier.itemName}</Button>
        ))}
        {orderItems.map((item, index) => (
          <div key={index}>
            <TextField label="Item Name" value={item.itemName} onChange={(e) => handleItemChange(index, 'itemName', e.target.value)} />
            <TextField label="Unit Price" type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} />
            <TextField label="Quantity" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))} />
            <TextField label="Total Price" type="number" value={item.totalPrice} InputProps={{ readOnly: true }} />
            <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteItem(index)}>删除</Button>
          </div>
        ))}
        <Button onClick={handleSaveOrder}>保存采购表单</Button>
        {showNoSelectedDialog && (
          <Dialog open={showNoSelectedDialog} onClose={() => setShowNoSelectedDialog(false)}>
            <DialogTitle>未选择供应商模板</DialogTitle>
            <DialogContent>
              <DialogContentText>请先选择供应商模板。</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowNoSelectedDialog(false)}>好的</Button>
            </DialogActions>
          </Dialog>
        )};
        {showNoSuppliersDialog && (
          <Dialog open={showNoSuppliersDialog} onClose={() => setShowNoSuppliersDialog(false)}>
            <DialogTitle>暂无供应商模板</DialogTitle>
            <DialogContent>
              <DialogContentText>请先创建供应商模板。</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRedirectToSupplierInfo} autoFocus>前往创建供应商模板</Button>
              <Button onClick={() => setShowNoSuppliersDialog(false)}>关闭</Button>
            </DialogActions>
          </Dialog>
        )}
        {showSuccessDialog && (
          <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
            <DialogTitle>新建进货表单成功</DialogTitle>
            <DialogContent>
              <DialogContentText>进货表单已成功创建。</DialogContentText>
              <DialogContentText>是否前往公司详情页面查看？</DialogContentText>
              <DialogContentText>或者继续创建新的进货表单。</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRedirectToCompanyDetails} autoFocus>前往公司详情页面</Button>
              <Button onClick={() => setShowSuccessDialog(false)}>继续创建新的进货表单</Button>
            </DialogActions>
          </Dialog>
        )};
      </div>
    );
  };
}

export default CreateOrderForm;