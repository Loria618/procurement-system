import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ExportButton = ({ db }) => {
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogContent, setDialogContent] = useState('');
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [isCordovaReady, setIsCordovaReady] = useState(false);

    useEffect(() => {
        if (window.location.protocol === 'file:') {
            document.addEventListener('deviceready', () => {
                setIsCordovaReady(true);
            }, false);
        } else {
            setIsCordovaReady(true); // To allow testing in web environment
        }
    }, []);

    const handleCloseDialog = () => {
        setOpenSuccessDialog(false);
    };

    const requestStoragePermission = () => {
        return new Promise((resolve, reject) => {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.permissions) {
                const permissions = window.cordova.plugins.permissions;
                permissions.requestPermission(
                    permissions.WRITE_EXTERNAL_STORAGE,
                    (status) => {
                        if (status.hasPermission) {
                            resolve(true);
                        } else {
                            reject(new Error('无访问权限'));
                        }
                    },
                    (error) => {
                        reject(error);
                    }
                );
            } else {
                resolve(true);
            }
        });
    };

    const handleExportJSON = async () => {
        if (!isCordovaReady && window.location.protocol === 'file:') {
            console.warn('Cordova is not ready');
            setDialogTitle('Export Failed');
            setDialogContent('Cordova is not ready or not available.');
            setOpenSuccessDialog(true);
            return;
        }

        try {
            await requestStoragePermission();

            const companies = await db.companies.toArray();
            const suppliers = await db.suppliers.toArray();

            console.log('Exporting companies:', companies);
            console.log('Exporting suppliers:', suppliers);

            const data = { companies, suppliers };
            const dataStr = JSON.stringify(data, null, 2);
            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
            const filename = `data_${timestamp}.json`;

            if (window.cordova) {
                window.resolveLocalFileSystemURL(window.cordova.file.externalDataDirectory, (dir) => {
                    dir.getFile(filename, { create: true }, (file) => {
                        file.createWriter((fileWriter) => {
                            fileWriter.write(dataStr);
                            setDialogTitle('导出成功');
                            setDialogContent(`已成功导出 ${companies.length} 条公司数据和 ${suppliers.length} 条供应商数据`);
                            setOpenSuccessDialog(true);
                        });
                    });
                });
            } else {
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                setDialogTitle('导出成功');
                setDialogContent(`已成功导出 ${companies.length} 条公司数据和 ${suppliers.length} 条供应商数据`);
                setOpenSuccessDialog(true);
            }
        } catch (error) {
            console.error('Error exporting JSON:', error);
            setDialogTitle('导出失败');
            setDialogContent(`导出数据时发生错误：${error.message}`);
            setOpenSuccessDialog(true);
        }
    };

    return (
        <div>
            <Button className="json-btn" onClick={handleExportJSON}>
                导出已有文件
            </Button>
            <div>
                <Dialog open={openSuccessDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{dialogContent}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button className="confirm-btn" onClick={handleCloseDialog} autoFocus>好的</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default ExportButton;