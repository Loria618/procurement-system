import React, { useState, useEffect, useRef } from 'react';
import SupplierInfo from './SupplierInfo';
import SupplierDetails from './SupplierDetails';
import CompanyInfo from './CompanyInfo';
import CompanyDetails from './CompanyDetails';
import db from './db';
// styling
import './styles.css';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

const MainPage = () => {
  const [companies, setCompanies] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierInfo, setShowSupplierInfo] = useState(false);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [openCompanyMenu, setOpenCompanyMenu] = useState(false);
  const [openSupplierMenu, setOpenSupplierMenu] = useState(false);
  const companyAnchorRef = useRef(null);
  const supplierAnchorRef = useRef(null);


  useEffect(() => {
    fetchCompanies();
    fetchSuppliers();
  }, []);

  const fetchCompanies = async () => {
    const allCompanies = await db.companies.toArray();
    setCompanies(allCompanies);
  };

  const fetchSuppliers = async () => {
    const allSuppliers = await db.suppliers.toArray();
    setSuppliers(allSuppliers);
  };

  const handleNewSupplier = () => {
    console.log('New supplier form clicked')
    setShowSupplierInfo(true);
    setShowSupplierDetails(false);
    setShowCompanyForm(false);
    setShowCompanyDetails(false);
  };

  const handleNewCompany = () => {
    console.log('New company form clicked');
    setShowCompanyForm(true);
    setShowSupplierInfo(false);
    setShowSupplierDetails(false);
    setShowCompanyDetails(false);
  };

  const handleCompanyClick = async (companyName) => {
    const company = await db.companies.get(companyName);
    console.log('Selected company:', companyName);
    setSelectedCompany(company);
    setShowCompanyDetails(true);
    setShowCompanyForm(false);
    setShowSupplierInfo(false);
    setShowSupplierDetails(false);
  };

  const handleSupplierClick = async (supplierName) => {
    const supplier = await db.suppliers.get(supplierName);
    console.log('Selected supplier:', supplierName);
    setSelectedSupplier(supplier);
    setShowSupplierDetails(true);
    setShowCompanyDetails(false);
    setShowCompanyForm(false);
    setShowSupplierInfo(false);
  };

  const toggleCompanyMenu = () => {
    setOpenCompanyMenu((prevOpen) => !prevOpen);
  };

  const toggleSupplierMenu = () => {
    setOpenSupplierMenu((prevOpen) => !prevOpen);
  };

  const handleClose = (event, menuType) => {
    if (menuType === 'company' && companyAnchorRef.current && companyAnchorRef.current.contains(event.target)) {
      return;
    } else if (menuType === 'supplier' && supplierAnchorRef.current && supplierAnchorRef.current.contains(event.target)) {
      return;
    }
    if (menuType === 'company') {
      setOpenCompanyMenu(false);
    } else {
      setOpenSupplierMenu(false);
    }
  };

  function getContent() {
    if (showSupplierInfo) {
      return <SupplierInfo />;
    } else if (showCompanyForm) {
      return <CompanyInfo />;
    } else if (showCompanyDetails && selectedCompany) {
      return <CompanyDetails company={selectedCompany} onUpdate={fetchCompanies} />;
    } else if (showSupplierDetails && selectedSupplier) {
      return <SupplierDetails supplier={selectedSupplier} onUpdate={fetchSuppliers} />;
    } else {
      return (
        <div>
          <h1>欢迎来到进货账单系统</h1>
          <div className="button-container">
            <div className="button-wrapper">
              {companies.length > 0 && (
                <>
                  <ButtonGroup variant="contained" ref={companyAnchorRef} aria-label="company selection">
                    <Button onClick={toggleCompanyMenu}
                      size="medium"
                      aria-controls={openCompanyMenu ? 'company-menu' : undefined}
                      aria-expanded={openCompanyMenu ? 'true' : undefined}
                      aria-haspopup="menu"
                      className="button-group"
                      endIcon={<ArrowDropDownIcon />}>
                      {"选择公司"}
                    </Button>
                  </ButtonGroup>
                  <Popper open={openCompanyMenu} anchorEl={companyAnchorRef.current} role={undefined} transition disablePortal className="popper">
                    {({ TransitionProps, placement }) => (
                      <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                        <Paper>
                          <ClickAwayListener onClickAway={(event) => handleClose(event, 'company')}>
                            <MenuList>
                              {companies.map((company) => (
                                <MenuItem key={company.companyName} onClick={() => handleCompanyClick(company.companyName)} className="menu-item">
                                  {company.companyName}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </>
              )}
            </div>
            <div className="button-wrapper">
              {suppliers.length > 0 && (
                <>
                  <ButtonGroup variant="contained" ref={supplierAnchorRef} aria-label="supplier selection">
                    <Button onClick={toggleSupplierMenu}
                      size="medium"
                      aria-controls={openSupplierMenu ? 'supplier-menu' : undefined}
                      aria-expanded={openSupplierMenu ? 'true' : undefined}
                      aria-haspopup="menu"
                      className="button-group"
                      endIcon={<ArrowDropDownIcon />}>
                      {"选择供应商"}
                    </Button>
                  </ButtonGroup>
                  <Popper open={openSupplierMenu} anchorEl={supplierAnchorRef.current} role={undefined} transition disablePortal className="popper">
                    {({ TransitionProps, placement }) => (
                      <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                        <Paper>
                          <ClickAwayListener onClickAway={(event) => handleClose(event, 'supplier')}>
                            <MenuList>
                              {suppliers.map((supplier) => (
                                <MenuItem key={supplier.supplierName} onClick={() => handleSupplierClick(supplier.supplierName)} className="menu-item">
                                  {supplier.supplierName}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </>
              )}
            </div>
          </div>
          <div className="button-container">
            <ButtonGroup variant="outlined" aria-label="outlined button group">
              <div>
                <Button className="new-btn" onClick={handleNewCompany}>新建公司信息</Button>
              </div>
              <div>
                <Button className="new-btn" onClick={handleNewSupplier}>新建供应商信息</Button>
              </div>
            </ButtonGroup>
          </div>
        </div>
      );
    }
  }

  return (
    <div className='main-page'>
      {getContent()}
    </div>
  );
}

export default MainPage;