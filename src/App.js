import React from 'react';
import MainPage from './MainPage'; 
import './styles.css';

/*
2024.5.29 要在查看订单界面中添加一键展开和折叠所有订单的按钮
要在查看订单界面增加生成长截图功能
查看订单选择日期时月份和日期改成中国格式
2024.5.26 第一次打包成apk
两个表单在手机页面上显示不全，特别是CompanyDetails中创建订单时无法显示商品名称。
找不到导出JSON文件的路径。
需要添加公司和供应商的删除功能。
删除订单前应该有确认提示框。
日历的边框很奇怪。
需要给按钮添加样式。
需要修改App Logo和App Name。

done 2024.5.26 MainPage导入JSON文件至空database时，无法显示导入数据的数量。
2024.3.9
MainPage初始显示三家公司（名称可编辑），点击公司之后是新建供货公司和新建表单的选项。并且可以添加新的采购公司。
新建采购表单的日期为当前日期的后一天，并且生成唯一id，方便后续查找。
MainPage可以显示日历，点击日历中的日期可以显示当天所有采购公司的采购订单（初始折叠，点击可展开），并计算每家采购公司的所要支出的总价和所有采购公司的支出总价。
供货公司详情界面增加返回按钮，增加公司信息编辑功能。
2024.3.6
需要修复：
新建进货表单时如果没选择模板直接保存也可以成功
3.23 done 在公司详情页面一次删除多个表单时只删除一个表单
3.6 done  通用模板的单价应该只能输入数字
3.6 done  从公司新建进货表单时就算已经有通用模板也提示没有
3.6 done  添加模板时如果填了模板名称但没填商品和单价也能保存
3.6 done  添加进货表单中的数量不能为空的检查
2024.3.3
需要修复：
CreatePurchaseForm.js中的onBack无法正常工作（两处）
3.6 done  添加模板名称不能为空的检查  
3.6 done  添加公司不能为空的检查     
3.6 done  添加商品名称、单价、模板名称不能为空的检查
需要添加功能：
CreatePurchaseForm.js中的表单需要有商品和单价的编辑功能
3.23 done CompanyDetails.js中删除表单后刷新页面
3.23 done CompanyDetails.js中成功创建表单返回后刷新页面
3.6 done  应该在公司详情页增加删除公司信息的按钮    
3.6 done  CompanyInfo.js中保存公司信息成功后的跳转：onSaveSuccess             (但是简单粗暴的刷新)
3.6 done  CompanyInfo.js中跳转到同名公司详情页面的逻辑：handleEditExisting   
需要将所有提示框换成模态对话框（@mui）
需要为各个模块添加css标签
*/

function App() {
  return (
    <div className="App">
      <MainPage />
    </div>
  );
}

export default App;
