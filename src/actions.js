async function loadMoreComments({state, api}) {
    let page = 1;
    if (state.pagination && state.pagination.page) {
        page = state.pagination.page + 1;
    }
    const data = await api.comments.browse({page, postId: state.postId});

    // Note: we store the comments from new to old, and show them in reverse order
    return {
        comments: [...state.comments, ...data.comments],
        pagination: data.meta.pagination
    };
}

async function loadMoreReplies({state, api, data: comment}) {
    const data = await api.comments.replies({commentId: comment.id, afterReplyId: comment.replies[comment.replies.length - 1]?.id});

    // Note: we store the comments from new to old, and show them in reverse order
    return {
        comments: state.comments.map((c) => {
            if (c.id === comment.id) {
                return {
                    ...comment,
                    replies: [...comment.replies, ...data.comments],
                    
                    // Check if we loaded replies from appendedReplies and remove them if required (we are at the end of pagination in that case)
                    appendedReplies: comment.appendedReplies?.filter(ar => !data.comments.find(ccc => ccc.id === ar.id))
                };
            }
            return c;
        })
    };
}

async function addComment({state, api, data: comment}) {
    const data = await api.comments.add({comment});
    comment = data.comments[0];

    return {
        comments: [comment, ...state.comments],
        commentCount: state.commentCount + 1
    };
}

async function addReply({state, api, data: {reply, parent}}) {
    let comment = reply;
    comment.parent_id = parent.id;

    const data = await api.comments.add({comment});
    comment = data.comments[0];

    // When we add a reply,
    // it is possible that we didn't load all the replies for the given comment yet.
    // To fix that, we'll save the reply to a different field that is created locally to differentiate between replies before and after pagination 😅

    // Replace the comment in the state with the new one
    return {
        comments: state.comments.map((c) => {
            if (c.id === parent.id) {
                return {
                    ...parent,
                    appendedReplies: [...(parent.appendedReplies ?? []), comment],
                    count: {
                        ...parent.count,
                        replies: parent.count.replies + 1
                    }
                };
            }
            return c;
        }),
        commentCount: state.commentCount + 1
    };
}

async function hideComment({state, adminApi, data: comment}) {
    await adminApi.hideComment(comment.id);

    return {
        comments: state.comments.map((c) => {
            const replies = c.replies.map((r) => {
                if (r.id === comment.id) {
                    return {
                        ...r,
                        status: 'hidden'
                    };
                }

                return r;
            });

            if (c.id === comment.id) {
                return {
                    ...c,
                    status: 'hidden',
                    replies
                };
            }

            return {
                ...c,
                replies
            };
        }),
        commentCount: state.commentCount - 1
    };
}

async function showComment({state, adminApi, data: comment}) {
    await adminApi.showComment(comment.id);

    return {
        comments: state.comments.map((c) => {
            const replies = c.replies.map((r) => {
                if (r.id === comment.id) {
                    return {
                        ...r,
                        status: 'published'
                    };
                }

                return r;
            });

            if (c.id === comment.id) {
                return {
                    ...c,
                    status: 'published',
                    replies
                };
            }

            return {
                ...c,
                replies
            };
        }),
        commentCount: state.commentCount + 1
    };
}

async function likeComment({state, api, data: comment}) {
    await api.comments.like({comment});

    return {
        comments: state.comments.map((c) => {
            const replies = c.replies.map((r) => {
                if (r.id === comment.id) {
                    return {
                        ...r,
                        liked: true,
                        count: {
                            ...r.count,
                            likes: r.count.likes + 1
                        }
                    };
                }

                return r;
            });

            if (c.id === comment.id) {
                return {
                    ...c,
                    liked: true,
                    replies,
                    count: {
                        ...c.count,
                        likes: c.count.likes + 1
                    }
                };
            }

            return {
                ...c,
                replies
            };
        })
    };
}

async function reportComment({state, api, data: comment}) {
    await api.comments.report({comment});

    return {};
}

async function unlikeComment({state, api, data: comment}) {
    await api.comments.unlike({comment});

    return {
        comments: state.comments.map((c) => {
            const replies = c.replies.map((r) => {
                if (r.id === comment.id) {
                    return {
                        ...r,
                        liked: false,
                        count: {
                            ...r.count,
                            likes: r.count.likes - 1
                        }
                    };
                }

                return r;
            });

            if (c.id === comment.id) {
                return {
                    ...c,
                    liked: false,
                    replies,
                    count: {
                        ...c.count,
                        likes: c.count.likes - 1
                    }
                };
            }
            return {
                ...c,
                replies
            };
        })
    };
}

async function deleteComment({state, api, data: comment}) {
    await api.comments.edit({
        comment: {
            id: comment.id,
            status: 'deleted'
        }
    });

    return {
        comments: state.comments.map((c) => {
            const replies = c.replies.map((r) => {
                if (r.id === comment.id) {
                    return {
                        ...r,
                        status: 'deleted'
                    };
                }

                return r;
            });

            if (c.id === comment.id) {
                return {
                    ...c,
                    status: 'deleted',
                    replies
                };
            }

            return {
                ...c,
                replies
            };
        }),
        commentCount: state.commentCount - 1
    };
}

async function editComment({state, api, data: {comment, parent}}) {
    const data = await api.comments.edit({
        comment
    });
    comment = data.comments[0];

    // Replace the comment in the state with the new one
    return {
        comments: state.comments.map((c) => {
            if (parent && parent.id === c.id) {
                return {
                    ...c,
                    replies: c.replies.map((r) => {
                        if (r.id === comment.id) {
                            return comment;
                        }
                        return r;
                    })
                };
            } else if (c.id === comment.id) {
                return comment;
            }

            return c;
        })
    };
}

async function updateMember({data, state, api}) {
    const {name, bio} = data;
    const patchData = {};
    
    const originalName = state?.member?.name;

    if (name && originalName !== name) {
        patchData.name = name;
    }

    const originalBio = state?.member?.bio;
    if (bio !== undefined && originalBio !== bio) {
        // Allow to set it to an empty string or to null
        patchData.bio = bio;
    }

    if (Object.keys(patchData).length > 0) {
        try {
            const member = await api.member.update(patchData);
            if (!member) {
                throw new Error('Failed to update member');
            }
            return {
                member,
                success: true
            };
        } catch (err) {
            return {
                success: false,
                error: err
            };
        }
    }
    return null;
}

function openPopup({data}) {
    return {
        popup: data
    };
}

function closePopup() {
    return {
        popup: null
    };
}

const Actions = {
    // Put your actions here
    addComment,
    editComment,
    hideComment,
    deleteComment,
    showComment,
    likeComment,
    unlikeComment,
    reportComment,
    addReply,
    loadMoreComments,
    loadMoreReplies,
    updateMember,
    openPopup,
    closePopup
};

/** Handle actions in the App, returns updated state */
export default async function ActionHandler({action, data, state, api, adminApi}) {
    const handler = Actions[action];
    if (handler) {
        return await handler({data, state, api, adminApi}) || {};
    }
    return {};
}
