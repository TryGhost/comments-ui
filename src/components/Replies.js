import { useContext } from 'react';
import AppContext from '../AppContext';
import Comment from './Comment';
import RepliesPagination from './RepliesPagination';

const Replies = (props) => {
    const comment = props.comment;
    const {dispatchAction} = useContext(AppContext);

    const repliesLeft = comment.count.replies - comment.replies.length - (comment.appendedReplies?.length ?? 0);

    const loadMore = () => {
        dispatchAction('loadMoreReplies', comment);
    };

    return (
        <div>
            {comment.replies.map((reply => <Comment comment={reply} parent={comment} key={reply.id} isReply={true} />))}
            {repliesLeft > 0 && <RepliesPagination count={repliesLeft} loadMore={loadMore}/>}
            {/* When we post a reply, and still need to show pagination above it */}
            {(comment.appendedReplies ?? []).map((reply => <Comment comment={reply} parent={comment} key={reply.id} isReply={true} />))}
        </div>
    );
};

export default Replies;
