import React, { useState, useEffect } from 'react';
import db from './db';
// styling
import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

async function deleteSupplier(supplierName) {
    try {
      await db.transaction('rw', db.suppliers, async () => {
        await db.suppliers.delete(supplierName);
      });
      console.log("Supplier deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier: ", error);
    }
}

const SupplierDetails = ({ supplier }) => {
    const [currentSupplier, setCurrentSupplier] = useState(supplier || {});
    const [isEditingSupplierName, setIsEditingSupplierName] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [isEditingItems, setIsEditingItems] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
    useEffect(() => {
      const fetchSupplier = async () => {
        const updatedSupplier = await db.suppliers.get({ name: supplier.name });
        setCurrentSupplier(updatedSupplier || supplier);
      };
      fetchSupplier();
    }, [supplier.name]);
  
    const handleFieldClick = (e, field, idx = null) => {
      e.stopPropagation(); // Prevent event propagation
      if (field === 'name') {
        setIsEditingSupplierName(true);
      } else if (field === 'note') {
        setIsEditingNote(true);
      } else {
        setIsEditingItems({ ...isEditingItems, [`${idx}-${field}`]: true });
      }
    };
  
    const handleFieldBlur = async (field, idx = null) => {
      if (field === 'name') {
        setIsEditingSupplierName(false);
      } else if (field === 'note') {
        setIsEditingNote(false);
      } else {
        const newIsEditingItems = { ...isEditingItems };
        delete newIsEditingItems[`${idx}-${field}`];
        setIsEditingItems(newIsEditingItems);
      }
      await saveChanges();
    };
  
    const saveChanges = async () => {
      try {
        await db.suppliers.put(currentSupplier);
        console.log("Changes saved successfully.");
      } catch (error) {
        console.error("Failed to save changes:", error);
      }
    };
  
    const handleSupplierDeleteConfirm = () => {
      setShowDeleteConfirm(true);
    };
  
    const handleCancelDelete = () => {
      setShowDeleteConfirm(false);
    };
  
    const handleSave = () => {
      saveChanges();
    };
  
    return (
      <div>
        {isEditingSupplierName ? (
          <input
            type="text"
            autoFocus
            value={currentSupplier.name}
            onBlur={() => handleFieldBlur('name')}
            onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
          />
        ) : (
          <h2 onClick={(e) => handleFieldClick(e, 'name')}>{currentSupplier.name}</h2>
        )}
  
        {isEditingNote ? (
          <textarea
            autoFocus
            value={currentSupplier.note}
            onBlur={() => handleFieldBlur('note')}
            onChange={(e) => setCurrentSupplier({ ...currentSupplier, note: e.target.value })}
          />
        ) : (
          <p onClick={(e) => handleFieldClick(e, 'note')}>{currentSupplier.note}</p>
        )}
  
        <table>
          <thead>
            <tr>
              <th>商品名称</th>
              <th>单价</th>
            </tr>
          </thead>
          <tbody>
            {currentSupplier.items?.map((item, idx) => (
              <tr key={idx}>
                <td onClick={(e) => handleFieldClick(e, 'name', idx)}>
                  {isEditingItems[`${idx}-name`] ? (
                    <input
                      type="text"
                      autoFocus
                      value={item.name}
                      onBlur={() => handleFieldBlur('name', idx)}
                      onChange={(e) => {
                        const updatedItems = currentSupplier.items.map((it, itIdx) => 
                          idx === itIdx ? { ...it, name: e.target.value } : it
                        );
                        setCurrentSupplier({ ...currentSupplier, items: updatedItems });
                      }}
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td onClick={(e) => handleFieldClick(e, 'price', idx)}>
                  {isEditingItems[`${idx}-price`] ? (
                    <input
                      type="number"
                      autoFocus
                      value={item.price}
                      onBlur={() => handleFieldBlur('price', idx)}
                      onChange={(e) => {
                        const updatedItems = currentSupplier.items.map((it, itIdx) => 
                          idx === itIdx ? { ...it, price: e.target.value } : it
                        );
                        setCurrentSupplier({ ...currentSupplier, items: updatedItems });
                      }}
                    />
                  ) : (
                    item.price
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="delete-btn" onClick={handleSupplierDeleteConfirm}>删除供应商</Button>
        <Dialog open={showDeleteConfirm}>
          <DialogTitle>确定要删除该供应商吗？</DialogTitle>
          <DialogContent>
            <DialogContentText>这将删除该供应商包括采购模板在内的所有信息，确定吗？</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-delete-btn" onClick={deleteSupplier}>确认删除</Button>
            <Button className="cancel-btn" onClick={handleCancelDelete}>取消</Button>
          </DialogActions>
        </Dialog>
        <Button className="save-btn" onClick={handleSave}>保存供应商</Button>
      </div>
    );
  };
  
  export default SupplierDetails;
