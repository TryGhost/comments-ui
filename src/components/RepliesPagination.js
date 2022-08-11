import React from 'react';

const RepliesPagination = (props) => {
    const loadMore = props.loadMore;
    const count = props.count;

    return (
        <button className="group w-full text-neutral-700 font-semibold mt-10 sm:mt-0 mb-10 font-sans text-md text-left dark:text-white flex items-center " onClick={loadMore}>
            <span className="whitespace-nowrap mr-4">↓ Show {count} more replies</span>
            {/* <span className="transition-[background-color] duration-200 ease-out inline-block w-full bg-neutral-100 dark:bg-[rgba(255,255,255,0.08)] group-hover:bg-neutral-200 rounded h-[2px] mt-[3px]" /> */}
        </button>
    );
};

export default RepliesPagination;
