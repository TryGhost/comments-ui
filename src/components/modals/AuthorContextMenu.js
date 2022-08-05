import React, {useContext} from 'react';
import AppContext from '../../AppContext';

const AuthorContextMenu = (props) => {
    const {dispatchAction} = useContext(AppContext);

    const deleteComment = (event) => {
        dispatchAction('deleteComment', props.comment);
        props.close();
    };

    const copyLink = (event) => {
        const url = new URL(window.location);
        url.hash = '#comment-' + props.comment.id;
        navigator.clipboard.writeText(url.toString());
        props.close();
    };

    return (
        <div className="flex flex-col">
            <button className="w-full mb-3 text-left text-[14px]" onClick={props.toggleEdit} disabled={props.disableEditing}>
                Edit
            </button>
            <button className="w-full mb-3 text-left text-[14px] text-red-600" onClick={deleteComment}>
                Delete
            </button>
            <button className="w-full text-left text-[14px]" onClick={copyLink}>
                Copy link
            </button>
        </div>
    );
};

export default AuthorContextMenu;
