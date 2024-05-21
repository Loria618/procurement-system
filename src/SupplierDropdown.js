import React, { useState } from 'react';
import { Menu, MenuItem, Button, List, ListItem, ListItemText, Collapse, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const SupplierDropdown = ({ suppliers, onSelectSupplier, onSelectTemplate }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [open, setOpen] = useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (supplier) => {
        setSelectedSupplier(supplier);
        onSelectSupplier(supplier);
        setOpen(true);
        handleClose();
    };

    const handleCollapseClick = () => {
        setOpen(!open);
    };

    const handleTemplateClick = (templateContents) => {
        onSelectTemplate(templateContents);
    };

    if (!Array.isArray(suppliers) || suppliers.length === 0) {
        return <Typography>暂无供应商。请前往创建。</Typography>;
    }

    return (
        <div>
            <Button onClick={handleClick}>选择供应商</Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {suppliers.map((supplier) => (
                    <MenuItem key={supplier.supplierName} onClick={() => handleMenuItemClick(supplier)}>
                        {supplier.supplierName}
                    </MenuItem>
                ))}
            </Menu>
            {selectedSupplier && (
                <div>
                    <ListItem button onClick={handleCollapseClick}>
                        <ListItemText primary={selectedSupplier.supplierName} />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        {selectedSupplier.template && selectedSupplier.template.length > 0 ? (
                            <List component="div" disablePadding>
                                {selectedSupplier.template.map((template, index) => (
                                    <ListItem key={index} sx={{ pl: 4 }}>
                                        <Button variant="contained" color="primary" onClick={() => handleTemplateClick(template.templateContents)}>
                                            {template.templateName}
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>该供应商暂无模板。</Typography>
                        )}
                    </Collapse>
                </div>
            )}
        </div>
    );
};

export default SupplierDropdown;
