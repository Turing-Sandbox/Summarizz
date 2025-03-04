import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { apiURL } from "@/app/scripts/api";
import { useAuth } from "@/hooks/AuthProvider";
import { redirect, useParams } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { Comment } from "@/models/Comment";

const CommentList = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [numComments, setNumComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const userId = auth.userUID;
  const postId = useParams().id;
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  async function refreshComments() {
    setLoading(true);
    try {
      const response = await axios.get(`${apiURL}/comment/comments/${postId}`);

      if (response.data) {
        console.log("refresh response: ", response.data);

        let commentArray: Comment[] = [];
        if (Array.isArray(response.data)) {
          console.log("is array: ", response.data);
          const responseArray = response.data;
          responseArray.forEach((c) => {
            commentArray.push(Object.values(c) as unknown as Comment);
          });
        } else {
          console.log("is NOT array: ", response.data);
          commentArray = Object.values(response.data) as unknown as Comment[];
        }

        console.log("refreshComments Response.data: ", commentArray);
        setComments(commentArray);
        setNumComments(comments.length);
        if (Array.isArray(commentArray)) {
          setNumComments(commentArray.length);
        } else if (commentArray) {
          setNumComments(1);
        } else {
          setNumComments(0);
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshComments();
  }, [postId]);

  useEffect(() => {
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = "auto";
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [editingCommentText]);

  const handleAddComment = async (e: any) => {
    e.preventDefault();
    if (!newComment) return;
    if (!userId) redirect(`../authentication/login`);
    try {
      await axios.post(`${apiURL}/comment/comments/${postId}`, {
        owner_id: userId,
        text: newComment,
      });
      await refreshComments();
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (e: any) => {
    e.preventDefault();
    if (!editingCommentText) return;
    if (!userId) redirect(`../authentication/login`);
    try {
      await axios.put(
        `${apiURL}/comment/comments/${postId}/${editingCommentId}/${userId}`,
        {
          text: editingCommentText,
        }
      );
      await refreshComments();
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!userId) redirect(`../authentication/login`);
    try {
      await axios.delete(
        `${apiURL}/comment/comments/${postId}/${id}/${userId}`
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
    await refreshComments();
  };

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------

  if (loading) return <p>Loading comments...</p>;

  return (
    <>
      <h2>Discussion ({numComments})</h2>

      {/************ ADD COMMENT ************/}
      <div>
        <form onSubmit={handleAddComment} className={"create-comment"}>
          <div>
            <textarea
              className='comment-textarea'
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                (e.target as HTMLTextAreaElement).style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder='Enter your comment'
            />
          </div>

          <div>
            <button type='submit' className={"icon-button"}>
              <PaperAirplaneIcon className={"add-button"} />
            </button>
          </div>
        </form>
      </div>

      {/************ EDIT COMMENT ************/}
      {editingCommentId != null && (
        <>
          <div
            className='overlay'
            onClick={() => setEditingCommentId(null)}
          ></div>

          <form onSubmit={handleEditComment} className='edit-comment'>
            <div
              onClick={() => {
                setEditingCommentId(null);
              }}
              className='close-button'
              style={{ cursor: "pointer" }}
            >
              <XCircleIcon className='icon cancel' />
            </div>

            <h1 className='popup-title'>Edit comment</h1>

            <textarea
              ref={editTextareaRef}
              className='comment-textarea'
              value={editingCommentText}
              onChange={(e) => {
                setEditingCommentText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder='Enter your comment'
            />

            <button type='submit' className='submit-button'>
              Update
            </button>
          </form>
        </>
      )}

      {/************ COMMENT LIST ************/}
      <div>
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment: Comment) => (
            <div key={comment.comment_id}>
              <div>
                <div className={"comment"}>
                  {/* COMMENT HEADER */}
                  <div className={"comment-info-container"}>
                    {/* COMMENT USERNAME */}
                    <h4 className={"comment-username"}>{comment.username}</h4>

                    {/* COMMENT OWNER SETTINGS */}
                    {comment.owner_id === userId && (
                      <div className={"comment-icons"}>
                        <button
                          className={"icon-button"}
                          onClick={() => {
                            setEditingCommentId(comment.comment_id);
                            setEditingCommentText(comment.text);
                          }}
                        >
                          <PencilIcon className={"icon edit"} />
                        </button>
                        <button
                          className={"icon-button"}
                          onClick={() =>
                            handleDeleteComment(comment.comment_id)
                          }
                        >
                          <TrashIcon className={"icon delete"} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* COMMENT TEXT */}
                  <p>{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default CommentList;
