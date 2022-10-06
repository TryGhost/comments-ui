import React from 'react';

const RepliesPagination = ({loadMore, count}) => {
    return (
        <div className="flex w-full items-center justify-start">
            <button type="button" className="group ml-[48px] mb-10 flex w-auto items-center px-0 pt-0 pb-2 text-left font-sans text-md font-semibold text-neutral-700 dark:text-white sm:mb-12 " onClick={loadMore} data-testid="reply-pagination-button">
                <span className="flex h-[39px] w-auto items-center justify-center whitespace-nowrap rounded-[6px] bg-[rgba(0,0,0,0.05)] py-2 px-4 text-center font-sans text-sm font-semibold text-neutral-700 outline-0 transition-[opacity,background] duration-150 hover:bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.08)] dark:text-neutral-100 dark:hover:bg-[rgba(255,255,255,0.1)]">↓ Show {count} more {count === 1 ? 'reply' : 'replies'}</span>
            </button>
        </div>
    );
};

export default RepliesPagination;
