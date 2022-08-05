async function loadMoreComments({state, api}) {
    let page = 1;
    if (state.pagination && state.pagination.page) {
        page = state.pagination.page + 1;
    }
    let after = undefined;

    if (state.focusedComment) {
        after = state.focusedComment.parent_id ?? state.focusedComment.id;
    }
    const data = await api.comments.browse({page, postId: state.postId, after});

    // Note: we store the comments from new to old, and show them in reverse order
    return {
        comments: [...state.comments, ...data.comments],
        pagination: data.meta.pagination
    };
}

async function loadFutureComments({state, api}) {
    let page = 1;
    if (state.futurePagination && state.futurePagination.page) {
        page = state.futurePagination.page + 1;
    }
    let before = undefined;

    if (state.focusedComment) {
        before = state.focusedComment.parent_id ?? state.focusedComment.id;
    }
    const data = await api.comments.browse({page, postId: state.postId, before, order: 'ASC'});

    // Note: we store the comments from new to old, and show them in reverse order
    return {
        comments: [...data.comments.reverse(), ...state.comments],
        futurePagination: data.meta.pagination
    };
}

async function addComment({state, api, data: comment}) {
    const data = await api.comments.add({comment});
    comment = data.comments[0];

    // Temporary workaround for missing member relation (bug in API)
    const commentStructured = {
        ...comment,
        member: state.member,
        replies: []
    };

    return {
        comments: [commentStructured, ...state.comments]
        // todo: fix pagination now?
    };
}

async function addReply({state, api, data: {reply, parent}}) {
    let comment = reply;
    comment.parent_id = parent.id;

    const data = await api.comments.add({comment});
    comment = data.comments[0];

    // Temporary workaround for missing member relation (bug in API)
    comment = {
        ...comment,
        member: state.member
    };

    // Replace the comment in the state with the new one
    return {
        comments: state.comments.map((c) => {
            if (c.id === parent.id) {
                return {
                    ...parent,
                    replies: [...parent.replies, comment]
                };
            }
            return c;
        })
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
        })
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
        })
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
                        likes_count: r.likes_count + 1
                    };
                }

                return r;
            });

            if (c.id === comment.id) {
                return {
                    ...c,
                    liked: true,
                    likes_count: c.likes_count + 1,
                    replies
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
                        likes_count: r.likes_count - 1
                    };
                }

                return r;
            });

            if (c.id === comment.id) {
                return {
                    ...c,
                    liked: false,
                    likes_count: c.likes_count - 1,
                    replies
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
        })
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
    loadFutureComments,
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
