import { useState } from "react";

export default function ExpenseForm() {
  // form data
  const [formData, setFormData] = useState({
    balance: "1000",
    description: "",
    amount: "",
    category: "",
  });

  const [expenses, setExpenses] = useState([]);
const[toggle, setToggle] = useState(false);
  // handle form form data changes
  const handleFormChanges = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // add expenses button
  const addExpense = (e) => {
    e.preventDefault();
    setExpenses([...expenses, formData]);

    // reset formData
    setFormData({
      balance: "1000",
      description: "",
      amount: "",
      category: "",
    });

    setToggle(true);
  };

  const handleToggle = () => {
    setToggle(prevToggle => !prevToggle)
  }
  
  return (
    <>
      <form className="flex flex-col items-center justify-center w-full px-2">
        {/* starting balance UI */}
        <div className="border border-zinc-100 text-center w-full max-w-md px-4 py-6 rounded-md shadow-sm">
          <label className="uppercase text-zinc-500 text-sm text-left mb-2 block font-medium">
            set starting balance ($)
          </label>
          <input
            name="balance"
            type="text"
            value={formData.balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            onChange={handleFormChanges}
            className="w-full py-3 px-2 rounded-md bg-neutral-100 border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
          />
        </div>

        {/* description, amount and category */}
        <div className="border border-zinc-100 text-center w-full max-w-md px-4 py-6 rounded-md shadow-sm mt-6">
          <div>
            <label className="uppercase text-zinc-500 text-sm text-left mb-2 block font-medium">
              description
            </label>
            <input
              placeholder="e.g. Lunch"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleFormChanges}
              className="w-full py-3 px-2 rounded-md bg-neutral-100 border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          {/* amount */}
          <div className="mt-6">
            <label className="uppercase text-zinc-500 text-sm text-left mb-2 block font-medium">
              amount
            </label>
            <input
              placeholder="10.00"
              name="amount"
              type="text"
              value={formData.amount}
              onChange={handleFormChanges}
              className="w-full py-3 px-2 rounded-md bg-neutral-100 border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          {/* category select */}
          <div className="mt-6">
            <label className="uppercase text-zinc-500 text-sm text-left mb-2 block font-medium">
              category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleFormChanges}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:outline-none bg-neutral-100"
            >
              <option value="Food">Food</option>
              <option value="Health">Health</option>
              <option value="School">School</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          {/* button to add expenses */}
          <div className="mt-7">
            <button
            type="button"
              onClick={addExpense}
              className="bg-blue-600 text-white p-2 font-medium w-full cursor-pointer hover:bg-blue-700 duration-300 transition-all capitalize rounded-md text-sm flex items-center justify-center"
            >
              <i className="bx bx-plus-circle mr-2 text-xl"></i>
              Add Expense
            </button>
          </div>
        </div>
      </form>
      {/* display section */}
      {toggle && <section className="text-center my-4 flex flex-col rounded-sm border border-green-200 w-120 mx-auto bg-green-100 px-7 py-10">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="capitalize text-green-700 font-medium">
              starting balance
            </p>
            <p className="capitalize text-green-700 font-medium">{formData.balance}</p>
          </div>
          <div className="flex items-center justify-between border-b mb-5 border-green-500">
            <p className="capitalize text-green-700 font-medium">
              total expenses
            </p>
            <p className="capitalize text-red-700 font-medium"> -$15.50</p>
          </div>

          {/* remaining balance and co */}

          <div className="flex items-center justify-between">
            <p className="uppercase text-green-700 font-medium text-xl">
              remaining balance
            </p>
            <p className="capitalize text-green-700 font-bold text-3xl">
              $1,000
            </p>
          </div>
          {/* spending items and others */}

          <div className="flex items-center justify-between mt-7 border-green-500">
      <p className="capitalize text-green-700 font-medium flex items-center"><i class="bx bx-fork-spoon mr-1 align-middle text-center" />{formData.category}</p>
      <p className="capitalize text-green-700 font-medium"> $12.00</p>
      </div>

      <div className="flex items-center justify-between  border-green-500">
      <p className="capitalize text-green-700 font-medium flex items-center"><i class="bx bx-taxi mr-1 align-middle text-center" />transport</p>
      <p className="capitalize text-green-700 font-medium"> $3.00</p>
      </div>
        </div>
      </section>}
    </>
  );
}
