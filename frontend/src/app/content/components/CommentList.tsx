// components/Comments.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiURL } from "@/app/scripts/api";
import { useAuth } from "@/app/hooks/AuthProvider";
import { Comment } from '@/app/content/models/Comment'
import {redirect, useParams} from "next/navigation";
import {PencilIcon, TrashIcon, DocumentPlusIcon} from "@heroicons/react/24/solid";
import {XCircleIcon} from "@heroicons/react/24/outline";

const CommentList = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const auth = useAuth()
    const userId = auth.userUID;
    const postId = useParams().id;

    // function transformComments(){
    //
    // }

    async function refreshComments(){
        setLoading(true);
        try {
            const response = await axios.get(`${apiURL}/comment/comments/${postId}`);

            if (response.data) {
                console.log("refresh response: ", response.data)

                let commentArray: Comment[] = []
                if (Array.isArray(response.data)){
                    console.log("is array: ", response.data)
                    const responseArray = response.data
                    responseArray.forEach((c) =>{
                        commentArray.push(Object.values(c) as unknown as Comment)
                    })
                } else {
                    console.log("is NOT array: ", response.data)
                    commentArray = Object.values(response.data) as unknown as Comment[]
                    // for (const comm of commentArray){
                    //     const res = await axios.get(`${apiURL}/user/${comm.owner_id}`)
                    //     console.log(res)
                    // }
                }

                console.log("refreshComments Response.data: ", commentArray)
                setComments(commentArray);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshComments();
    }, [postId]);

    const handleAddComment = async (e: any) => {
        e.preventDefault();
        if (!newComment) return;
        if (!userId) redirect(`../authentication/login`);
        try {
            await axios.post(`${apiURL}/comment/comments/${postId}`, {
                owner_id: userId,
                text: newComment,
            });
            await refreshComments()
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditComment = async (e: any) => {
        e.preventDefault();
        if (!editingCommentText) return;
        if (!userId) redirect(`../authentication/login`);
        try {
            await axios.put(`${apiURL}/comment/comments/${postId}/${editingCommentId}/${userId}`, {
                text: editingCommentText,
            });
            await refreshComments();
            setEditingCommentId(null);
            setEditingCommentText('');
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleDeleteComment = async (id:string) => {
        if (!userId) redirect(`../authentication/login`);
        try {
            await axios.delete(`${apiURL}/comment/comments/${postId}/${id}/${userId}`);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
        await refreshComments()
    };

    // Render loading state or comments
    if (loading) return <p>Loading comments...</p>;

    return (
        <>
            <div className={"comment-row-1"}>
                <h1>Add new comment:</h1>
                <form onSubmit={handleAddComment} className={"create-comment"}>
                <textarea
                    className={"comment-create-textarea"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                />
                    <button type="submit" className={"icon-button"}>
                        <DocumentPlusIcon className={"add-button"}/>
                    </button>
                </form>
            </div>
            <div className={"comment-row-2"}>
                <h1>Comments</h1>
                {comments.length === 0 ? (
                    <p>No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.comment_id}>
                            {editingCommentId === comment.comment_id ? (
                                <form onSubmit={handleEditComment} className={"comment"}>
                                    <div className={"comment-icons-edit"}>
                                        <p>Edit comment:</p>
                                        <div>
                                            <button type={"submit"} className={"icon-button"}>
                                                <DocumentPlusIcon className={"icon add"}/>
                                            </button>
                                            <button onClick={() => {
                                                setEditingCommentId(null)
                                            }} className={"icon-button"}>
                                                <XCircleIcon className={"icon cancel"}/>
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        className={"comment-edit-textarea"}
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                    />
                                </form>
                            ) : (
                                <div>
                                    <div className={"comment"}>
                                        {/*<p>{comment.post_id}</p>*/}
                                        <div className={"comment-info-container"}>
                                            <h4 className={"comment-username"}>{comment.username} says:</h4>
                                            {comment.owner_id === userId ? (
                                                    <div className={"comment-icons"}>
                                                        <button className={"icon-button"} onClick={
                                                            () => {
                                                                setEditingCommentId(comment.comment_id);
                                                                setEditingCommentText(comment.text);
                                                            }
                                                        }>
                                                            <PencilIcon className={"icon edit"}/>
                                                </button>
                                                <button className={"icon-button"}
                                                        onClick={() => handleDeleteComment(comment.comment_id)}>
                                                    <TrashIcon className={"icon delete"}/>
                                                </button>
                                            </div>)
                                            : (<></>)}
                                        </div>
                                        <p>{comment.text}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default CommentList;
