import React, {useContext, useState} from 'react';
import {Transition} from '@headlessui/react';
import Avatar from './Avatar';
import Like from './Like';
import Reply from './Reply';
import More from './More';
import Form from './Form';
import Replies from './Replies';
import AppContext from '../AppContext';
import {formatRelativeTime, formatExplicitTime, isCommentPublished} from '../utils/helpers';

function AnimatedComment({comment, parent}) {
    return (
        <Transition
            appear
            show={true}
            enter="transition-opacity duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <EditableComment comment={comment} parent={parent} />
        </Transition>
    );
}

function EditableComment({comment, parent}) {
    const [isInEditMode, setIsInEditMode] = useState(false);

    const closeEditMode = () => {
        setIsInEditMode(false);
    };

    const openEditMode = () => {
        setIsInEditMode(true);
    };

    if (isInEditMode) {
        return (
            <EditForm comment={comment} close={closeEditMode} parent={parent} />
        );
    } else {
        return (<Comment comment={comment} openEditMode={openEditMode} parent={parent} />);
    }
}

function Comment({comment, parent, openEditMode}) {
    const isPublished = isCommentPublished(comment);

    if (isPublished) {
        return (<PublishedComment comment={comment} parent={parent} openEditMode={openEditMode} />);
    }
    return (<UnpublishedComment comment={comment} openEditMode={openEditMode} />);
}

function PublishedComment({comment, parent, openEditMode}) {
    const [isInReplyMode, setIsInReplyMode] = useState(false);
    const {dispatchAction} = useContext(AppContext);

    const toggleReplyMode = async () => {
        if (!isInReplyMode) {
            // First load all the replies before opening the reply model
            await dispatchAction('loadMoreReplies', {comment, limit: 'all'});
        }
        setIsInReplyMode(current => !current);
    };

    const closeReplyMode = () => {
        setIsInReplyMode(false);
    };

    const hasReplies = isInReplyMode || (comment.replies && comment.replies.length > 0);
    const avatar = (<Avatar comment={comment} />);

    return (
        <CommentLayout hasReplies={hasReplies} avatar={avatar}>
            <CommentHeader comment={comment} />
            <CommentBody html={comment.html} />
            <CommentMenu comment={comment} parent={parent} isInReplyMode={isInReplyMode} toggleReplyMode={toggleReplyMode} openEditMode={openEditMode} />

            <RepliesContainer comment={comment} />
            <ReplyForm comment={comment} isInReplyMode={isInReplyMode} closeReplyMode={closeReplyMode} />
        </CommentLayout>
    );
}

function UnpublishedComment({comment, openEditMode}) {
    const {admin} = useContext(AppContext);

    let notPublishedMessage;
    if (admin && comment.status === 'hidden') {
        notPublishedMessage = 'This comment has been hidden.';
    } else {
        notPublishedMessage = 'This comment has been removed.';
    }

    // TODO: consider swapping this with a seperate avatar component
    const blankAvatar = (<Avatar isBlank={true} />);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <CommentLayout hasReplies={hasReplies} avatar={blankAvatar}>
            <div className="flex items-start -mt-[3px] mb-2">
                <div className="flex flex-row items-center gap-4 pb-[8px] pr-4 h-12">
                    <p className="font-sans text-[16px] leading-normal text-neutral-300 dark:text-[rgba(255,255,255,0.5)] italic mt-[4px]">{notPublishedMessage}</p>
                    <div className="mt-[4px]">
                        <More comment={comment} toggleEdit={openEditMode} />
                    </div>
                </div> 
            </div>
            <RepliesContainer comment={comment} />
        </CommentLayout>
    );
}

// Helper components

function MemberBio({comment}) {
    const {member} = useContext(AppContext);
    const memberBio = member && comment.member && comment.member.uuid === member.uuid ? member.bio : comment?.member?.bio;
    
    if (!memberBio) {
        return null;
    }

    return (
        <span>{memberBio}<span className="mx-[0.3em]">·</span></span>
    );
}

function EditedInfo({comment}) {
    if (!comment.edited_at) {
        return null;
    }
    return (
        <span>
            <span className="mx-[0.3em]">·</span>Edited
        </span>
    );
}

function RepliesContainer({comment}) {
    const hasReplies = comment.replies && comment.replies.length > 0;

    if (!hasReplies) {
        return null;
    }

    return (
        <div className="mt-10 mb-4 sm:mb-0">
            <Replies comment={comment} />
        </div>
    );
}

function ReplyForm({comment, isInReplyMode, closeReplyMode}) {
    if (!isInReplyMode) {
        return null;
    }

    return (
        <div className="my-10">
            <Form parent={comment} close={closeReplyMode} isReply={true} />
        </div>
    );
}

function EditForm({comment, parent, close}) {
    return (
        <Form comment={comment} close={close} parent={parent} isEdit={true} />
    );
}

//
// -- Published comment components --
// 

// TODO: move name detection to helper
function AuthorName({comment}) {
    const name = !comment.member ? 'Deleted member' : (comment.member.name ? comment.member.name : 'Anonymous');
    return (
        <h4 className="text-[17px] font-sans font-bold tracking-tight text-[rgb(23,23,23] dark:text-[rgba(255,255,255,0.85)]">
            {name}
        </h4>
    );
}

function CommentHeader({comment}) {
    return (
        <div className="flex items-start -mt-[3px] mb-2">
            <div>
                <AuthorName comment={comment} />
                <div className="flex items-baseline font-sans text-[14px] tracking-tight pr-4 text-neutral-400 dark:text-[rgba(255,255,255,0.5)]">
                    <span>
                        <MemberBio comment={comment}/>
                        <span title={formatExplicitTime(comment.created_at)}>{formatRelativeTime(comment.created_at)}</span>
                        <EditedInfo comment={comment} />
                    </span>
                </div>
            </div>
        </div>
    );
}

function CommentBody({html}) {
    const dangerouslySetInnerHTML = {__html: html};
    return (
        <div className="flex flex-row items-center gap-4 mt mb-2 pr-4">
            <p dangerouslySetInnerHTML={dangerouslySetInnerHTML} className="gh-comment-content font-sans leading-normal text-[16px] text-neutral-900 dark:text-[rgba(255,255,255,0.85)]" data-testid="comment-content"/>
        </div>
    );
}

function CommentMenu({comment, toggleReplyMode, isInReplyMode, openEditMode, parent}) {
    // If this comment is from the current member, always override member
    // with the member from the context, so we update the bio in existing comments when we change it
    const {member, commentsEnabled} = useContext(AppContext);

    const paidOnly = commentsEnabled === 'paid';
    const isPaidMember = member && !!member.paid;
    const canReply = member && (isPaidMember || !paidOnly) && !parent;

    return (
        <div className="flex gap-5 items-center">
            {<Like comment={comment} />}
            {(canReply && <Reply comment={comment} toggleReply={toggleReplyMode} isReplying={isInReplyMode} />)}
            {<More comment={comment} toggleEdit={openEditMode} />}
        </div>
    );
}

//
// -- Layout --
// 

function RepliesLine({hasReplies}) {
    if (!hasReplies) {
        return null;
    }

    return (<div className="w-[3px] h-full mb-2 bg-gradient-to-b from-neutral-100 via-neutral-100 to-transparent dark:from-[rgba(255,255,255,0.05)] dark:via-[rgba(255,255,255,0.05)] grow rounded" />);
}

function CommentLayout({children, avatar, hasReplies}) {
    return (
        <div className={`flex flex-row w-full ${hasReplies === true ? 'mb-0' : 'mb-10'}`} data-testid="comment-component">
            <div className="mr-3 flex flex-col justify-start items-center">
                <div className="flex-0 mb-4">
                    {avatar}
                </div>
                <RepliesLine hasReplies={hasReplies} />
            </div>
            <div className="grow">
                {children}
            </div>
        </div>
    );
}

//
// -- Default --
//

export default AnimatedComment;
