import React from 'react'
import { LuAArrowDown, LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const ExpenseTransactions = ({transactions,onSeeMore}) => {
  return (
    <div className="card">
        <div className="flex justify-between items-center">
            <h5 className="text-lg">Expanses</h5>
            <button className="card-btn" onClick={onSeeMore}>
                See All <LuArrowRight className='text-base'/>
            </button>
        </div>
        <div className="mt-6">
            {transactions?.slice(0,4)?.map((expense)=>(
                 <TransactionInfoCard
                 key={expense._id}
                 title={expense.category}
                 icon={expense.icon}
                 date={moment(expense.date).format("Do MMM YYYY")}
                 amount={expense.amount}
                 type="expense"
                 hideDeleteBtn
                 />
            ))}
        </div>
    </div>
  )
}

export default ExpenseTransactions