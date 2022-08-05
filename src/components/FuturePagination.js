import React, {useContext} from 'react';
import AppContext from '../AppContext';

const RepliesPagination = (props) => {
    const {futurePagination: pagination, dispatchAction} = useContext(AppContext);

    const loadMore = () => {
        dispatchAction('loadFutureComments');
    };

    if (!pagination) {
        return null;
    }

    const left = pagination.total - pagination.page * pagination.limit;

    if (left <= 0) {
        return null;
    }

    return (
        <button className="group w-full text-neutral-700 font-semibold px-0 pt-0 pb-3 mt-10 sm:mt-0 mb-10 font-sans text-md text-left dark:text-white flex items-center " onClick={loadMore}>
            <span className="whitespace-nowrap mr-4">↓ Show {left} next comments</span>
            <span className="transition-[background-color] duration-200 ease-out inline-block w-full bg-neutral-100 dark:bg-[rgba(255,255,255,0.08)] group-hover:bg-neutral-200 rounded h-[2px] mt-[3px]" />
        </button>
    );
};

export default RepliesPagination;
