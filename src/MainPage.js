import React from 'react';
import TemplateForm from './TemplateForm';
import CompanyInfo from './CompanyInfo';
import CompanyDetails from './CompanyDetails';
import db from './db';

import Button from '@mui/material/Button';

class MainPage extends React.Component {
  state = {
    showTemplateForm: false,
    showCompanyForm: false,
    showCompanyDetails: false,
    selectedCompany: null,
    companies: [],
  };

  componentDidMount() {
    this.fetchCompanies();
  }

  fetchCompanies = async () => {
    const allCompanies = await db.companies.toArray();
    this.setState({ companies: allCompanies });
  };

  handleNewTemplate = () => {
    this.setState({ showTemplateForm: true, showCompanyForm: false, showCompanyDetails: false });
  };

  handleNewCompany = () => {
    this.setState({ showCompanyForm: true, showTemplateForm: false, showCompanyDetails: false });
  };

  handleCompanyClick = async (companyName) => {
    const company = await db.companies.get(companyName);
    this.setState({ selectedCompany: company, showCompanyDetails: true, showTemplateForm: false, showCompanyForm: false });
  };

  render() {
    const { showTemplateForm, showCompanyForm, showCompanyDetails, selectedCompany, companies } = this.state;

    return (
      <div>
        {showTemplateForm ? (
          <TemplateForm />
        ) : showCompanyForm ? (
          <CompanyInfo />
        ) : showCompanyDetails && selectedCompany ? (
          <CompanyDetails company={selectedCompany} />
        ) : (
          <div>
            <h1>欢迎来到进货账单系统</h1>
            <div>
            <Button variant="contained" onClick={this.handleNewTemplate}>新建通用模板</Button>
            <br /><br />
            </div>
            <div>
            <Button variant="contained" onClick={this.handleNewCompany}>新建公司信息</Button>
            <br /><br />
            </div>
            <div>
                {companies.map((company) => (
                    <Button 
                    key={company.name}
                    className="company-btn" 
                    onClick={() => this.handleCompanyClick(company.name)}
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
}

export default MainPage;
