import React, { useState } from 'react';
import { useTable } from 'react-table';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import db from './db';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import DeleteIcon from '@mui/icons-material/Delete';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function TemplateForm({ onBack, onTemplatesUpdated }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [items, setItems] = useState([]);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);

  const handleAddItem = () => {
    if (!itemName || !itemPrice) {
      setOpenAddItemDialog(true);
    } else {
      setItems([...items, { name: itemName, price: itemPrice }]);
      setItemName('');
      setItemPrice('');
    }
  };  

  const columns = React.useMemo(
    () => [
      {
        Header: '商品名称',
        accessor: 'name',
      },
      {
        Header: '单价',
        accessor: 'price',
      },
      // 可以在这里添加更多列，比如操作列用于编辑和删除
    ],
    []
  );

  const data = React.useMemo(() => items, [items]);

  const tableInstance = useTable({ columns, data });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  const [templateName, setTemplateName] = useState('');

  const [openDialog, setOpenDialog] = useState(false);

  const isAllItemsValie = items.every((item) => item.name && item.price);

  const handleSaveAttempt = async () => {
    const existingTemplate = await db.templates.get(templateName);
    if (!templateName) {
      setOpenDialog(true);
      return;
    }
    if (existingTemplate) {
      setOpenDialog(true);
      return;
    } else if (items.length === 0){
      setOpenAddItemDialog(true);
      return;
    } else {
      await handleSaveConfirm();
    }
  };


  const handleSaveConfirm = async () => {
    if (templateName) {
      if (!isAllItemsValie) {
        setOpenAddItemDialog(true);
        return;
      }
      try {
        await db.templates.put({ name: templateName, items: items });
        alert('已保存模板！');
        setTemplateName(''); // 清空模板名称输入
        setOpenDialog(false); // 关闭对话框
        if (typeof onTemplatesUpdated === 'function') {
          onTemplatesUpdated(); // 重新获取模板列表
        }
        if (typeof onBack === 'function') {
          onBack(); // 返回到CreatePurchaseForm页面
        }
      } catch (error) {
        console.error('保存模板时出错:', error);
        alert('保存失败！');
        setOpenDialog(false); // 发生错误时也关闭对话框
      }
    }   
  };
  
  

  const handleDeleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };  

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
  
    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
  
    setItems(newItems);
  };

  return (
    <div>
      <h2>新建通用模板</h2>
      <div>
        <label>模板名称：</label>
        <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
        <Button variant="outlined" onClick={handleSaveAttempt}>保存</Button>
        <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            {(!templateName) ? (
                <React.Fragment>
                    <DialogTitle id="alert-dialog-title">{"未填入模板名称"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            请填入模板名称。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} autoFocus>好的</Button>
                    </DialogActions>
                </React.Fragment>
            ) : (
              <React.Fragment>
                  <DialogTitle id="alert-dialog-title">{"已存在相同的模板名称"}</DialogTitle>
                  <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                          已存在同名模板，原有模板将被覆盖。你确定要继续吗？
                      </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={() => setOpenDialog(false)} autoFocus>取消</Button>
                      <Button onClick={handleSaveConfirm}>
                          确定
                      </Button>
                  </DialogActions>
              </React.Fragment>
          )}
        </Dialog>
      </div>
      <div>
        <label>商品名称：</label>
        <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} />
        <label>单价：</label>
        <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
        <Button
          component="label"
          tabIndex={-1}
          variant="outlined"
          onClick={handleAddItem}
          startIcon={<AddShoppingCartIcon />}
        >
          添加商品
        </Button>
        <Dialog
          open={openAddItemDialog}
          onClose={() => setOpenAddItemDialog(false)}
          aria-labelledby="alert-dialog-add-item-title"
          aria-describedby="alert-dialog-add-item-description"
        >
          <DialogTitle id="alert-dialog-add-item-title">{"商品名称和单价不可留空"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-add-item-description">
              请输入商品名称和单价。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddItemDialog(false)} autoFocus>好的</Button>
          </DialogActions>
        </Dialog>
      </div>
      



      <DragDropContext onDragEnd={onDragEnd}>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <Droppable droppableId="droppable">
            {(provided) => ( // 确保在这里使用provided参数
              <tbody {...getTableBodyProps()} ref={provided.innerRef} {...provided.droppableProps}>
                {rows.map((row, index) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          {row.cells.map(cell => {
                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                          })}
                          <td>
                            <Button 
                              variant="outlined" 
                              startIcon={<DeleteIcon />} 
                              onClick={() => handleDeleteItem(index)}
                            >
                              删除
                            </Button>
                          </td>
                        </tr>
                      )}
                  )}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
    </div>
  );
}

export default TemplateForm;
