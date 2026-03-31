import React, {useState, useEffect, useContext } from 'react'
import {assets} from '../../assets/assets'
import { AppContext} from '../../context/AppContext.jsx'

const SearchBar = ({data}) => {

    const {navigate}= useContext(AppContext);
    const [input, setInput]= useState(data ? data : '');

    const onSearchHandler= (e)=>{
        e.preventDefault();
        const val= input.trim();
        navigate('/course-list/' + val);
    }

  return (
        <form className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm w-full overflow-hidden" onSubmit={onSearchHandler}>
            <img src={assets.search_icon} alt="Search Icon" className='w-5 h-5 ml-4 opacity-70'/>
            <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder="Search courses, topics, or mentors" className='flex-1 px-4 py-3.5 outline-none text-slate-700 text-sm sm:text-base'/>
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 sm:px-7 py-3.5 font-semibold transition-colors text-sm sm:text-base">Search</button>
        </form>
  )
}

export default SearchBar