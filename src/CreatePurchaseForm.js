import React, { useState, useEffect, useCallback } from 'react';
import db from './db';
import TemplateForm from './TemplateForm';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function CreatePurchaseForm({ companyName, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [noTemplatesAlert, setNoTemplatesAlert] = useState(false);
  const [noQuantityAlert, setNoQuantityAlert] = useState(false);
  const [onSaveFormSuccess, setOnSaveFormSuccess] = useState(false);

  const fetchTemplates = useCallback(async () => {
    const loadedTemplates = await db.templates.toArray();
    setTemplates(loadedTemplates);
  }, []);
  
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  
  useEffect(() => {
    if (templates.length === 0) {
      setNoTemplatesAlert(true);
    } else {
      setNoTemplatesAlert(false);
    }
  }, [templates]);
  
  

  useEffect(() => {
    const total = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    setTotalPrice(total);
  }, [items]);
  

  const handleCloseNoTemplatesDialog = () => {
    setNoTemplatesAlert(false);
  };


  const handleTemplateChange = (templateName) => {
    console.log("Selected template name:", templateName); // Log the selected template name  
    // If "请选择模板" is selected (value is an empty string), clear the selection and items
    if (templateName === '') {
      setSelectedTemplateId('');
      setItems([]);
      return;
    }
    // Find the template based on the name
    const template = templates.find(t => t.name === templateName);
    console.log("Selected template:", template); // Log the found template
  
    if (template && template.items) {
      setSelectedTemplateId(templateName); // Set the selected template ID to the chosen template's name
      setItems(template.items.map((item, idx) => ({
        ...item,
        quantity: 0, // Initialize quantity
        key: `${templateName}-${idx}` // Create a unique key
      })));
    } else {
      console.log("No template found with name:", templateName); // Log if no template is found
      setItems([]); // Clear items if no template is found
    }
  };

  const handleItemChange = (itemKey, field, value) => {
    const updatedItems = items.map((item) =>
      item.key === itemKey ? { ...item, [field]: Number(value) } : item
    );
    setItems(updatedItems);
  };


  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };


  if (showTemplateForm) {
    return <TemplateForm onBack={() => setShowTemplateForm(false)} onTemplatesUpdated={fetchTemplates}/>;
  };


  const handleSaveForm = async () => {
    try {
      // Retrieve the company from IndexedDB
      const company = await db.companies.get({ name: companyName });
  
      if (!company) {
        console.error('未能找到：', companyName);
        alert('未能找到此公司！');
        return;
      }

      const isInvalidQuantity = items.some(item => (!item.quantity || item.quantity === 0));

      if (isInvalidQuantity) {
        setNoQuantityAlert(true);
        return;
      }

      // Check if 'forms' exists and is an array, if not initialize it as an empty array
      const companyForms = company.forms || [];
  
      // Create a new form object with the current date and items
      const newForm = {
        date: new Date().toLocaleDateString(), // or another date format you prefer
        items: items
      };
  
      // Add the new form to the array of forms
      companyForms.push(newForm);
  
      // Update the company entry in IndexedDB with the new array of forms
      await db.companies.update(company.name, { forms: companyForms });
  
      alert('表单已保存！');
      // setOnSaveFormSuccess(true); 
      onBack();
    } catch (error) {
      console.error('保存表单时出错:', error);
      alert('保存失败！');
    }
  };
  
  

  return (
    <div>
      <Dialog
        open={noTemplatesAlert}
        onClose={handleCloseNoTemplatesDialog}
        aria-labelledby="no-templates-dialog-title"
        aria-describedby="no-templates-dialog-description"
      >
        <DialogTitle id="no-templates-dialog-title">{"无通用模板"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="no-templates-dialog-description">
            暂无通用模板，请先前往创建模板。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowTemplateForm(true); handleCloseNoTemplatesDialog(); }}>创建模板</Button>
          <Button onClick={handleBack}>返回</Button>
        </DialogActions>
      </Dialog> 
  
      {!noTemplatesAlert && (
        <>
          <h2>新建进货表单</h2>
          <select value={selectedTemplateId} onChange={(e) => handleTemplateChange(e.target.value)}>
            <option value="">请选择模板</option>
            {templates.map((template) => (
                <option key={template.name} value={template.name}>{template.name}</option>
            ))}
          </select>
          
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
              {items.map((item) => (
                  <tr key={item.key}> {/* Use the unique key for each item */}
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                      <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(item.key, 'quantity', e.target.value)}
                      />
                  </td>
                  <td>{(item.quantity || 0) * (item.price || 0)}</td>
                  </tr>
              ))}
          </tbody>
        </table>
        <p>总价: {totalPrice}</p>
        <Button onClick={() => handleSaveForm()}>保存表单</Button>
        <Dialog open={noQuantityAlert}>
          <DialogTitle>{'数量不可为空。'}</DialogTitle>
          <DialogContent>
            <DialogContentText>请重新输入。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoQuantityAlert(false)}>好的</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={onSaveFormSuccess}>
          <DialogTitle>{'保存成功。'}</DialogTitle>
          <DialogContent>
            <DialogContentText>返回公司详情页面。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOnSaveFormSuccess(false)}>好的</Button>
          </DialogActions>
        </Dialog>  
        </>
      )}
    </div>
  );
  
}

export default CreatePurchaseForm;
