import React, { Component } from 'react';
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

class CompanyDetails extends Component {
  state = {
    showCreatePurchaseForm: false,
    showPurchaseForm: false,
    showDeleteConfirm: false,
  };

  showDetails = () => {
    this.setState({ showPurchaseForm: false });
  };

  showPurchaseForm = () => {
    this.setState({ showPurchaseForm: true });
  };

  handleNewPurchaseForm = () => {
    this.setState({ showCreatePurchaseForm: true });
  };


  handleBack = () => {
    this.setState({ showCreatePurchaseForm: false });
  }; 

  handleCompanyDeleteConfirm = () => {
    this.setState({ showDeleteConfirm: true });
  }

  handleDeleteThisCompany = async () => {
    try {
      await deleteCompany(this.props.company.name); // Call the deleteCompany function with the current company name
      // Assuming 'onCompanyDeleted' is a prop function to handle the deletion (like refreshing the list or navigating away)
      if (this.props.onUpdate) {
        this.props.onUpdate(); 
      }
    } catch (error) {
      console.error('Error deleting the company:', error);
    }
    this.setState({ showDeleteConfirm: false }); // Close the delete confirmation modal
    window.location.reload();
  }

  handleCancelDelete = () => {
    this.setState({ showDeleteConfirm: false });
  }


  handleDeleteForm = async (formIndex) => {
    const { company } = this.props;
    // Make sure we actually have forms and the index is valid
    if (company.forms && formIndex >= 0 && formIndex < company.forms.length) {
      // Remove the form at the specified index
      const updatedForms = [
        ...company.forms.slice(0, formIndex),
        ...company.forms.slice(formIndex + 1)
      ];
  
      try {
        // Update the company in IndexedDB with the new forms array
        await db.companies.update(company.name, { forms: updatedForms });
        // If an onUpdate method is provided via props, call it
        if (this.props.onUpdate) {
          this.props.onUpdate();
        } else {
          // Update local state if no onUpdate method is provided
          this.setState({
            company: {
              ...company,
              forms: updatedForms
            }
          });
        }
  
        alert('表单已删除。');
        if (this.props.onUpdate) {
            this.props.onUpdate(); // Calls the parent component to update its state
          }
      } catch (error) {
        console.error('删除表单时出错:', error);
        alert('删除失败！');
      }
    } else {
      alert('无效的表单索引，无法删除。');
    }
  };
  
  

  handleExportForm = (form) => {
    // Convert form data to a JSON blob and create a URL for it
    // const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(form));
    // const downloadAnchorNode = document.createElement('a');
    // downloadAnchorNode.setAttribute("href", dataStr);
    // downloadAnchorNode.setAttribute("download", `${form.date}-form.json`);
    // document.body.appendChild(downloadAnchorNode); // required for firefox
    // downloadAnchorNode.click();
    // downloadAnchorNode.remove();
  };

  render() {
    const { company } = this.props;
    const { showCreatePurchaseForm } = this.state;
    const { showDeleteConfirm } = this.state;

    if (showCreatePurchaseForm) {
      // 如果状态为true，显示CreatePurchaseForm组件，并传递公司名称
      return <CreatePurchaseForm companyName={company.name} onBack={this.handleBack} />;
    }

    return (
      <div>
        <h2>{company.name}</h2>
        <p>{company.note}</p>
        <Button onClick={this.handleCompanyDeleteConfirm}>删除公司信息</Button>
        <Dialog open={showDeleteConfirm}>
          <DialogTitle>确定要删除该公司的信息吗？</DialogTitle>
          <DialogContent>
            <DialogContentText>这将删除包含该公司所有进货表单在内的全部内容，确定吗？</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDeleteThisCompany}>确认删除</Button>
            <Button onClick={this.handleCancelDelete}>取消</Button>
          </DialogActions>
        </Dialog>
        <Button onClick={this.handleNewPurchaseForm}>新建进货表单</Button>
        <h1>全部进货表单</h1>
        <div>
          {company.forms && company.forms.length > 0 ? (
            company.forms.map((form, index) => (
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
                <Button onClick={() => this.handleDeleteForm(index)}>删除表单</Button>
                <Button onClick={() => this.handleExportForm(index)}>导出表单</Button>
              </div>
            ))
          ) : (
            <p>暂无表单。</p>
          )}
        </div>
      </div>
    );
  }
}

export default CompanyDetails;
