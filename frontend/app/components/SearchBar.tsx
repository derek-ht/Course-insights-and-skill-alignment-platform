import React, { ChangeEvent, useEffect, useState } from 'react'
import { Search } from 'lucide-react';
import { Input } from './ui/input';

const DELAY = 350;

const SearchBar = ({ searchPlaceholder, onInputChange }: SearchInput) => {
  const [search, setSearch] = useSearchDebounce();
  useEffect(() => {
    if (search != null) {
      onInputChange(search);
    }
  }, [search]);

  return (
    <>
      <div className="w-[20rem] md:w-[30rem] relative">
        <Input
          className="pl-10 py-5 text-sm md:text-md"
          placeholder={searchPlaceholder}
          onChange={(e: any) => setSearch(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              onInputChange && onInputChange(e.target.value);
            }
          }}
        />
        <Search className="absolute bottom-2 left-2 text-slate-300" />
      </div>
    </>
  )
}

/*** 
 *  This code limits the number of rerenders on a change event
 *  Author: Hiren Bhut
 *  https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
 */
const useSearchDebounce = (delay = DELAY) => {
  const [search, setSearch] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<any>(null);

  useEffect(() => {
    // Set a delay after the setSearch
    const delayFn = setTimeout(() => setSearch(searchQuery), delay);
    return () => clearTimeout(delayFn);
  }, [searchQuery, delay]);

  return [search, setSearchQuery];
}

interface SearchInput {
  searchPlaceholder: string,
  onInputChange: CallableFunction,
}


export default SearchBar;