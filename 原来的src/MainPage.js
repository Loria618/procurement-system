import React, { useState, useEffect } from 'react';
import TemplateForm from './TemplateForm';
import CompanyInfo from './CompanyInfo';
import CompanyDetails from './CompanyDetails';
import db from './db';

import Button from '@mui/material/Button';

const MainPage = () => {
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const allCompanies = await db.companies.toArray();
    setCompanies(allCompanies);
  };

  const handleNewTemplate = () => {
    setShowTemplateForm(true);
    setShowCompanyForm(false);
    setShowCompanyDetails(false);
  };

  const handleNewCompany = () => {
    setShowCompanyForm(true);
    setShowTemplateForm(false);
    setShowCompanyDetails(false);
  };

  const handleCompanyClick = async (companyName) => {
    const company = await db.companies.get(companyName);
    setSelectedCompany(company);
    setShowCompanyDetails(true);
    setShowTemplateForm(false);
    setShowCompanyForm(false);
  };

  return (
    <div>
      {showTemplateForm ? (
        <TemplateForm />
      ) : showCompanyForm ? (
        <CompanyInfo />
      ) : showCompanyDetails && selectedCompany ? (
        <CompanyDetails company={selectedCompany} onUpdate={fetchCompanies} />
      ) : (
        <div>
          <h1>欢迎来到进货账单系统</h1>
          <div>
            <Button variant="contained" onClick={handleNewTemplate}>新建通用模板</Button>
            <br /><br />
          </div>
          <div>
            <Button variant="contained" onClick={handleNewCompany}>新建公司信息</Button>
            <br /><br />
          </div>
          <div>
            {companies.map((company) => (
              <Button
                key={company.name}
                className="company-btn"
                onClick={() => handleCompanyClick(company.name)}
                style={{ display: 'block', marginBottom: '10px' }}
              >
                {company.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;