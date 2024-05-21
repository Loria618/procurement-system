import React, { useState, useEffect } from 'react';
import CreateOrderForm from './CreateOrderForm';
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
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

async function deleteCompany(companyName) {
  try {
    await db.transaction('rw', db.companies, async () => {
      await db.companies.delete(companyName);
    });
    console.log("Company deleted successfully");
  } catch (error) {
    console.log("Error deleting company:", error);
  }
}

function CompanyDetails ({ company }) {
  const [currentCompany, setCurrentCompany] = useState(company);
  const [procurementOrders, setProcurementOrders] = useState([]);
  const [showCreateOrderForm, setShowCreateOrderForm] = useState(false);
  // const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  // const [isEditingNote, setIsEditingNote] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteOrdersAlert, setShowDeleteOrdersAlert] = useState(false);
  const [deleteOrdersAlertMessage, setDeleteOrdersAlertMessage] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      const updatedCompany = await db.companies.get(company.companyName);
      setCurrentCompany(updatedCompany);
    };

    fetchCompany();
  }, [company.companyName]);

  const fetchOrders = async (company) => {
    if (!company) {
      console.error("No company provided to fetchOrders");
      return;
    }
    try {
      const orders = await db.procurementOrders.where('companyName').equals(company).toArray();
      orders.sort((a, b) => b.creationDate - a.creationDate);
      setProcurementOrders(orders);
    } catch (error) {
      console.error('Error fetching orders for company: ', company, error);
    }
  };


  const handleNewOrder = () => {
    setShowCreateOrderForm(true);
  };

  const handleBack = () => {
    setShowCreateOrderForm(false);
    // Fetch the updated company data after creating a new form
    const fetchCompany = async () => {
      const updatedCompany = await db.companies.get(company.companyName);
      setCurrentCompany(updatedCompany);
    };
    fetchCompany();
  };

  const handleCompanyDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  }

  // const handleFieldClick = (e, field, idx = null) => {
  //   e.stopPropagation(); // Prevent event propagation
  //   if (field === 'companyName') {
  //     setIsEditingCompanyName(true);
  //   } else {
  //     setIsEditingNote(true);
  //   }
  // };

  // const handleFieldBlur = async (field, idx = null) => {
  //     if (field === 'companyName') {
  //     setIsEditingCompanyName(false);
  //     } else  {
  //     setIsEditingNote(false);
  //     } 
  //     await saveChanges();
  // };

  // const handleDeleteOrder = async (procurementOrders) => {
  //   // Make sure we actually have orders and the index is valid
  //   if (currentCompany.procurementOrders && procurementOrders >= 0 && procurementOrders < currentCompany.procurementOrders.length) {
  //     // Remove the form at the specified index
  //     const updatedOrders = [
  //       ...currentCompany.orders.slice(0, formIndex),
  //       ...currentCompany.orders.slice(formIndex + 1)
  //     ];

  //     try {
  //       // Update the company in IndexedDB with the new orders array
  //       await db.companies.update(currentCompany.companyName, { orders: updatedOrders });

  //       // Update the local state with the updated orders
  //       setCurrentCompany({ ...currentCompany, orders: updatedOrders });
  //       setShowDeleteOrdersAlert(true);
  //       setDeleteOrdersAlertMessage('已删除表单。');
  //     } catch (error) {
  //       console.error('Error deleting order:', error);
  //       setShowDeleteOrdersAlert(true);
  //       setDeleteOrdersAlertMessage('删除失败！');
  //     }
  //   } else {
  //     setShowDeleteOrdersAlert(true);
  //     setDeleteOrdersAlertMessage('表单索引无效，无法删除。');
  //   }
  // };

  // const handleCloseDeleteOrdersAlert = () => {
  //   setShowDeleteOrdersAlert(false);
  //   setDeleteOrdersAlertMessage('');
  // };

  // const saveChanges = async () => {
  //   try {
  //     await db.transaction('rw', db.companies, async () => {
  //       await db.companies.put(currentCompany);
  //     });
  //     console.log("Company updated successfully.");
  //   } catch (error) {
  //     console.log("Error updating company:", error);
  //   };

  //   const handleCompanyDeleteConfirm = () => {
  //     setShowDeleteConfirm(true);
  //   };

  //   const handleCancelDelete = () => {
  //     setShowDeleteConfirm(false);
  //   };

  //   const handleSave = () => {
  //     saveChanges();
  //   };

  //   const handleRedirectToSupplierInfo = () => {
  //     // Redirect to the supplier info page
  //     return (<SupplierInfo companyName={currentCompany.companyName} onBack={handleBack} />)
  //   }

  const handleBackToMainPage = () => {
    window.location.reload();
  }

    return (
      <div>
        <h2>{currentCompany.companyName}</h2>
        <p>{currentCompany.note}</p>
        {/* {showCreateOrderForm ? (
          <CreateOrderForm companyName={currentCompany.companyName} handleRedirectToSupplierInfo={handleRedirectToSupplierInfo} />
        ) : isEditingCompanyName ? (
          <input
            type="text"
            autoFocus
            value={currentCompany.companyName}
            onBlur={() => handleFieldBlur('companyName')}
            onChange={(e) => setCurrentCompany({ ...currentCompany, companyName: e.target.value })}
          />
        ) : (
          <h2 onClick={(e) => handleFieldClick(e, 'companyName')}>{currentCompany.companyName}</h2>
        )}

        {isEditingNote ? (
          <textarea
            autoFocus
            value={currentCompany.note}
            onBlur={() => handleFieldBlur('note')}
            onChange={(e) => setCurrentCompany({ ...currentCompany, note: e.target.value })}
          />
        ) : (
          <p onClick={(e) => handleFieldClick(e, 'note')}>{currentCompany.note}</p>
        )} */}


        <table>
          <thead>
            <tr>
              <th>供应商名称</th>
              <th>进货日期</th>
            </tr>
          </thead>
          <tbody>
            {procurementOrders.length > 0 ? (
              procurementOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.supplierName}</td>
                  <td>{order.date.toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="2">暂无进货订单</td></tr>
            )}
          </tbody>
        </table>
        <Button onClick={handleCompanyDeleteConfirm}>删除公司</Button>
        <Dialog open={showDeleteConfirm}>
          <DialogTitle>确定要删除该公司吗？</DialogTitle>
          <DialogContent>
            <DialogContentText>这将删除该公司包括进货订单在内的所有信息，确定吗？</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={deleteCompany}>确认删除</Button>
            {/* <Button onClick={handleCancelDelete}>取消</Button> */}
          </DialogActions>
        </Dialog>
        {/* <Button onClick={handleSave}>保存公司信息</Button> */}
        <Button onClick={handleNewOrder}>新建进货订单</Button>
        <h1>全部进货表单</h1>
        <div>
          {currentCompany.forms && currentCompany.forms.length > 0 ? (
            currentCompany.forms.map((form, index) => (
              <div key={index}>
                <h2>{form.date}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>供应商</th>
                      <th>订单创建日期</th>
                      <th>总价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procurementOrders.items.map((item, idx) => (
                      <tr key={idx}> {/* Use the unique key for each item */}
                        <td>{item.supplierName}</td>
                        <td>{item.creationDate}</td>
                        <td>{(item.quantity) * (item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p>暂无表单。</p>
          )}
        </div>

        <div>
        <Button onClick={handleBackToMainPage} startIcon={<HomeRoundedIcon />}>返回首页</Button>
      </div>
      </div>
    );
  };
// }
export default CompanyDetails;