import React, { useState, useEffect } from 'react';
import SupplierInfo from './SupplierInfo';
import SupplierDetails from './SupplierDetails';
import CompanyInfo from './CompanyInfo';
import CompanyDetails from './CompanyDetails';
import db from './db';
// styling
import './styles.css';
import Button from '@mui/material/Button';

const MainPage = () => {
  const [showSupplierInfo, setShowSupplierInfo] = useState(false);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchCompanies();
    fetchSuppliers();
  }, [companies, suppliers]);

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
          <div>
            {companies.map((company) => (
              <Button
                key={company.name}
                className="company-btn"
                onClick={() => handleCompanyClick(company.name)}
              >
                {company.name}
              </Button>
            ))}
          </div>
          <div>
            {suppliers.map((supplier) => (
              <Button
                key={supplier.name}
                className="supplier-btn"
                onClick={() => handleSupplierClick(supplier.name)}               
              >
                {supplier.name}
              </Button>              
            ))}
          </div>
          <div>
            <Button className="new-btn" onClick={handleNewCompany}>新建公司信息</Button>
            <br /><br />
          </div>
          <div>
            <Button className="new-btn" onClick={handleNewSupplier}>新建供应商信息</Button>
            <br /><br />
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