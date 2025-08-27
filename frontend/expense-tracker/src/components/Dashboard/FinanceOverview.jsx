import React from 'react'
import CustomPieChart from '../Charts/CustomPieChart'

const COLORS = ["#875CF5","#FF6900","#FA2C37"]

const FinanceOverview = ({totalBalance,totalIncome,totalExpenses}) => {
    const balanceData = [
        {name:"Total Balance", amount:totalBalance},
        {name:"Total Income", amount:totalIncome},
        {name:"Total Expenses", amount:totalExpenses},
    ]

  return (
    <div className="card">
        <div className="flex items-center justify-between">
            <h5 className="text-lg">Financial Overview</h5>
        </div>
        <CustomPieChart
            data={balanceData}
            label="Total Balance"
            totalAmount={`$${totalBalance}`}
            colors={COLORS}
            showTextAnchor={true}
            />
    </div>
  )
}

export default FinanceOverview