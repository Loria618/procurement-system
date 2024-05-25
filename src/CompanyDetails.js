import React, { useState, useEffect } from 'react';
import SupplierDropdown from './SupplierDropdown';
import db from './db';
import CollapsibleOrder from './CollapsibleOrder';
// procurement order
import { v4 as uuidV4 } from 'uuid';
import dayjs from 'dayjs';
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

function createData(name, price, quantity = 1) {
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity, 10);
    return {
        name,
        price: parsedPrice,
        quantity: parsedQuantity,
        totalPrice: parsedPrice * parsedQuantity
    };
}

function CompanyDetails({ company }) {
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
    const [items, setItems] = useState([]);
    const [openCreateOrderDialog, setOpenCreateOrderDialog] = useState(false);
    const [orderTitle, setOrderTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [orders, setOrders] = useState([]);
    const [openDeleOrderDialog, setOpenDeleOrderDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [suppliers, setSuppliers] = useState([]);

    const [editNote, setEditNote] = useState(false);
    const [note, setNote] = useState(company.note);

    const fetchOrders = async () => {
        try {
            const companyData = await db.companies.get(company.companyName);
            if (companyData && Array.isArray(companyData.orders)) {
                setOrders(companyData.orders);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const allSuppliers = await db.suppliers.toArray();
            setSuppliers(allSuppliers);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchSuppliers();
        setNote(company.note);
    }, [company, openSuccessDialog]);

    const handleDeleteOrder = async (uuid) => {
        try {
            const companyData = await db.companies.get(company.companyName);
            if (companyData && Array.isArray(companyData.orders)) {
                const updatedOrders = companyData.orders.filter(order => order.uuid !== uuid);
                await db.companies.update(company.companyName, { orders: updatedOrders });
                setOrders(updatedOrders);
                setOpenDeleOrderDialog(true);
            }
        } catch (error) {
            console.error('Failed to delete order', error);
        }
    };

    const handleAddItem = () => {
        if (!itemName || !itemPrice || !itemQuantity) {
            setOpenAddItemDialog(true);
        } else {
            const newItem = createData(itemName, parseFloat(itemPrice), parseInt(itemQuantity, 10));
            setItems([...items, newItem]);
            setItemName('');
            setItemPrice('');
            setItemQuantity('');
        }
    };

    const handleDeleteItem = (index) => {
        setItems(items.filter((_, idx) => idx !== index));
    };

    const handleCloseDialog = () => {
        if (openCreateOrderDialog) {
            setOpenCreateOrderDialog(false);
        } else if (openAddItemDialog) {
            setOpenAddItemDialog(false);
        } else if (openSuccessDialog) {
            setOpenSuccessDialog(false);
        } else if (openDeleOrderDialog) {
            setOpenDeleOrderDialog(false);
        }
        setErrorMessage("");
    };

    const handleTryToCreateOrder = () => {
        if (items.length === 0) {
            setOpenAddItemDialog(true);
            return;
        }
        const createTime = dayjs(new Date()).format('YY-MM-DD HH:mm:ss');
        const orderEffective = dayjs(new Date()).add(1, 'day').format('YY-MM-DD');

        const orderData = {
            uuid: uuidV4(),
            createTime,
            orderEffective,
            orderTitle: `${orderEffective}-${company.companyName}-${selectedSupplier?.supplierName || "NoSupplier"}`,
            orderContents: items,
            companyName: company.companyName,
            supplierName: selectedSupplier?.supplierName || "",
        };
        handleCreateOrder(orderData);
    };

    const handleCreateOrder = async (orderData) => {
        try {
            const companyData = await db.companies.get(company.companyName);
            if (!companyData) {
                alert("无法找到公司数据！");
                return;
            }
            if (!Array.isArray(companyData.orders)) {
                companyData.orders = [];  // Initialize orders array if it doesn't exist
            }
            const existingOrder = companyData.orders.find(t => t.uuid === orderData.uuid);
            if (existingOrder) {
                setErrorMessage("已存在相同id的订单，请重新创建订单。");
                return;
            }
            setErrorMessage("");
            companyData.orders.push(orderData);  // Add new order to the orders array

            await db.companies.put(companyData);
            console.log("Order created successfully!");
            setOpenSuccessDialog(true);
            setItems([]);
        } catch (error) {
            console.error("Error creating order:", error);
            alert(`创建订单失败！错误信息: ${error.message}`);
        }
    };

    const handleSaveNote = async () => {
        try {
            await db.companies.update(company.companyName, { note });
            setEditNote(false);
            console.log("Note updated successfully!");
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    const handleBackToMainPage = () => {
        window.location.reload();
    };

    const handleSelectTemplate = (templateContents) => {
        const newItems = templateContents.map(item => createData(item.name, item.price, 1));
        setItems(newItems);
    };

    return (
        <div>
            <h2>{company.companyName}进货订单</h2>
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
                <SupplierDropdown
                    suppliers={suppliers}
                    onSelectSupplier={(supplier) => setSelectedSupplier(supplier)}
                    onSelectTemplate={handleSelectTemplate}
                />
            </div>
            <div>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '25ch' },
                    }}
                    noValidate
                    autoComplete="on" // 
                >
                    <TextField type="text" className="item-input" label="商品名称" variant="outlined" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                    <TextField type="number" className="item-input" label="商品价格" variant="outlined" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                    <TextField type="number" className="item-input" label="商品数量" variant="outlined" value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} />
                </Box>
                <Button className="add-item-btn" tabIndex={-1} onClick={handleAddItem} startIcon={<AddShoppingCartIcon />}>添加商品</Button>
                <Dialog open={openAddItemDialog} onClose={() => setOpenAddItemDialog(false)}>
                    <DialogTitle>{"商品名称、单价和数量不可留空"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            请输入商品名称、单价和数量。
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
                                <TableCell className="new-temp-table-cell" align="right" style={{ width: '80px' }}>商品价格</TableCell>
                                <TableCell className="new-temp-table-cell" align="right" style={{ width: '80px' }}>商品数量</TableCell>
                                <TableCell className="new-temp-table-cell" align="right">商品总价</TableCell>
                                <TableCell className="new-temp-table-cell" align="right">删除商品</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="new-temp-table-cell" component="th" scope="row">
                                        <TextField value={item.name} onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[index].name = e.target.value;
                                            setItems(newItems);
                                        }} />
                                    </TableCell>
                                    <TableCell className="new-temp-table-cell" align="right" style={{ width: '100px' }}>
                                        <TextField value={item.price} type="number" onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[index].price = parseFloat(e.target.value);
                                            newItems[index].totalPrice = newItems[index].price * newItems[index].quantity;
                                            setItems(newItems);
                                        }} />
                                    </TableCell>
                                    <TableCell className="new-temp-table-cell" align="right" style={{ width: '100px' }}>
                                        <TextField value={item.quantity} type="number" onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[index].quantity = parseInt(e.target.value, 10);
                                            newItems[index].totalPrice = newItems[index].price * newItems[index].quantity;
                                            setItems(newItems);
                                        }} />
                                    </TableCell>
                                    <TableCell className="new-temp-table-cell" align="right">
                                        {item.totalPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="new-temp-table-cell" align="right">
                                        <Button className='delete-btn' onClick={() => handleDeleteItem(index)} startIcon={<DeleteIcon />} color="error">删除商品</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div>
                    <Button startIcon={<SaveIcon />} onClick={handleTryToCreateOrder}>
                        为{company.companyName}创建进货订单
                    </Button>
                    <Dialog open={openCreateOrderDialog} onClose={handleCloseDialog}>
                        <DialogTitle>为{company.companyName}创建订单</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                订单名称
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="order-title"
                                label="订单名称"
                                type="text"
                                fullWidth
                                variant="standard"
                                value={orderTitle}
                                onChange={(e) => {
                                    setOrderTitle(e.target.value);
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
                            <Button onClick={handleTryToCreateOrder}>创建订单</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openSuccessDialog} onClose={handleCloseDialog}>
                        <DialogTitle>{"创建成功"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>成功为{company.companyName}创建订单。供货商：{selectedSupplier?.supplierName}</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button className="confirm-btn" onClick={handleCloseDialog} autoFocus>好的</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
            <div>
                {orders.length > 0 && (
                    <CollapsibleOrder orders={orders} handleDeleteOrder={handleDeleteOrder} />
                )}
            </div>
            <div>
                <Dialog open={openDeleOrderDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{"删除成功"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>成功删除了订单。</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button className="confirm-btn" onClick={handleCloseDialog} autoFocus>好的</Button>
                    </DialogActions>
                </Dialog>
            </div>
            <div>
                <Button onClick={handleBackToMainPage} startIcon={<HomeRoundedIcon />}>返回首页</Button>
            </div>
        </div>
    );
}

export default CompanyDetails;
