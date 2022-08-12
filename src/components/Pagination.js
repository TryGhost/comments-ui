import React, {useContext} from 'react';
import AppContext from '../AppContext';

const Pagination = (props) => {
    const {pagination, dispatchAction} = useContext(AppContext);

    const loadMore = () => {
        dispatchAction('loadMoreComments');
    };

    if (!pagination) {
        return null;
    }

    const left = pagination.total - pagination.page * pagination.limit;

    if (left <= 0) {
        return null;
    }

    return (
        <button className="group w-full text-neutral-700 font-semibold px-0 pt-0 pb-2 mb-10 font-sans text-md text-left dark:text-white flex items-center " onClick={loadMore}>
            <span className="whitespace-nowrap mr-4">↑ Show {left} previous {left === 1 ? 'comment' : 'comments'}</span>
            <span className="transition-[background-color] duration-200 ease-out inline-block w-full bg-neutral-100 group-hover:bg-neutral-200 dark:bg-[rgba(255,255,255,0.05)] rounded h-[3px] mt-[3px]" />
        </button>
    );
};

export default Pagination;
