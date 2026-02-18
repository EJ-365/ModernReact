import React from 'react'

export default function Cards({item, toggle}) {
  return (
    <div className={` ${toggle && "bg-white/80"} md:w-90 w-full min-h-[350px] flex flex-col  shadow-md rounded-md p-10 mb-4`}>
        <h2 className='text-lg font-semibold'>{item.question}</h2>
        {/* <p>{item.answer}</p> */}
        <ul>
           {item.options.map((item, index) => (
            <li className=' p-2 rounded shadow-sm my-3 border-gray-100 border cursor-pointer hover:bg-gray-100 active:bg-gray-100'
            key={index}>{item}</li>
           ))}
        </ul>
    <div className='mt-auto  text-center pt-4 '>
        <small className='align-bottom italic text-gray-400 '>hover to flip</small>
    </div>
    </div>
  )
}
