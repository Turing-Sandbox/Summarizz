import {
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Content } from "../../models/Content";
import { User } from "../../models/User";
import { Comment } from "../../models/Comment";
import CommentService from "../../services/CommentService";
import { useToast } from "../../hooks/ToastProvider/useToast";

export default function CommentList({
  user,
}: {
  content: Content;
  user: User;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const [selectedCommentEdit, setSelectedCommentEdit] =
    useState<Comment | null>(null);

  const [numComments, setNumComments] = useState(0);
  const [loading, setLoading] = useState(true);

  const contentId = useParams().id as string;
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const toast = useToast();

  useEffect(() => {
    refreshComments();
  }, [contentId]);

  useEffect(() => {
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = "auto";
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [selectedCommentEdit]);

  const refreshComments = async () => {
    const commentsResult = await CommentService.getPostComments(contentId);

    if (commentsResult instanceof Error) {
      toast("An error occurred while fetching comments.", "error");
      setLoading(false);
      return;
    }
    setComments(commentsResult);
    setNumComments(commentsResult.length);
    setLoading(false);
  };

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment) return;
    if (!user.uid) navigate(`../authentication/login`);

    // Add comment to the backend
    const result = await CommentService.publishComment(
      contentId,
      newComment,
      user.uid
    );

    // Check if the comment was added successfully
    if (result instanceof Error) {
      toast("An error occurred while adding the comment.", "error");
      return;
    }

    // Update comments list to reflect the new comment
    setComments((prevComments) => [...prevComments, result.comment]);
    setNumComments((prevNum) => prevNum + 1);

    setNewComment("");
  };

  const handleEditComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCommentEdit) return;
    if (!user.uid) navigate(`../authentication/login`);

    // If comment is empty, delete it
    if (selectedCommentEdit.text === "") {
      await handleDeleteComment(selectedCommentEdit.comment_id);
      setSelectedCommentEdit(null);
      return;
    }

    // Update comment in the backend
    const result = await CommentService.updateComment(
      selectedCommentEdit.comment_id,
      selectedCommentEdit.text,
      contentId
    );

    // Check if the comment was updated successfully
    if (result instanceof Error) {
      toast("An error occurred while updating the comment.", "error");
      return;
    }

    // Update comments list to reflect the changes
    const updatedComments = comments.map((comment) =>
      comment.comment_id === selectedCommentEdit.comment_id
        ? { ...comment, text: selectedCommentEdit.text }
        : comment
    );
    setComments(updatedComments);
    setNumComments(updatedComments.length);
    setNewComment("");
    setSelectedCommentEdit(null);
  };

  const handleDeleteComment = async (id: string) => {
    if (!user.uid) navigate(`../authentication/login`);

    // Delete comment from the backend
    const result = await CommentService.deleteComment(id, contentId);

    if (result instanceof Error) {
      toast("An error occurred while deleting the comment.", "error");
      return;
    }

    // Update comments list to reflect the changes
    const updatedComments = comments.filter(
      (comment) => comment.comment_id !== id
    );
    setComments(updatedComments);
    setNumComments(updatedComments.length);
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
      {selectedCommentEdit != null && (
        <>
          <div
            className='overlay'
            onClick={() => setSelectedCommentEdit(null)}
          ></div>

          <form onSubmit={handleEditComment} className='edit-comment'>
            <div
              onClick={() => {
                setSelectedCommentEdit(null);
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
              value={selectedCommentEdit?.text || ""}
              onChange={(e) => {
                setSelectedCommentEdit({
                  ...selectedCommentEdit!,
                  text: e.target.value,
                });
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
                    {comment.owner_id === user.uid && (
                      <div className={"comment-icons"}>
                        <button
                          className={"icon-button"}
                          onClick={() => {
                            setSelectedCommentEdit(comment);
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
}
