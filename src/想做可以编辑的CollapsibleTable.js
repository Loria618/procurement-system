import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function EditableCell({ value, onChange }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  return (
    <TableCell onClick={() => setIsEditing(true)}>
      {isEditing ? (
        <input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        value
      )}
    </TableCell>
  );
}

EditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
};

function Row({ row, onRowChange }) {
  const [open, setOpen] = React.useState(false);

  const handleTemplateNameChange = (newTemplateName) => {
    const updatedRow = { ...row, templateName: newTemplateName };
    onRowChange(updatedRow);
  };

  const handleItemChange = (index, key, newValue) => {
    const updatedItems = row.templateContents.map((item, i) =>
      i === index ? { ...item, [key]: newValue } : item
    );
    const updatedRow = { ...row, templateContents: updatedItems };
    onRowChange(updatedRow);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <EditableCell value={row.templateName} onChange={handleTemplateNameChange} />
        <TableCell align="right">{row.templateContents.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                商品详情
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>商品名称</TableCell>
                    <TableCell align="right">商品价格</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.templateContents.map((item, index) => (
                    <TableRow key={index}>
                      <EditableCell
                        value={item.name}
                        onChange={(newValue) => handleItemChange(index, 'name', newValue)}
                      />
                      <EditableCell
                        value={item.price.toFixed(2)}
                        onChange={(newValue) => handleItemChange(index, 'price', parseFloat(newValue))}
                        align="right"
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    templateName: PropTypes.string.isRequired,
    templateContents: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
  }).isRequired,
  onRowChange: PropTypes.func.isRequired,
};

export default function CollapsibleTable({ templates, onTemplatesChange = () => { } }) {
  const handleRowChange = (index, updatedRow) => {
    const updatedTemplates = templates.map((template, i) =>
      i === index ? updatedRow : template
    );
    onTemplatesChange(updatedTemplates);
  };

  return (
    <TableContainer component={Paper} className="table-container">
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>模板标题</TableCell>
            <TableCell align="right">商品个数</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((template, index) => (
            <Row key={index} row={template} onRowChange={(updatedRow) => handleRowChange(index, updatedRow)} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CollapsibleTable.propTypes = {
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      templateName: PropTypes.string.isRequired,
      templateContents: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,
  onTemplatesChange: PropTypes.func.isRequired,
};
