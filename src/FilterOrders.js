import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { zhCN } from 'date-fns/locale';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import Stack from '@mui/material/Stack';
import db from './db';
import CollapsibleOrder from './CollapsibleOrder';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Button from '@mui/material/Button';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

dayjs.extend(customParseFormat);

const localeText = {
  cancelButtonLabel: '取消',
  okButtonLabel: '确认',
  datePickerToolbarTitle: '选择日期'
};

const FilterOrders = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [totalAmountForSelectedDate, setTotalAmountForSelectedDate] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allCompanies = await db.companies.toArray();
        let allOrders = [];
        allCompanies.forEach(company => {
          if (company.orders && company.orders.length > 0) {
            allOrders = allOrders.concat(company.orders);
          }
        });

        if (selectedDate) {
          const filteredOrders = allOrders.filter(order =>
            dayjs(order.orderEffective, 'YY-MM-DD').isSame(dayjs(selectedDate), 'day')
          );
          setOrders(filteredOrders);
          console.log("Filtered Orders: ", filteredOrders);
          const totalAmount = filteredOrders.reduce((sum, order) => {
            const orderTotalPrice = parseFloat(order.orderTotalPrice || 0);
            return sum + orderTotalPrice;
          }, 0);
          console.log("Total Amount for Selected Date: ", totalAmount);
          setTotalAmountForSelectedDate(totalAmount.toFixed(2));
          if (filteredOrders.length === 0) {
            setMessage('所选日期无订单。');
          } else {
            setMessage('');
          }
        } else {
          setOrders(allOrders);
          if (allOrders.length === 0) {
            setMessage('暂未创建任何订单。');
          } else {
            setMessage('');
          }
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setMessage('获取订单失败。');
      }
    };
    fetchOrders();
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDeleteOrder = () => {
    // No operation
  };

  const handleBackToMainPage = () => {
    window.location.reload();
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN} localeText={localeText}>
      <Stack spacing={3}>
        <MobileDatePicker
          label="选择日期"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} />}
        />
      </Stack>
      <div>
        <Button onClick={handleBackToMainPage} startIcon={<HomeRoundedIcon />}>返回首页</Button>
      </div>
      {selectedDate && (
        <div align="right">
          <p>选择日期： {dayjs(selectedDate).format('YY-MM-DD')}</p>
          <p>订单总金额：{totalAmountForSelectedDate}</p>
        </div>
      )}
      {message ? (
        <p>{message}</p>
      ) : (
          <CollapsibleOrder orders={orders} handleDeleteOrder={handleDeleteOrder} showDeleteButton={false} />
      )}
    </LocalizationProvider>
  );
};

export default FilterOrders;