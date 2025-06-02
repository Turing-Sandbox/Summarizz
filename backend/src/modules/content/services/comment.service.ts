import { realtime_db } from "../../../shared/config/firebase.config";
import { ref, get, set, remove, update, child, push } from "firebase/database";
import { Comment } from "../models/comment.model";
import { pushNotification } from "../../notification/services/notification.service";
import { Notification } from "../../notification/models/notification.model";
import { ContentService } from "./content.service";

export async function createComment(
  post_id: string,
  owner_id: string,
  text: string,
  username: string
): Promise<Comment> {
  const commentsRef = ref(realtime_db, `comments/${post_id}`); // the firebase realtime database reference
  const newCommentID = push(commentsRef).key; // push an empty item to the database to generate an object

  const time = Date.now(); // store the current time
  const newComment: Comment = {
    // populate the Comment object
    post_id: post_id, // use the post id returned above
    comment_id: newCommentID!,
    owner_id: owner_id,
    username: username,
    text: text,
    timestamp: time,
    last_edited_timestamp: time,
    like_count: 0,
  };

  // Get the post owner ID
  const content = await ContentService.getContent(post_id);
  const owner = content?.creatorUID;

  // Send a notification to the post creator
  const notification: Notification = {
    userId: owner_id,
    username: username,
    type: "comment",
    textPreview: `"${
      text && text.length > 30 ? text.substring(0, 30) + "..." : text
    }"!`,
    contentId: post_id,
    timestamp: Date.now(),
    read: false,
  };

  pushNotification(
    owner!,
    notification // the notification object
  );

  await set(child(commentsRef, newCommentID!), newComment); // update the empty object created earlier by setting the

  return newComment; // if successful, return the new comment
}

export async function getComment(
  post_id: string,
  commentId: string
): Promise<Comment | null> {
  const commentsRef = ref(realtime_db, `comments/${post_id}/${commentId}`); // the firebase realtime database reference
  const snapshot = await get(commentsRef); // perform a get request on a specific comment id
  return snapshot.val(); // return the output of that request
}

export async function updateComment(
  post_id: string,
  commentId: string,
  updatedComment: Partial<Comment>
): Promise<void> {
  const commentRef = ref(realtime_db, `comments/${post_id}/${commentId}`); // the firebase realtime database reference
  console.log("updated: ", updatedComment);
  const doesExist = await get(commentRef); // checks if that comment exists
  updatedComment.last_edited_timestamp = Date.now(); // updates the time the comment was last edited
  if (doesExist.exists()) {
    // if the comment exists:
    await update(commentRef, updatedComment); // update the comment
  } else {
    throw "The requested comment does not exist."; // if it does not exist, then throw an error
  }
}

export async function deleteComment(
  post_id: string,
  commentId: string
): Promise<void> {
  const commentRef = ref(realtime_db, `comments/${post_id}/${commentId}`); // the firebase realtime database reference
  const doesExist = await get(commentRef); // checks whether that comment exists by attempting a get request
  if (doesExist.exists()) {
    console.log(doesExist.val());
    console.log(doesExist.exists());
    await remove(commentRef); // if the comment exists, remove it
  } else {
    console.log(doesExist.val());
    throw "The requested comment does not exist."; // if the comment does not exist, throw an error
  }
}

export async function deletePost(post_id: string): Promise<void> {
  const commentRef = ref(realtime_db, `comments/${post_id}`); // the firebase realtime database reference
  console.log("DELETING POST AND ALL COMMENTS: " + post_id);
  const doesExist = await get(commentRef); // returns the items under that post,
  // acts as a check for whether a post exists
  if (doesExist.exists()) {
    console.log(doesExist.val());
    console.log(doesExist.exists());
    await remove(commentRef); // if the post has items, remove the post
  } else {
    console.log(doesExist.val());
    // throw "The requested post's comments does not exist." // if there are any errors, return the error
  }
}

export async function getAllComments(post_id: string): Promise<Comment[]> {
  const commentsRef = ref(realtime_db, `comments/${post_id}`); // the firebase realtime database reference
  const snapshot = await get(commentsRef); // returns the items under that post
  try {
    if (snapshot.exists()) {
      return snapshot.val(); // if items exist under that post, return the items
    } else {
      return []; // if not, return an empty array
    }
  } catch (e: any) {
    throw new Error(e); // if anything fails, throw an error
  }
}
