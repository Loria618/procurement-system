import React, { useState, useEffect } from 'react';
import CollapsibleTable from './CollapsibleTable';
import db from './db';
// procurement template
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
import AddCommentIcon from '@mui/icons-material/AddComment';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

function createData(name, price) {
  return { name, price };
}

function SupplierDetails({ supplier }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [items, setItems] = useState([]);
  const [openSaveTemplateDialog, setOpenSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [templates, setTemplates] = useState([]);

  const [editNote, setEditNote] = useState(false);
  const [note, setNote] = useState(supplier.note);

  useEffect(() => {
    fetchTemplates();
    setNote(supplier.note);
  }, [supplier, openSuccessDialog]);

  const fetchTemplates = async () => {
    try {
      const supplierData = await db.suppliers.get(supplier.supplierName);
      if (supplierData && supplierData.template) {
        setTemplates(supplierData.template);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleAddItem = () => {
    if (!itemName || !itemPrice) {
      setOpenAddItemDialog(true);
    } else {
      console.log('Adding item: ', itemName, 'price: ', itemPrice);
      const newItem = createData(itemName, parseFloat(itemPrice));
      setItems([...items, newItem]);
      setItemName('');
      setItemPrice('');
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleOpenDialog = () => {
    setOpenSaveTemplateDialog(true);
  };

  const handleCloseDialog = () => {
    if (openSaveTemplateDialog) {
      setOpenSaveTemplateDialog(false);
    } else if (openAddItemDialog) {
      setOpenAddItemDialog(false);
    } else if (openSuccessDialog) {
      setOpenSuccessDialog(false);
    } 
    setErrorMessage("");
  };


  const handleTryToSaveTemplate = () => {
    if (!templateName.trim()) {
      setErrorMessage("模板名称不可留空");
      return;
    }
    if (items.length === 0) {
      setOpenAddItemDialog(true);
      return;
    }
    const templateData = {
      templateName,
      templateContents: items
    };
    handleSaveTemplate(templateData);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      const supplierData = await db.suppliers.get(supplier.supplierName);
      if (!supplierData) {
        alert("无法找到供应商数据！");
        return;
      }
      const existingTemplate = supplierData.template && supplierData.template.find(t => t.templateName === templateData.templateName);
      if (existingTemplate) {
        setErrorMessage("已存在同名模板，请使用不同的模板名称。");
        return;
      }
      setErrorMessage("");
      const updatedSupplierData = {
        ...supplierData,
        template: [...(supplierData.template || []), templateData]
      };
      await db.suppliers.put({
        ...updatedSupplierData,
        supplierName: supplier.supplierName
      });
      console.log("Template saved successfully!");
      setOpenSaveTemplateDialog(false);
      setOpenSuccessDialog(true);
      setItems([]);
    } catch (error) {
      console.error("Error saving template:", error);
      alert("保存模板失败！");
    }
  };


  const handleSaveNote = async () => {
    try {
      await db.suppliers.update(supplier.supplierName, { note });
      setEditNote(false);
      console.log("Note updated successfully!");
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleBackToMainPage = () => {
    window.location.reload();
  }

  return (
    <div>
      <h2>{supplier.supplierName}进货模板</h2>
      {editNote ? (
        <div>
          <TextField
            type="text"
            label="备注"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <Button onClick={handleSaveNote}>保存</Button>
          <Button onClick={() => setEditNote(false)}>取消</Button>
        </div>
      ) : (
        <div>
          <p>{note}</p>
          <Button onClick={() => setEditNote(true)} startIcon={<AddCommentIcon />}>编辑备注</Button>
        </div>
      )}
      <div>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField type="text" className="item-input" label="商品名称" variant="outlined" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          <TextField type="number" className="item-input" label="商品价格" variant="outlined" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
        </Box>
        <Button className="add-item-btn" tabIndex={-1} onClick={handleAddItem} startIcon={<AddShoppingCartIcon />}>添加商品</Button>
        <Dialog open={openAddItemDialog} onClose={() => setOpenAddItemDialog(false)}>
          <DialogTitle>{"商品名称和单价不可留空"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              请输入商品名称和单价。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="confirm-btn" onClick={() => setOpenAddItemDialog(false)} autoFocus>好的</Button>
          </DialogActions>
        </Dialog>

        <TableContainer component={Paper} className="new-temp-table-container">
          <Table aria-label="item table">
            <TableHead>
              <TableRow>
                <TableCell className="new-temp-table-cell">商品名称</TableCell>
                <TableCell className="new-temp-table-cell" align="right">商品价格</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="new-temp-table-cell" component="th" scope="row">
                    {item.name}
                  </TableCell>
                  <TableCell className="new-temp-table-cell" align="right">{item.price.toFixed(2)}</TableCell>
                  <TableCell className="new-temp-table-cell" align="right">
                    <Button className='delete-btn' onClick={() => handleDeleteItem(index)} startIcon={<DeleteIcon />} color="error">删除商品</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div>
          <Button startIcon={<SaveIcon />} onClick={handleOpenDialog}>
            为{supplier.supplierName}保存模板
          </Button>
          <Dialog open={openSaveTemplateDialog} onClose={handleCloseDialog}>
            <DialogTitle>为{supplier.supplierName}添加模板</DialogTitle>
            <DialogContent>
              <DialogContentText>
                请为模板输入名称
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="template-name"
                label="模板名称"
                type="text"
                fullWidth
                variant="standard"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
              {errorMessage && (
                <Alert variant="outlined" severity="error">
                  {errorMessage}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>取消</Button>
              <Button onClick={handleTryToSaveTemplate}>保存模板</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={openSuccessDialog} onClose={handleCloseDialog}>
            <DialogTitle>{"保存成功"}</DialogTitle>
            <DialogContent>
              <DialogContentText>已成功保存{templateName}模板</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button className="confirm-btn" onClick={handleCloseDialog} autoFocus>好的</Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
      <div>
        {templates.length > 0 && (
          <CollapsibleTable templates={templates} />
        )}
      </div>
      <div>
        <Button onClick={handleBackToMainPage} startIcon={<HomeRoundedIcon />}>返回首页</Button>
      </div>
    </div>
  );
}

export default SupplierDetails;