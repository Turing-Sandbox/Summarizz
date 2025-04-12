# .gitignore

```
### BACKEND RELATED FILES ###
backend/lib-cov
backend/*.seed
backend/*.log
backend/*.csv
backend/*.dat
backend/*.out
backend/*.pid
backend/*.gz
backend/*.swp

backend/pids
backend/logs
backend/results
backend/tmp


### FRONTEND RELATED FILES ###
public/css/main.css

# Coverage Reports
coverage


# Dependency directory
frontend/node_modules
frontend/node_modules/
frontend/bower_components

backend/node_modules
backend/node_modules/
backend/bower_components


# Editors and IDEs Configuration
frontend/.idea/*
frontend/.idea
frontend/*.iml
frontend/.vscode
frontend/.vscode/*
frontend/.env
frontend/.env.local

.idea/*
.idea
backend/*.iml
backend/.vscode
backend/.vscode/*
backend/.env


# OS metadata
.DS_Store
Thumbs.db

# Ignore Built TS Files
dist/**/*

# Ignore Yarn Lock File
yarn.lock

# Ignore .env files from frontend and backend modules
**/*.env
**/**/*.env
**/.env


# Ignore python cache
**/__pycache__
**/.pytest_cache

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*


# Compiled binary addons (http://nodejs.org/api/addons.html)
build/Release

# Ignore build directories.
/build
/dist

# Dependency directories
node_modules/
jspm_packages/

# Distribution directories
dist/

# Typescript v1 declaration files
typings/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# ignore log files and databases
*.log
*.sql
*.sqlite

# ignore compiled files
*.com
*.class
*.dll
*.exe
*.o
*.so

# ignore packaged files
*.7z
*.dmg
*.gz
*.iso
*.jar
*.rar
*.tar
*.zip

# ignore private/secret files
*.der
*.key
*.pem

# --------------------------------------------------------
# BEGIN Explictly Allowed Files (i.e. do NOT ignore these)
# --------------------------------------------------------

# track these files, if they exist
!.dockerignore
!.editorconfig
!.env.example
!.git-blame-ignore-revs
!.gitignore
!.nvmrc
!.phpcs.xml.dist

### dotenv ###
.env

### Firebase ###
.idea
**/node_modules/*
**/.firebaserc

### Firebase Patch ###
.runtimeconfig.json
.firebase/

### react ###
.DS_*
*.log
logs
**/*.backup.*
**/*.back.*

node_modules
bower_components

*.sublime*

psd
thumb
sketch


### backend node_modules ###
backend/node_modules
**/node_modules/*
**/node_modules


package-lock.json
```

# backend\bulk_write.sh

```sh
#!/usr/bin/bash

: << 'END_COMMENT'

This script is currently used to create temporary files based on a 
pattern in the current directory and its subdirectories. However,
you can use this script to create any recurring files you see fit such
as repeating config files, or any other files that may be needed throughout 
the module directories.

In order to make this change, you will simply need to modify the following:

for dir in "$script_dir"/*module*/; do

to something more appropriate for the purpose of the script.

END_COMMENT

create_temp_file_in_subdirs() {
    local parent_dir="$1"
    local file_name="TEMP.txt"

    for subdir in "$parent_dir"/*/; do
        if [ -f "$subdir/$file_name" ]; then
            echo "Removing existing temp file in $subdir"
            rm "$subdir/$file_name"
        fi

        # if [ -d "$subdir" ]; then
        #     echo "Creating temp file in $subdir"
        #     echo "This is a TEMP file, remove when necessary." > "$subdir/$file_name"
        # fi
    done
}

script_dir=$(dirname "$0")

for dir in "$script_dir"/*module*/; do
    if [ -d "$dir" ]; then
        echo "Processing directory: $dir"
        create_temp_file_in_subdirs "$dir"
    fi
done

echo "Script has been executed successfully... Happy Coding 🎉"

```

# backend\comment-module\controllers\commentController.ts

```ts
import {
	createComment,
	deleteComment,
	deletePost,
	getAllComments,
	getComment,
	updateComment
} from '../services/commentService';
import {ContentService} from '../../content-module/services/serviceContent'
import {Request, Response} from 'express';
import {getUser} from "../../user-module/services/userService";

export async function createCommentController(req: Request, res: Response): Promise<void> {
	const { post_id } = req.params
	const { owner_id, text } = req.body;
	try {
		const response = await getUser(owner_id);
		const creation = await createComment(post_id, owner_id, text, response.username);
		res.status(201).json({ message: 'Comment created successfully', creation});
	} catch (error) {
		console.log(error)
		console.log(post_id, owner_id, text)
		res.status(500).json({ error: error });
	}
	}

	export async function getCommentByIdController(req: Request, res: Response) {
	const { post_id, comment_id } = req.params;
	try {
		const comment = await getComment(post_id, comment_id);
		console.log(comment)
		if (comment) res.status(200).json(comment);
		else res.status(404).json(null);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch comment' });
		console.log(error)
	}
}

export async function updateCommentController(req: Request, res: Response) {
	const { post_id, comment_id, user_id} = req.params;
	const comment = await getComment(post_id, comment_id)
	if (comment.owner_id == user_id){
		const updatedComment = req.body;
		try {
			await updateComment(post_id, comment_id, updatedComment);
			res.status(200).json({ message: 'Comment updated successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to update comment' });
			console.log(error)
		}
	} else {
		res.status(401).json({ error: 'You do not have permission to try this.'});
	}
}

export async function deleteCommentController(req: Request, res: Response) {
	const { post_id, comment_id, user_id} = req.params;
	const comment = await getComment(post_id, comment_id)
	if (comment.owner_id == user_id){
		try {
			await deleteComment(post_id, comment_id);
			res.status(200).json({ message: 'Comment deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error });
			console.log(error)
		}
	} else {
		res.status(401).json({ error: 'You do not have permission to try this.'});
	}
}

export async function deletePostController(req: Request, res: Response) {
	const { post_id, user_id } = req.params;
	const post = await ContentService.getContent(post_id)
	const creator_id = post.creatorUID
	if (creator_id == user_id){
		try {
			await deletePost(post_id);
			res.status(200).json({ message: 'Post (entire comment tree) deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error + " " + post_id});
			console.log(error)
		}
	} else {
		res.status(401).json({ error: 'You do not have permission to try this.'});
	}
}

export async function getCommentsByPostController(req: Request, res: Response): Promise<void> {
	const { post_id } = req.params;
	try {
		const comments = await getAllComments(post_id);

		if (Object.keys(comments).length > 0) {
			res.status(200).json(comments);
		} else {
			res.status(200).json(null);
		}
	} catch (error) {
		console.error('Error fetching comments:', error);
		res.status(500).json({ error: 'Failed to fetch comments' });
		console.log("GET ALL COMMENTS ERROR: ", error)
	}
}

```

# backend\comment-module\models\commentModel.ts

```ts
interface Comment {
	post_id: string;
	comment_id: string;
	owner_id: string;
	username: string;
	text: string;
	timestamp: number;
	last_edited_timestamp: number;
	like_count: number;
}

export { Comment };

```

# backend\comment-module\routes\commentRoutes.ts

```ts
import { Router } from 'express';
import {
    updateCommentController,
    createCommentController,
    deleteCommentController,
    getCommentsByPostController,
    getCommentByIdController, deletePostController
} from '../controllers/commentController';
const router = Router();

router.post('/comments/:post_id', createCommentController);
router.get('/comments/:post_id/', getCommentsByPostController);
router.get('/comments/:post_id/:comment_id', getCommentByIdController);
router.put('/comments/:post_id/:comment_id/:user_id', updateCommentController);
router.delete('/post/:post_id/:user_id', deletePostController);
router.delete('/comments/:post_id/:comment_id/:user_id', deleteCommentController);

export default router;

```

# backend\comment-module\services\commentService.ts

```ts
import { realtime_db } from '../../shared/firebaseConfig';
import { ref, get, set, remove, update, child, push } from 'firebase/database';
import { Comment } from '../models/commentModel';


export async function createComment(post_id: string, owner_id: string, text: string, username:string): Promise<Comment> {
	const commentsRef = ref(realtime_db, `comments/${post_id}`); // the firebase realtime database reference
	const newCommentID = push(commentsRef).key // push an empty item to the database to generate an object
	// the key of the object is used as the comment id
	const time = Date.now() // store the current time
	const newComment: Comment = { // populate the Comment object
		post_id: post_id, // use the post id returned above
		comment_id: newCommentID,
		owner_id: owner_id,
		username: username,
		text: text,
		timestamp: time,
		last_edited_timestamp: time,
		like_count: 0,
	}
	await set(child(commentsRef, newCommentID), newComment); // update the empty object created earlier by setting the
	// value to the Comment created above
	console.log(newComment)
	return newComment; // if successful, return the new comment
}

export async function getComment(post_id: string, commentId: string): Promise<Comment | null> {
	const commentsRef = ref(realtime_db, `comments/${post_id}/${commentId}`); // the firebase realtime database reference
	const snapshot = await get(commentsRef); // perform a get request on a specific comment id
	return snapshot.val(); // return the output of that request
}

export async function updateComment(post_id: string, commentId: string, updatedComment: Partial<Comment>): Promise<void> {
	const commentRef = ref(realtime_db, `comments/${post_id}/${commentId}`); // the firebase realtime database reference
	console.log("updated: ", updatedComment)
	const doesExist = await get(commentRef) // checks if that comment exists
	updatedComment.last_edited_timestamp = Date.now() // updates the time the comment was last edited
	if (doesExist.exists()) { // if the comment exists:
		await update(commentRef, updatedComment); // update the comment
	} else {
		throw "The requested comment does not exist." // if it does not exist, then throw an error
	}
}


export async function deleteComment(post_id: string, commentId: string): Promise<void> {
	const commentRef = ref(realtime_db, `comments/${post_id}/${commentId}`); // the firebase realtime database reference
	const doesExist = await get(commentRef) // checks whether that comment exists by attempting a get request
	if (doesExist.exists()) {
		console.log(doesExist.val())
		console.log(doesExist.exists())
		await remove(commentRef) // if the comment exists, remove it
	} else {
		console.log(doesExist.val())
		throw "The requested comment does not exist." // if the comment does not exist, throw an error
	}
}

export async function deletePost(post_id: string): Promise<void> {
	const commentRef = ref(realtime_db, `comments/${post_id}`);// the firebase realtime database reference
	console.log("DELETING POST AND ALL COMMENTS: " + post_id)
	const doesExist = await get(commentRef) // returns the items under that post,
	// acts as a check for whether a post exists
	if (doesExist.exists()) {
		console.log(doesExist.val())
		console.log(doesExist.exists())
		await remove(commentRef) // if the post has items, remove the post
	} else {
		console.log(doesExist.val())
		// throw "The requested post's comments does not exist." // if there are any errors, return the error
	}
}


export async function getAllComments(post_id: string): Promise<Comment[]> {
	const commentsRef = ref(realtime_db, `comments/${post_id}`); // the firebase realtime database reference
	const snapshot = await get(commentsRef); // returns the items under that post
	try{
		if (snapshot.exists()) {
			return snapshot.val(); // if items exist under that post, return the items
		} else {
			return []; // if not, return an empty array
		}
	} catch (e){
		throw new Error(e) // if anything fails, throw an error
	}
}

```

# backend\content-module\controllers\contentController.ts

```ts
import { Request, Response } from "express";
import { ContentService } from "../services/serviceContent";
import { IncomingForm } from "formidable";
import { StorageService } from "../../storage-module/services/serviceStorage";

export class ContentController {
  static async createContent(req: Request, res: Response) {
    console.log("Creating Content...");
    const { creatorUID, title, content, thumbnailUrl } = req.body;

    try {
      const response = await ContentService.createContent(
        creatorUID,
        title,
        content,
        thumbnailUrl
      );
      res.status(201).json(response);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create content" });
    }
  }

  static async uploadThumbnail(req: Request, res: Response) {
    console.log("Uploading Thumbnail...");
    console.log(req.body);
    console.log(req.params);
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form: ", err);
        return res.status(500).json({ error: "Failed to upload thumbnail." });
      }

      const file = files.thumbnail[0];
      const fileName = file.newFilename;
      const fileType = file.mimetype;

      // Upload thumbnail to storage
      try {
        // Upload thumbnail
        const response = await StorageService.uploadFile(
          file,
          "thumbnails",
          fileName,
          fileType
        );
        res.status(201).json(response);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({ error: error.message || "Failed to upload thumbnail" });
      }
    });
  }

  static async getContent(req: Request, res: Response) {
    console.log("Fetching Content...");
    const { contentId } = req.params;

    try {
      const response = await ContentService.getContent(contentId);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch content" });
    }
  }

  static async editContent(req: Request, res: Response) {
    console.log("Fetching Content...");
    const { contentId, userId } = req.params;
    const { data } = req.body;

    console.log("edit body: ", req.body);
    console.log(data);

    try {
      // const confirmation = await axios.get(`${apiURL}/content/${contentId}`)
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation.creatorUID;
      console.log(owner_id);
      console.log(userId);
      console.log(confirmation);
      if (userId == owner_id) {
        //check whether they are allowed to edit the content
        const response = await ContentService.editContent(contentId, data);
        res.status(200).json(response);
      } else {
        throw Error("You do not have this permission.");
      }
    } catch (error) {
      console.log(error);
      res
        .status(401)
        .json({ error: error.message || "Failed to edit content" });
    }
  }

  static async editContentAndThumbnail(req: Request, res: Response) {
    console.log("Editing Content and Thumbnail...");
    const { contentId, userId } = req.params;
    console.log("Content ID: ", contentId);
    console.log("User ID: ", userId);

    try {
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation.creatorUID;
      if (userId == owner_id) {
        //check whether they are allowed to edit the content
        console.log("User is authorized to edit");

        let file_path: string;
        let file_name: string;
        if (confirmation.thumbnail) {
          file_path = decodeURIComponent(
            confirmation.thumbnail.split("/o/")[1].split("?")[0]
          ); //Converts things like "%2F" to "/", etc.
          file_name = file_path.split("/")[1]; // The line above returns thumbnails/filename, this line returns filename.
        }

        console.log("Form is being created:...");
        const form = new IncomingForm();
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error parsing form: ", err);
            return res
              .status(500)
              .json({ error: "Failed to upload thumbnail." });
          }

          const file = files.thumbnail[0];
          let fileName: string;

          if (file_name) {
            fileName = file_name;
          } else {
            fileName = file.newFilename;
          }
          const fileType = file.mimetype;

          try {
            const response = await StorageService.uploadFile(
              file,
              "thumbnails",
              fileName,
              fileType
            );

            const updateData = JSON.parse(fields.data);
            updateData.thumbnail = response.url;
            console.log("updateData");
            await ContentService.editContent(contentId, updateData);
            res.status(201).json(response);
          } catch (error) {
            console.log(error);
            res
              .status(500)
              .json({ error: error.message || "Failed to upload thumbnail" });
          }
        });
      } else {
        res.status(401).json("You are not authorized to edit this content.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: error.message || "You are not authorized to edit this content.",
      });
    }
  }

  static async deleteContent(req: Request, res: Response) {
    console.log("Deleting Content...");
    const { contentId } = req.params;
    const { userId } = req.body;

    try {
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation.creatorUID;

      if (userId == owner_id) {
        const response = await ContentService.deleteContent(contentId);
        console.log("DELETING CONTENT:::::");
        console.log(response);

        res.status(200).json(response);
      } else {
        throw new Error("You don't have the permission to delete this!!");
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: error.message || "Failed to delete content" });
    }
  }

  // Like content
  static async likeContent(req: Request, res: Response) {
    console.log("Liking Content...");
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.likeContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error liking content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to like content",
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }

  // Unlike content
  static async unlikeContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unlikeContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error unliking content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to unlike content",
      });
    }
  }

  // Bookmark content
  static async bookmarkContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.bookmarkContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error bookmarking content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to bookmark content",
      });
    }
  }

  // Unbookmark content
  static async unbookmarkContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unbookmarkContent(
        contentId,
        userId
      );
      res.status(200).json(response);
    } catch (error) {
      console.error("Error unbookmarking content:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to unbookmark content",
      });
    }
  }

  // Share content
  static async shareContent(req: Request, res: Response) {
    const { userId, contentId } = req.params;

    try {
      // Call the service layer to handle *both* sharing and incrementing
      const updatedContent = await ContentService.shareContent(
        contentId,
        userId
      );

      // Return success response
      res.status(200).json({ content: updatedContent }); // Return the updated content
    } catch (error) {
      console.error("Error sharing content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to share content",
      });
    }
  }

  // Unshare content
  static async unshareContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unshareContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error unsharing content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to unshare content",
      });
    }
  }

  // Update the number of times the content was shared
  static async incrementShareCount(req: Request, res: Response) {
    const { contentId } = req.params;
    try {
      await ContentService.incrementShareCount(contentId);
      res.status(200).json("Successfully incremented!");
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to increment share count",
      });
    }
  }

  //  Update the number of times the content was viewed
  static async incrementViewCount(req: Request, res: Response) {
    const { contentId } = req.params;
    try {
      await ContentService.incrementViewCount(contentId);
      res.status(200).json("Successfully incremented!");
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to increment view count",
      });
    }
  }

  static async getTrendingContent(req: Request, res: Response) {
    console.log("Fetching Trending Content...");
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    try {
      const trendingContent = await ContentService.getTrendingContent(limit);

      res.status(200).json({
        success: true,
        trendingContent,
        message: "Trending content fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching trending content:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch trending content",
      });
    }
  }

  static async getAllContent(req: Request, res: Response) {
    console.log("Fetching All Content...");
    try {
      const allContent = await ContentService.getAllContent();

      res.status(200).json({
        success: true,
        content: allContent,
        message: "All content fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching all content:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch all content",
      });
    }
  }

  static async getPersonalizedContent(req: Request, res: Response) {
    console.log("Fetching Personalized Content...");
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    try {
      console.log(`Getting personalized content for user: ${userId}`);
      const personalizedContent = await ContentService.getPersonalizedContent(
        userId,
        limit
      );

      res.status(200).json({
        success: true,
        personalizedContent,
        message: "Personalized content fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching personalized content:", error);

      res.status(500).json({
        success: false,
        personalizedContent: [],
        message: `Failed to fetch personalized content for user ${userId}, error: ${error.message}`,
      });
    }
  }
}

```

# backend\content-module\models\contentModel.ts

```ts
export interface Content {
  uid: string; // Firebase UID
  creatorUID: string; // Content Creator UID
  title: string; // Content Title
  content: string; // Content Body
  dateCreated: Date; // Date Created
  dateUpdated: Date; // Date Updated

  // Optional Fields
  thumbnail?: string; // Thumbnail Image
  summary?: string; // Content Summary
  readtime?: number; // Read Time
  likes?: number; // Likes Count
  peopleWhoLiked?: string[]; // List of user IDs who liked the post
  bookmarkedBy?: string[]; // List of user IDs who bookmarked the post
  views?: number; // Amount of times this page was viewed. This gets populated and updated with each GET request to the content id.
  shares?: number; // Amount of times shared. This gets populated after someone clicks the share icon button.
  titleLower?: string; // Lowercase title, used for sharing.
  sharedBy?: string[]; // List of user IDs who shared the post
  score?: number; // Score of the content
}

```

# backend\content-module\routes\contentRoutes.ts

```ts
import { Router } from "express";
import { ContentController } from "../controllers/contentController";

const contentRoutes = Router();

contentRoutes.post("/", ContentController.createContent); // Create new content
contentRoutes.post("/uploadThumbnail", ContentController.uploadThumbnail); // Upload thumbnail

contentRoutes.get("/feed/trending", ContentController.getTrendingContent); // Get trending content
contentRoutes.get("/feed/:userId", ContentController.getPersonalizedContent); // Get personalized content

contentRoutes.get("/", ContentController.getAllContent); // Get all content
contentRoutes.get("/:contentId", ContentController.getContent); // Get content by ID

contentRoutes.put("/views/:contentId", ContentController.incrementViewCount); // Increment the view count
contentRoutes.put("/shares/:contentId", ContentController.incrementShareCount); // Increment the share count

contentRoutes.delete("/:contentId", ContentController.deleteContent); // Delete content by ID

contentRoutes.put("/:contentId/:userId", ContentController.editContent); // Edit content by ID
contentRoutes.put(
  "/editThumbnail/:contentId/:userId",
  ContentController.editContentAndThumbnail
); // Edit content by ID

contentRoutes.post("/:contentId/like/:userId", ContentController.likeContent); // Like content
contentRoutes.post(
  "/:contentId/unlike/:userId",
  ContentController.unlikeContent
); // Unlike content

contentRoutes.post(
  "/:userId/bookmark/:contentId",
  ContentController.bookmarkContent
); // Bookmark content
contentRoutes.post(
  "/:userId/unbookmark/:contentId",
  ContentController.unbookmarkContent
); // Unbookmark content

contentRoutes.post(
  "/:contentId/user/:userId/share",
  ContentController.shareContent
); // Share content
contentRoutes.post(
  "/:contentId/user/:userId/unshare",
  ContentController.unshareContent
); // Unshare content

export default contentRoutes;

```

# backend\content-module\services\serviceContent.ts

```ts
import { db } from "../../shared/firebaseConfig";
import {
  collection,
  increment,
  addDoc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  doc,
  deleteDoc,
  runTransaction,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import {
  addContentToUser,
  removeContentFromUser,
  addLikedContentToUser,
  removeLikedContentFromUser,
  addBookmarkedContentToUser,
  removeBookmarkedContentFromUser,
} from "../../user-module/services/userService";
import { StorageService } from "../../storage-module/services/serviceStorage";
import { Content } from "../models/contentModel";

export class ContentService {
  static async createContent(
    creatorUID: string,
    title: string,
    content: string,
    thumbnail: string | null
  ) {
    try {
      console.log("Creating content...");

      const readtime = await this.estimateReadTime(content);

      console.log("Readtime: ", readtime);

      // Build the content object
      const newContent = {
        creatorUID,
        title,
        content,
        thumbnail: thumbnail || null,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        readtime,
        likes: 0,
        peopleWhoLiked: [],
        bookmarkedBy: [],
        titleLower: title.toLowerCase(),
        sharedBy: [],
      };

      const docRef = await addDoc(collection(db, "contents"), newContent);
      console.log("Content created with ID:", docRef.id);

      // Update the document with its own ID as uid
      await updateDoc(docRef, { uid: docRef.id });

      addContentToUser(creatorUID, docRef.id);

      return { uid: docRef.id };
    } catch (error) {
      let errorMessage = error.message;
      // Remove "Firebase: " prefix from the error message
      if (errorMessage.startsWith("Firebase: ")) {
        errorMessage = errorMessage.replace("Firebase: ", "");
      }
      throw new Error(errorMessage);
    }
  }

  static async getContent(uid: string) {
    console.log("Getting content...");
    console.log(uid);
    const contentDoc = await getDoc(doc(db, "contents", uid));

    if (!contentDoc.exists()) {
      return null;
    }

    return contentDoc.data() as Content;
  }

  static async deleteContent(content_id: string) {
    console.log("Deleting content...");

    try {
      // 1- Get Content
      const contentRef = doc(db, "contents", content_id);
      const contentDoc = await getDoc(contentRef);
      const contentData = contentDoc.data() as Content;

      // 2- Delete thumbnail
      const thumbnail = contentData?.thumbnail;
      if (thumbnail) {
        await StorageService.deleteFile(thumbnail);
      }

      // 3- Delete actual content
      await deleteDoc(doc(db, "contents", content_id));

      // 4- Remove content from user list
      await removeContentFromUser(contentData.creatorUID, content_id);
    } catch (error) {
      console.error("Error! ", error);
      throw new Error(error);
    }
    return "Successfully deleted!";
  }

  static async editContent(content_id: string, data: Partial<Content>) {
    console.log("Editing content...");
    console.log(content_id);
    console.log(data);
    data.titleLower = data.title.toLowerCase();
    console.log(data.titleLower);
    console.log(data);
    try {
      await updateDoc(doc(db, `contents/${content_id}`), data);
      console.log("EDIT^^^^^^^^^^^^^^^^^EDIT");
    } catch (error) {
      console.error("Error while editing content! ", error);
      throw new Error(error);
    }
    return "Successfully edited!";
  }

  static async estimateReadTime(content: string) {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Like content
  static async likeContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }

      const contentData = contentDoc.data();
      const peopleWhoLiked = contentData?.peopleWhoLiked || []; // Ensure we initialize as an empty array if undefined

      // Check if the user has already liked the content
      if (peopleWhoLiked.includes(userId)) {
        throw new Error("You have already liked this content");
      }

      // Update the likes count and add the user to the peopleWhoLiked list
      await updateDoc(contentRef, {
        likes: (contentData?.likes ?? 0) + 1, // Increment likes
        peopleWhoLiked: arrayUnion(userId), // Add user to the list of people who liked
      });

      // Add this content to the user's liked content list
      await addLikedContentToUser(userId, contentID);

      // Fetch the updated document and return it
      const updatedContent = {
        ...contentData,
        likes:
          typeof contentData.likes === "number" ? contentData.likes + 1 : 1, // Ensure likes is always a number
        peopleWhoLiked: [...contentData.peopleWhoLiked, userId],
      };

      return { content: updatedContent }; // Return updated content
    } catch (error) {
      console.error("Error liking content:", error);
      throw new Error(error.message || "Failed to like content");
    }
  }

  // Unlike content
  static async unlikeContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }

      const contentData = contentDoc.data();

      // Check if user has already liked the content
      if (!contentData?.peopleWhoLiked?.includes(userId)) {
        throw new Error("You haven't liked this content yet.");
      }

      // Update the likes count and remove the user from the peopleWhoLiked list
      await updateDoc(contentRef, {
        likes: increment(-1),
        peopleWhoLiked: arrayRemove(userId),
      });

      // Remove this content from the user's liked content list
      await removeLikedContentFromUser(userId, contentID);

      // Fetch the updated content and return it
      const updatedContentDoc = await getDoc(contentRef);
      const updatedContent = updatedContentDoc.data();

      return { content: { ...updatedContent, id: contentID } }; // Return updated content with id
    } catch (error) {
      console.error("Error unliking content:", error);
      throw new Error(error.message || "Failed to unlike content");
    }
  }

  // Bookmark content
  static async bookmarkContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }

      const contentData = contentDoc.data();
      const bookmarkedBy = contentData?.bookmarkedBy || []; // Ensure it's initialized as an empty array if undefined

      // Check if the user has already bookmarked the content
      if (bookmarkedBy.includes(userId)) {
        throw new Error("You have already bookmarked this content");
      }

      // Update the content document to add the user to the bookmarkedBy list
      await updateDoc(contentRef, {
        bookmarkedBy: arrayUnion(userId),
      });

      // Add this content to the user's bookmarked content list
      await addBookmarkedContentToUser(userId, contentID);

      // Fetch the updated document and return it
      const updatedContentDoc = await getDoc(contentRef);
      const updatedContent = updatedContentDoc.data();

      return { content: updatedContent }; // Return updated content with the bookmarkedBy list updated
    } catch (error) {
      console.error("Error bookmarking content:", error);
      throw new Error(error.message || "Failed to bookmark content");
    }
  }

  // Unbookmark content
  static async unbookmarkContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }

      const contentData = contentDoc.data();
      const bookmarkedBy = contentData?.bookmarkedBy || [];

      // Check if user has already bookmarked the content
      if (!bookmarkedBy.includes(userId)) {
        throw new Error("You haven't bookmarked this content yet.");
      }

      // Update the content document to remove the user from the bookmarkedBy list
      await updateDoc(contentRef, {
        bookmarkedBy: arrayRemove(userId),
      });

      // Remove this content from the user's bookmarked content list
      await removeBookmarkedContentFromUser(userId, contentID);

      // Fetch the updated document and return it
      const updatedContentDoc = await getDoc(contentRef);
      const updatedContent = updatedContentDoc.data();

      return { content: updatedContent }; // Return updated content with the bookmarkedBy list updated
    } catch (error) {
      console.error("Error unbookmarking content:", error);
      throw new Error(error.message || "Failed to unbookmark content");
    }
  }

  // Share content with all updates in a single transaction
  static async shareContent(contentID: string, userId: string) {
    try {
      const contentRef = doc(db, "contents", contentID);
      const userRef = doc(db, "users", userId);

      const updatedContent = await runTransaction(db, async (transaction) => {
        // Step 1: Read all required documents first.
        const contentDoc = await transaction.get(contentRef);
        const userDoc = await transaction.get(userRef);

        if (!contentDoc.exists()) {
          throw new Error("Content not found");
        }
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }

        const contentData = contentDoc.data() as Content;

        // Step 2: Compute new values.
        const currentShares = contentData.shares || 0;
        const sharedBy = contentData.sharedBy || [];

        let newSharedBy: string[];
        let updatedShares: number;

        if (!sharedBy.includes(userId)) {
          // If the user hasn't shared yet, add them and increment.
          newSharedBy = [...sharedBy, userId];
          updatedShares = currentShares + 1;
          // Write updates for content document.
          transaction.update(contentRef, {
            sharedBy: newSharedBy,
            shares: updatedShares,
          });
          // Also update the user's sharedContent field.
          transaction.update(userRef, {
            sharedContent: arrayUnion(contentID),
          });
        } else {
          // The user has already shared—do not change anything.
          newSharedBy = sharedBy;
          updatedShares = currentShares;
        }

        // Step 3: Construct the updated data manually (without re-reading).
        const updatedData = {
          ...contentData,
          sharedBy: newSharedBy,
          shares: updatedShares,
        } as Content;

        // Normalize date fields.
        if (updatedData.dateCreated) {
          if (updatedData.dateCreated instanceof Timestamp) {
            updatedData.dateCreated = updatedData.dateCreated.toDate();
          } else if (typeof updatedData.dateCreated === "string") {
            updatedData.dateCreated = new Date(updatedData.dateCreated);
          }
        }
        if (updatedData.dateUpdated) {
          if (updatedData.dateUpdated instanceof Timestamp) {
            updatedData.dateUpdated = updatedData.dateUpdated.toDate();
          } else if (typeof updatedData.dateUpdated === "string") {
            updatedData.dateUpdated = new Date(updatedData.dateUpdated);
          }
        }

        return updatedData;
      });

      return { content: updatedContent };
    } catch (error) {
      console.error("Error sharing content:", error);
      throw new Error(error.message || "Failed to share content");
    }
  }

  // Unshare content
  static async unshareContent(contentID: string, userId: string) {
    try {
      const contentRef = doc(db, "contents", contentID);
      const userRef = doc(db, "users", userId);

      const updatedContent = await runTransaction(db, async (transaction) => {
        // Read both documents.
        const contentDoc = await transaction.get(contentRef);
        const userDoc = await transaction.get(userRef);

        if (!contentDoc.exists()) {
          throw new Error("Content not found");
        }
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }

        const contentData = contentDoc.data() as Content;
        const sharedBy = contentData.sharedBy || [];
        const currentShares = contentData.shares || 0;

        let newSharedBy: string[];
        let updatedShares: number;

        if (sharedBy.includes(userId)) {
          // Remove the user from sharedBy and decrement share count.
          newSharedBy = sharedBy.filter((id) => id !== userId);
          updatedShares = currentShares > 0 ? currentShares - 1 : 0;
          transaction.update(contentRef, {
            sharedBy: newSharedBy,
            shares: updatedShares,
          });
          // Also remove the content from user's sharedContent.
          transaction.update(userRef, {
            sharedContent: arrayRemove(contentID),
          });
        } else {
          // If the user hadn't shared, nothing changes.
          newSharedBy = sharedBy;
          updatedShares = currentShares;
        }

        const updatedData = {
          ...contentData,
          sharedBy: newSharedBy,
          shares: updatedShares,
        } as Content;

        // Normalize date fields.
        if (updatedData.dateCreated) {
          if (updatedData.dateCreated instanceof Timestamp) {
            updatedData.dateCreated = updatedData.dateCreated.toDate();
          } else if (typeof updatedData.dateCreated === "string") {
            updatedData.dateCreated = new Date(updatedData.dateCreated);
          }
        }
        if (updatedData.dateUpdated) {
          if (updatedData.dateUpdated instanceof Timestamp) {
            updatedData.dateUpdated = updatedData.dateUpdated.toDate();
          } else if (typeof updatedData.dateUpdated === "string") {
            updatedData.dateUpdated = new Date(updatedData.dateUpdated);
          }
        }

        return updatedData;
      });

      return { content: updatedContent };
    } catch (error) {
      console.error("Error unsharing content:", error);
      throw new Error(error.message || "Failed to unshare content");
    }
  }

  // Get all content from the database from every user
  static async getAllContent() {
    console.log("Getting all content...");

    try {
      const contentCollection = collection(db, "contents");
      const contentSnapshot = await getDocs(contentCollection);
      const contentList = contentSnapshot.docs.map(
        (doc) => doc.data() as Content
      );

      return contentList;
    } catch (error) {
      console.error("Error fetching all content: ", error);
      throw new Error(error.message || "Failed to fetch all content");
    }
  }

  // Get all trending content
  static async getTrendingContent(limit = 10) {
    console.log("Getting trending content...");

    try {
      const allContent = await ContentService.getAllContent();

      // Sorts by likes in descending order (trending content is highest liked)
      const trendingContent = [...allContent]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, limit);

      return trendingContent as Content[];
    } catch (error) {
      console.error("Error fetching trending content: ", error);
      throw new Error(error.message || "Failed to fetch trending content");
    }
  }

  // Get personalized content (for users)
  static async getPersonalizedContent(userId: string, limit = 20) {
    console.log("Getting personalized content for user:", userId);
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const likedContent = userData.likedContent || [];
      const following = userData.following || [];

      const allContent = await ContentService.getAllContent();

      // Extract scoring logic to separate methods for better maintainability
      const scoredContent = allContent.map((content) => {
        // Calculate different types of scores
        const creatorScore = this.calculateCreatorScore(content, following);
        const similarityScore = this.calculateSimilarityScore(
          content,
          likedContent,
          allContent
        );
        const popularityScore = this.calculatePopularityScore(content);
        const recencyScore = this.calculateRecencyScore(content);

        // Combine all scores
        const score =
          creatorScore + similarityScore + popularityScore + recencyScore;

        return { ...content, score };
      });

      let personalizedContent = scoredContent
        .filter((content) => content.score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (personalizedContent.length < 5) {
        console.log("Not enough personalized content, adding trending content");
        const trendingContent = await this.getTrendingContent(10);

        const existingUids = personalizedContent.map(
          (c) => (c as Content & { score: number }).uid
        );
        const additionalContent = trendingContent
          .filter((c) => !existingUids.includes(c.uid))
          .map((content) => ({
            ...content,
            score: 3,
          }));

        personalizedContent = [
          ...personalizedContent,
          ...additionalContent,
        ].slice(0, limit);
      }

      return personalizedContent as Content[];
    } catch (error) {
      console.error("Error fetching personalized content: ", error);
      throw new Error(error.message || "Failed to fetch personalized content");
    }
  }

  // Helper methods for calculating different score components
  private static calculateCreatorScore(
    content: any,
    following: string[]
  ): number {
    // Score++ if creator is followed by user
    return following.includes(content.creatorUID) ? 10 : 0;
  }

  private static calculateSimilarityScore(
    content: any,
    likedContent: string[],
    allContent: any[]
  ): number {
    // If user has liked this content, we'll consider it but with consistent scoring
    if (likedContent.includes(content.uid)) {
      return 5; // Always give a positive score for content similar to what user liked
    }

    // Otherwise, check for similarity with other liked content
    let similarityScore = 0;
    for (const likedId of likedContent) {
      const likedItem = allContent.find((item) => item.id === likedId);
      if (likedItem?.titleLower && content.titleLower) {
        const likedWords = likedItem.titleLower.split(" ");
        const contentWords = content.titleLower.split(" ");

        const matchingWords = likedWords.filter(
          (word: string) => word.length > 3 && contentWords.includes(word)
        ).length;

        if (matchingWords > 0) {
          similarityScore += matchingWords * 2;
        }
      }
    }
    return similarityScore;
  }

  private static calculatePopularityScore(content: any): number {
    // Score++ for likes and views
    return (content.likes || 0) * 0.2 + (content.views || 0) * 0.1;
  }

  private static calculateRecencyScore(content: any): number {
    if (!content.dateCreated) return 0;

    const now = new Date();
    const contentDate =
      content.dateCreated instanceof Date
        ? content.dateCreated
        : new Date(content.dateCreated);

    const daysDiff = Math.floor(
      (now.getTime() - contentDate.getTime()) / (1000 * 3600 * 24)
    );

    // Give higher scores to newer content (less than 7 days old)
    return daysDiff < 7 ? (7 - daysDiff) * 0.5 : 0;
  }

  //Increment the number of views on an article
  static async incrementViewCount(contentID: string) {
    try {
      // Get the content reference to update
      const contentRef = doc(db, "contents", contentID);
      // Get the content of the document to increment the views
      const contentDoc = await getDoc(contentRef);
      if (!contentDoc.exists()) {
        throw new Error("Content not found.");
      }
      const data = contentDoc.data()?.views;
      const views = data || 0;
      // Update the document with the new number of views
      await updateDoc(contentRef, { views: views + 1 });
      return "Successfully incremented view count!";
    } catch (error) {
      console.error("Error incrementing the view count: ", error);
      throw error;
    }
  }

  //Increment the number of recorded shares on an article
  static async incrementShareCount(contentID: string) {
    try {
      // Get the content reference to update
      const contentRef = doc(db, "contents", contentID);
      // Get the content of the document to increment the shares
      const contentDoc = await getDoc(contentRef);
      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }
      const data = contentDoc.data()?.shares;
      const shares = data || 0;
      // Update the document with the new number of shares
      await updateDoc(contentRef, { shares: shares + 1 });
      return "Successfully incremented share count!";
    } catch (error) {
      console.error("Error incrementing the share count: ", error);
      throw error;
    }
  }
}

```

# backend\Dockerfile

```
FROM node:18-bullseye

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

```

# backend\eslint.config.mjs

```mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {rules: {"@typescript-eslint/no-explicit-any": "off"}},
];
```

# backend\jest.config.js

```js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json'
        }]
    },
    transformIgnorePatterns: [
        '/node_modules/'
    ],
    verbose: true,
    testTimeout: 30000
};
```

# backend\package.json

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Summarizz backend server",
  "main": "server.ts",
  "scripts": {
    "start": "tsc && node dist/shared/server.js",
    "dev": "nodemon --watch 'shared/**/*.ts' --exec ts-node shared/server.ts",
    "lint": "eslint . --ext .ts",
    "test": "jest"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@eslint/js": "^9.13.0",
    "@jest/globals": "^29.7.0",
    "@types/express": "^4.17.1",
    "@types/jest": "^29.5.14",
    "eslint": "^9.13.0",
    "globals": "^15.11.0",
    "jest": "^29.7.0",
    "nodemon": "^3.1.7",
    "ts-jest": "^29.2.6",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.3",
    "typescript-eslint": "^8.12.0"
  },
  "dependencies": {
    "@algolia/client-search": "^5.20.4",
    "@types/jsonwebtoken": "^9.0.7",
    "algoliasearch": "^4.24.0",
    "axios": "^1.7.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.17.1",
    "firebase": "^11.0.2",
    "firebase-admin": "^13.0.1",
    "formidable": "^3.5.2",
    "jsonwebtoken": "^9.0.2",
    "stripe": "^18.0.0",
    "winston": "^3.17.0"
  }
}

```

# backend\search-module\controllers\searchController.ts

```ts
import { Request, Response } from "express";
import SearchService from "../services/searchService";
import { getLoggerWithContext } from "../../shared/loggingHandler";

const logger = getLoggerWithContext("SearchController");

export class SearchController {
	/**
	 * @description
	 * Fetches 5 users at a time where their username matches or starts with the text 
	 * provided to the search query. If a starting point is provided, the search query 
	 * starts from the provided starting point.
	 * 
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	static async searchUsers(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		const userStartingPoint = query.userStartingPoint;

		logger.info(`Searching for users that match the following: ${searchText}`);
		try {
			const response = await SearchService.searchUsers(searchText, userStartingPoint);
			res.status(200).json(response);
		} catch (error) {
			logger.error(`Error searching users: ${error.message || error}`);
			res.status(500).json({ error: 'Failed to search users' });
		}
	}

	/**
	 * @description
	 * Fetches 5 content items at a time where their title matches or starts with the
	 * text provided to the search query.
	 * 
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	static async searchContent(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		logger.info(`Searching for content that matches the following: ${searchText}`);

		try {
			const response = await SearchService.searchContent(searchText);
			res.status(200).json(response);
		} catch (error) {
			logger.error(`Error searching content: ${error.message || error}`);
			res.status(500).json({ error: 'Failed to search content' });
		}
	}
}

```

# backend\search-module\routes\searchRoutes.ts

```ts
import { Router } from "express";

import { SearchController } from "../controllers/searchController";
const searchRoutes = Router();

searchRoutes.get("/users/", SearchController.searchUsers);
searchRoutes.get("/content/", SearchController.searchContent);

export default searchRoutes;

```

# backend\search-module\services\searchService.ts

```ts
import algoliasearch from "algoliasearch";
import { db } from "../../shared/firebaseConfig";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";
import { getLoggerWithContext } from "../../shared/loggingHandler";

const logger = getLoggerWithContext("SearchService");

export class SearchService {
  private static algoliaClient: ReturnType<typeof algoliasearch> | null = null;
  private static readonly ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;

  private static getAlgoliaClient() {
    if (!SearchService.algoliaClient) {
      const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
      const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY;
      SearchService.algoliaClient = algoliasearch(
        ALGOLIA_APP_ID,
        ALGOLIA_ADMIN_KEY
      );
    }
    return SearchService.algoliaClient;
  }

  /**
   * searchUsers(searchText: string, startingPoint:string)
   *
   * @description
   * Fetches 5 users at a time where their username matches or starts with the text provided to the search query.
   * If a starting point is provided, the search query starts from the provided starting point.
   *
   * @param searchText - The text to search for in the username.
   * @param startingPoint - The starting point for the search query.
   * @returns An array of users matching the search query.
   */
  static async searchUsers(searchText: string, startingPoint = null) {
    logger.info(`Searching for users that match the following: ${searchText}`);
    const userRef = collection(db, "users");
    const limitNumber: number = 5;

    // Create the base user query (no previous query)
    const userQuery = query(
      userRef,
      where("usernameLower", ">=", searchText.toLowerCase()),
      where("usernameLower", "<=", searchText.toLowerCase() + "\uf8ff"),
      orderBy("usernameLower"),
      limit(limitNumber)
    );

    /**
     * If a starting point is provided, create a new query starting at that point
     * (fetch next 5 documents starting after the starting point)
     */
    if (startingPoint) {
      logger.info(`Starting point: ${startingPoint}.`);
      logger.info("Starting point (JSON):", JSON.stringify(startingPoint, null, 3));

      const nextUserQuery = query(
        userRef,
        where("usernameLower", ">=", searchText.toLowerCase()),
        where("usernameLower", "<=", searchText.toLowerCase() + "\uf8ff"),
        orderBy("usernameLower"),
        limit(limitNumber),
        startAfter(startingPoint)
      );

      const results = await getDocs(nextUserQuery);
      const documents = results.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      let nextStartingPoint = null;

      if (documents.length >= limitNumber) {
        nextStartingPoint =
          results.docs[results.docs.length - 1]?.data().usernameLower;
      }

      logger.info(`Setting starting point: ${nextStartingPoint}.`);
      return { documents, nextStartingPoint };
    } else {
      // If there's no starting point, execute base query
      logger.info("No starting point provided, starting from the beginning.");

      const results = await getDocs(userQuery);
      const documents = results.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      let newStartingPoint = null;

      if (documents.length >= limitNumber) {
        newStartingPoint =
          results.docs[results.docs.length - 1]?.data().usernameLower;
      }

      logger.info(`Setting starting point: ${newStartingPoint}.`);
      return { documents, newStartingPoint };
    }
  }

  /**
   * searchContent(searchText: string, startingPoint:string)
   *
   * @description
   * Fetches 5 items at a time where their titles match or start with the text provided to the search query.
   * If a starting point is provided, the search query starts from the provided starting point.
   *
   * @param searchText - Text to search for
   * @returns - Object containing the documents and next starting point
   * @throws - Error if search fails, i.e if the search query fails
   */
  static async searchContent(searchText: string) {
    try {
      if (!searchText) {
        return { documents: [], nextStartingPoint: null };
      }

      const client = this.getAlgoliaClient();
      const index = client.initIndex(this.ALGOLIA_INDEX_NAME);
      const { hits } = await index.search(searchText);

      logger.info(`Algolia search results length: ${hits.length}, hits: ${hits}`);

      // Fetch corresponding Firebase documents
      const firebaseDocuments = await Promise.all(
        hits.map(async (hit) => {
          const docRef = doc(db, "contents", hit.objectID);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            return {
              id: docSnap.id,
              ...docSnap.data(),
              searchRanking: hit._rankingInfo?.nbTypos ?? 0,
            };
          }
          return null;
        })
      );

      // Filter out any null values (in case some documents weren't found in Firebase)
      const documents = firebaseDocuments.filter(
        (doc): doc is NonNullable<typeof doc> => doc !== null
      );

      return {
        documents,
        nextStartingPoint: null,
      };
    } catch (err) {
      logger.error(`Something went wrong, error: ${err}`);
      throw new Error(`Failed to search for content, error: ${err}`);

    }
  }
}

export default SearchService;

```

# backend\shared\firebaseAdminConfig.ts

```ts
import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const adminAuth = getAuth();

export { adminAuth };

```

# backend\shared\firebaseConfig.ts

```ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { logger } from "./loggingHandler";

dotenv.config();

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize firebase, db, realtime_db, auth, storage
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const realtime_db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(
  firebaseApp,
  "gs://summarizz-d3713.firebasestorage.app"
);

// Conditionally initialize analytics if supported
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(firebaseApp);
    logger.info("Firebase Analytics initialized.");

  } else {
    logger.info("Firebase Analytics is not supported in this environment.");

  }
});

export { firebaseApp, analytics, db, realtime_db, auth, storage };

```

# backend\shared\loggingHandler.ts

```ts
import winston from "winston";
const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "white",
};

winston.addColors(colors);

// Custom format for console logging (Console-Only)
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 
        ? `\n${JSON.stringify(meta, null, 2)}` 
        : '';
    
    return `${timestamp} [${level}]: ${message}${metaStr}`;
});

// 1- Development Environment Logger (Console-Only)
const developmentLogger = () => {
    return winston.createLogger({
        level: 'debug',
        levels,
        format: combine(
            errors({ stack: true }),
            splat(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
            consoleFormat
        ),
        transports: [
            new winston.transports.Console({
                format: combine(
                    colorize({ all: true }),
                    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
                    consoleFormat
                )
            })
        ],
        exitOnError: false
    });
};

// 2- Production Environment Logger (Console-Only)
const productionLogger = () => {
    return winston.createLogger({
        level: 'info',
        levels,
        format: combine(
            errors({ stack: false }),
            splat(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
        ),
        transports: [
            new winston.transports.Console({
                format: combine(
                    colorize({ all: true }),
                    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                    printf(({ level, message, timestamp }) => {
                        return `${timestamp} [${level}]: ${message}`;
                    })
                )
            })
        ],
        exitOnError: false
    });
};

// Switch between appropriate logger based on NODE_ENV
const logger = process.env.NODE_ENV === 'production'
    ? productionLogger()
    : developmentLogger();

// Stream for use with Morgan HTTP logger middleware: https://expressjs.com/en/resources/middleware/morgan.html
const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    }
};

const getLoggerWithContext = (context: string) => {
    return {
        error: (message: string, meta = {}) => logger.error(`[${context}] ${message}`, meta),
        warn: (message: string, meta = {}) => logger.warn(`[${context}] ${message}`, meta),
        info: (message: string, meta = {}) => logger.info(`[${context}] ${message}`, meta),
        http: (message: string, meta = {}) => logger.http(`[${context}] ${message}`, meta),
        verbose: (message: string, meta = {}) => logger.verbose(`[${context}] ${message}`, meta),
        debug: (message: string, meta = {}) => logger.debug(`[${context}] ${message}`, meta),
    };
};

export { logger, stream, getLoggerWithContext };

```

# backend\shared\middleware\auth.ts

```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT token
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      uid: string;
      email: string;
    };

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

```

# backend\shared\server.ts

```ts
import express from "express";
import "./firebaseConfig";
import cors from "cors";
import contentRoutes from "../content-module/routes/contentRoutes";
import userRoutes from "../user-module/routes/userRoutes";
import commentRoutes from "../comment-module/routes/commentRoutes";
import searchRoutes from "../search-module/routes/searchRoutes";
import oauthRoutes from "../user-module/routes/oauthRoutes";
import subscriptionRoutes from "../subscription-module/routes/subscriptionRoutes";
import webhookRoutes from "../subscription-module/routes/webhookRoutes";
import { logger } from "./loggingHandler";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.BACKEND_URL,
      process.env.NETLIFY_URL,
    ],
  })
);

// Parse JSON requests, but use raw body for webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use("/comment", commentRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);
app.use("/search", searchRoutes);
app.use("/oauth", oauthRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/stripe", webhookRoutes);

// Middleware to log all requests
app.use((req, _, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.send("Server is Listening!");
});

app.listen(port, () => {
  logger.http(`Express is listening at http://localhost:${port}`);
});

```

# backend\storage-module\services\serviceStorage.ts

```ts
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../shared/firebaseConfig";
import { logger } from "../../shared/loggingHandler";
import fs from "fs/promises";

export class StorageService {
  /**
   * @description Uploads a file to Firebase Storage
   *
   * @param file
   * @param filePath
   * @param fileName
   * @param fileType
   *
   * @returns - Object containing the download URL of the uploaded file
   * @throws - Error if file upload fails
   */
  static async uploadFile(
    file,
    filePath: string,
    fileName: string,
    fileType: string
  ) {
    try {
      console.log("Uploading File...");

      const storageRef = ref(storage, `${filePath}/${fileName}`);
      const metadata = {
        contentType: fileType,
      };
      const fileBuffer = await fs.readFile(file.filepath);

      const snapshot = await uploadBytes(storageRef, fileBuffer, metadata);
      logger.info(`
        File: ${file}
        FileBuffer: ${fileBuffer}
        Path: ${filePath}
        FileName: ${fileName}
        StorageRef: ${storageRef}
      `);
      logger.info("File uploaded successfully.");

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      logger.info("Download URL:", downloadURL);

      return { url: downloadURL };
    } catch (error) {
      let errorMessage = error.message;

      // Remove "Firebase: " prefix from the error message
      if (errorMessage.startsWith("Firebase: ")) {
        errorMessage = errorMessage.replace("Firebase: ", "");
      }
      throw new Error(errorMessage);

    }
  }

  /**
   *
   * @description - Deletes a file from Firebase Storage
   *
   * @param filePath - Path to the file in Firebase Storage (can be a URL)
   * @returns - void
   * @throws - Error if file path is not provided
   */
  static async deleteFile(filePath: string) {
    if (!filePath) {
      throw new Error("File path is required.");
    }

    if (filePath.includes("https://firebasestorage.googleapis.com")) {
      filePath = await StorageService.extractFilePathFromUrl(filePath);
    }

    const fileRef = ref(storage, `${filePath}`);

    try {
      await deleteObject(fileRef);
      logger.info(`File ${filePath} deleted.`);

    } catch (error) {
      logger.error(`Error deleting file ${filePath}: `, error);

    }
  }

  /**
   * Extracts the file path from a Firebase Storage URL.
   *
   * @param url - The full URL of the file in Firebase Storage.
   * @returns The file path to be used with Firebase Storage methods.
   */
  static async extractFilePathFromUrl(url: string): Promise<string> {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.*?)\?/);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error("Invalid Firebase Storage URL");

  }
}

```

# backend\subscription-module\controllers\subscriptionController.ts

```ts
import { Request, Response } from 'express';
import { db } from '../../shared/firebaseConfig';
import stripeService from '../services/stripeService';
import subscriptionService from '../services/subscriptionService';
import dotenv from 'dotenv';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

dotenv.config();

/**
 * Controller for handling subscription-related requests
 */
export class SubscriptionController {
  /**
   * Create a checkout session for subscription
   * @param req Express request
   * @param res Express response
   */
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      
      if (
        userData?.subscriptionStatus === 'active' && 
        userData?.subscriptionTier === 'pro'
      ) {
        res.status(400).json({ 
          error: 'User already has an active subscription',
          redirectToManage: true
        });
        return;
      }

      let customerId = userData?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripeService.createCustomer(
          userData?.email,
          `${userData?.firstName} ${userData?.lastName}`
        );
        
        customerId = customer.id;
        
        await updateDoc(userRef, {
          stripeCustomerId: customerId
        });
      }

      // For production, we would create a real checkout session like this:
      // const session = await stripeService.createCheckoutSession(
      //   customerId,
      //   process.env.STRIPE_PRICE_ID || '',
      //   `${process.env.FRONTEND_URL}/pro/success`,
      //   `${process.env.FRONTEND_URL}/pro/cancel`
      // );
      // res.status(200).json({ url: session.url });
      
      const testCheckoutUrl = "https://buy.stripe.com/test_bIY5nxgiD2TyghO8ww";
      
      res.status(200).json({ url: testCheckoutUrl });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cancel a subscription
   * @param req Express request
   * @param res Express response
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      
      if (
        !userData?.subscriptionStatus || 
        userData?.subscriptionStatus === 'canceled' ||
        !userData?.stripeSubscriptionId
      ) {
        res.status(400).json({ error: 'No active subscription found' });
        return;
      }

      const subscription = await stripeService.cancelSubscription(
        userData.stripeSubscriptionId,
        true
      );

      const canceledAt = subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000) 
        : new Date();
      
      await subscriptionService.updateUserSubscription(uid, {
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: canceledAt,
      });

      res.status(200).json({ 
        message: 'Subscription canceled successfully',
        willEndOn: new Date((subscription as any).current_period_end * 1000)
      });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user subscription status
   * @param req Express request
   * @param res Express response
   */
  async getSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      
      res.status(200).json({
        status: userData?.subscriptionStatus || 'free',
        tier: userData?.subscriptionTier || 'free',
        periodEnd: userData?.subscriptionPeriodEnd || null,
        canceledAt: userData?.subscriptionCanceledAt || null,
        gracePeriodEnd: userData?.gracePeriodEnd || null,
      });
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SubscriptionController();

```

# backend\subscription-module\controllers\webhookController.ts

```ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripeService from '../services/stripeService';
import subscriptionService from '../services/subscriptionService';
import dotenv from 'dotenv';

/**
 * Controller for handling Stripe webhook events
 */
export class WebhookController {
  /**
   * Handle Stripe webhook events
   * @param req Express request
   * @param res Express response
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    console.log('Webhook received:', new Date().toISOString());
    
    const signature = req.headers['stripe-signature'] as string;
    const isTestMode = process.env.STRIPE_TEST_MODE === 'true';
    
    if (!signature && !isTestMode) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    try {
      let event;
      
      if (isTestMode && !signature) {
        console.log('Running in test mode - accepting webhook without signature verification');
        event = req.body;
      } else {
        event = stripeService.constructWebhookEvent(
          req.body,
          signature
        );
      }

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event);
          break;
        case 'customer.subscription.trial_will_end':
          console.log('Trial will end soon for subscription:', event.data.object.id);
          break;
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Handle subscription created event
   * @param event Stripe event
   */
  private async handleSubscriptionCreated(event: any): Promise<void> {
    const subscription = event.data.object;
    await subscriptionService.handleSubscriptionCreated(
      subscription.id,
      subscription.customer
    );
  }

  /**
   * Handle subscription updated event
   * @param event Stripe event
   */
  private async handleSubscriptionUpdated(event: any): Promise<void> {
    const subscription = event.data.object;
    await subscriptionService.handleSubscriptionUpdated(subscription.id);
  }

  /**
   * Handle subscription canceled event
   * @param event Stripe event
   */
  private async handleSubscriptionCanceled(event: any): Promise<void> {
    const subscription = event.data.object;
    await subscriptionService.handleSubscriptionCanceled(subscription.id);
  }

  /**
   * Handle payment failed event
   * @param event Stripe event
   */
  private async handlePaymentFailed(event: any): Promise<void> {
    const invoice = event.data.object;
    if (invoice.subscription) {
      await subscriptionService.handlePaymentFailed(invoice.subscription);
    }
  }

  /**
   * Handle payment succeeded event
   * @param event Stripe event
   */
  private async handlePaymentSucceeded(event: any): Promise<void> {
    const invoice = event.data.object;
    if (invoice.subscription) {
      if (invoice.billing_reason === 'subscription_create' && invoice.payment_intent) {
        try {
          const paymentIntent = await stripeService.getPaymentIntent(invoice.payment_intent);
          
          if (paymentIntent && paymentIntent.payment_method) {
            await stripeService.updateSubscriptionDefaultPaymentMethod(
              invoice.subscription,
              paymentIntent.payment_method as string
            );
            console.log(`Default payment method set for subscription: ${invoice.subscription}`);
          }
        } catch (error) {
          console.error('Error setting default payment method:', error);
        }
      }
      
      await subscriptionService.handleSubscriptionUpdated(invoice.subscription);
    }
  }
}

export default new WebhookController();

```

# backend\subscription-module\routes\subscriptionRoutes.ts

```ts
import express from 'express';
import subscriptionController from '../controllers/subscriptionController';
import { authenticateToken } from '../../shared/middleware/auth';

const router = express.Router();

router.post(
  '/create-checkout-session',
  authenticateToken,
  subscriptionController.createCheckoutSession.bind(subscriptionController)
);

router.post(
  '/cancel',
  authenticateToken,
  subscriptionController.cancelSubscription.bind(subscriptionController)
);

router.get(
  '/status',
  authenticateToken,
  subscriptionController.getSubscriptionStatus.bind(subscriptionController)
);

export default router;

```

# backend\subscription-module\routes\webhookRoutes.ts

```ts
import express from 'express';
import webhookController from '../controllers/webhookController';

const router = express.Router();

// Raw body needed for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookController.handleWebhook.bind(webhookController)
);

export default router;

```

# backend\subscription-module\services\stripeService.ts

```ts
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

/**
 * Service for handling Stripe-related operations
 */
export class StripeService {
  /**
   * Create a Stripe customer for a user
   * @param email User's email
   * @param name User's full name
   * @returns Stripe customer object
   */
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   * @param customerId Stripe customer ID
   * @param priceId Stripe price ID for the subscription
   * @param successUrl URL to redirect after successful payment
   * @param cancelUrl URL to redirect after canceled payment
   * @returns Checkout session
   */
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Retrieve a subscription by ID
   * @param subscriptionId Stripe subscription ID
   * @returns Subscription object
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   * @param subscriptionId Stripe subscription ID
   * @param cancelAtPeriodEnd Whether to cancel at the end of the billing period
   * @returns Canceled subscription object
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Construct Stripe webhook event from payload and signature
   * @param payload Request body as string
   * @param signature Stripe signature from headers
   * @returns Stripe event
   */
  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  /**
   * Retrieve a payment intent by ID
   * @param paymentIntentId Stripe payment intent ID
   * @returns Payment intent object
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  /**
   * Update the default payment method for a subscription
   * @param subscriptionId Stripe subscription ID
   * @param paymentMethodId Stripe payment method ID
   * @returns Updated subscription object
   */
  async updateSubscriptionDefaultPaymentMethod(
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
      });
      return subscription;
    } catch (error) {
      console.error('Error updating subscription payment method:', error);
      throw error;
    }
  }
}

export default new StripeService();

```

# backend\subscription-module\services\subscriptionService.ts

```ts
import { db } from '../../shared/firebaseConfig';
import { User } from '../../user-module/models/userModel';
import stripeService from './stripeService';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  where,
  getDocs,
  query,
  arrayUnion,
} from "firebase/firestore";

/**
 * Service for managing user subscriptions
 */
export class SubscriptionService {
  /**
   * Update a user's subscription status
   * @param uid User ID
   * @param subscriptionData Subscription data to update
   * @returns Updated user data
   */
  async updateUserSubscription(
    uid: string,
    subscriptionData: Partial<User>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, subscriptionData);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  /**
   * Handle subscription created event
   * @param subscriptionId Stripe subscription ID
   * @param customerId Stripe customer ID
   * @returns Updated user data
   */
  async handleSubscriptionCreated(
    subscriptionId: string,
    customerId: string
  ): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeCustomerId', '==', customerId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe customer ID: ${customerId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const periodStart = new Date((subscription as any).current_period_start * 1000);
      const periodEnd = new Date((subscription as any).current_period_end * 1000);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: subscription.status as any,
        subscriptionTier: 'pro',
        stripeSubscriptionId: subscriptionId,
        subscriptionPeriodStart: periodStart,
        subscriptionPeriodEnd: periodEnd,
      });
    } catch (error) {
      console.error('Error handling subscription created:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   * @param subscriptionId Stripe subscription ID
   * @returns Updated user data
   */
  async handleSubscriptionUpdated(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe subscription ID: ${subscriptionId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const periodStart = new Date((subscription as any).current_period_start * 1000);
      const periodEnd = new Date((subscription as any).current_period_end * 1000);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: subscription.status as any,
        subscriptionPeriodStart: periodStart,
        subscriptionPeriodEnd: periodEnd,
      });
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription canceled event
   * @param subscriptionId Stripe subscription ID
   * @returns Updated user data
   */
  async handleSubscriptionCanceled(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe subscription ID: ${subscriptionId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const canceledAt = (subscription as any).canceled_at 
        ? new Date((subscription as any).canceled_at * 1000) 
        : new Date();
      const periodEnd = new Date((subscription as any).current_period_end * 1000);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: canceledAt,
      });
    } catch (error) {
      console.error('Error handling subscription canceled:', error);
      throw error;
    }
  }

  /**
   * Handle payment failed event
   * @param subscriptionId Stripe subscription ID
   * @returns Updated user data
   */
  async handlePaymentFailed(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe subscription ID: ${subscriptionId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: 'past_due',
        gracePeriodEnd,
      });
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  /**
   * Check and update subscription statuses that have expired
   * This should be run on a schedule (e.g., daily)
   */
  async checkExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();
      const usersQuery = query(
        collection(db, 'users'),
        where('subscriptionTier', '==', 'pro'),
        where('subscriptionStatus', 'in', ['canceled', 'past_due'])
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      for (const doc of usersSnapshot.docs) {
        const user = doc.data() as User;
        
        if (
          user.subscriptionStatus === 'canceled' && 
          user.subscriptionPeriodEnd && 
          new Date(user.subscriptionPeriodEnd as any) < now
        ) {
          await this.updateUserSubscription(doc.id, {
          subscriptionTier: 'free',
          subscriptionStatus: 'canceled',
        });
        }
        
        if (
          user.subscriptionStatus === 'past_due' && 
          user.gracePeriodEnd && 
          new Date(user.gracePeriodEnd as any) < now
        ) {
          await this.updateUserSubscription(doc.id, {
            subscriptionTier: 'free',
            subscriptionStatus: 'canceled',
          });
        }
      }
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();

```

# backend\tests\user-module.spec.ts

```ts
import axios from "axios";
import { describe, expect } from "@jest/globals";

// Configuration for tests
const API_URL = 'http://localhost:3000';
const testUserCredentials = {
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${Math.floor(Math.random() * 10000)}`, // Ensure unique username
    email: `testuser${Math.floor(Math.random() * 10000)}@example.com`, // Ensure unique email
    password: 'Password123!'
};

let userId: string | null = null;
let authToken: string | null = null;

describe('User Module Tests', () => {
    // Test user registration
    it('should register a new user', async () => {
        try {
            const response = await axios.post(`${API_URL}/user/register`, testUserCredentials);

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('userUID');
            expect(response.data).toHaveProperty('token');

            userId = response.data.userUID;
            authToken = response.data.token;

            console.log('Registered user with ID:', userId);
        } catch (error: any) {
            console.error('Registration error:', error.response ? error.response.data : error);
            throw error;
        }
    });

    // Test user login
    it('should login with registered credentials', async () => {
        const loginCredentials = {
            email: testUserCredentials.email,
            password: testUserCredentials.password
        };

        try {
            const response = await axios.post(`${API_URL}/user/login`, loginCredentials);

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('userUID');
            expect(response.data).toHaveProperty('token');
            expect(response.data.userUID).toBe(userId);
        } catch (error: any) {
            console.error('Login error:', error.response ? error.response.data : error);
            throw error;
        }
    });

    // Test get user profile
    it('should get user profile by ID', async () => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('username', testUserCredentials.username);
            expect(response.data).toHaveProperty('email', testUserCredentials.email);
            expect(response.data).toHaveProperty('firstName', testUserCredentials.firstName);
            expect(response.data).toHaveProperty('lastName', testUserCredentials.lastName);
        } catch (error: any) {
            console.error('Get profile error:', error.response ? error.response.data : error);
            throw error;
        }
    });

    // Test update user profile - fixed to properly format data
    it('should update user profile with bio info', async () => {
        const updatedInfo = {
            bio: 'This is a test bio',
            username: testUserCredentials.username,
            usernameLower: testUserCredentials.username.toLowerCase()
        };

        try {
            const response = await axios.put(`${API_URL}/user/${userId}`, updatedInfo);

            expect(response.status).toBe(200);
            await new Promise(resolve => setTimeout(resolve, 500));
            const userResponse = await axios.get(`${API_URL}/user/${userId}`);

            expect(userResponse.data.bio).toBe(updatedInfo.bio);
        } catch (error: any) {
            console.error('Update profile error:',
                error.response ?
                    `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` :
                    error
            );
            throw error;
        }
    });

    // Test update user profile privacy setting
    it('should update profile privacy setting', async () => {
        const privacyUpdate = {
            isPrivate: true,
            username: testUserCredentials.username,
            usernameLower: testUserCredentials.username.toLowerCase()
        };

        try {
            const response = await axios.put(`${API_URL}/user/${userId}`, privacyUpdate);

            expect(response.status).toBe(200);
            await new Promise(resolve => setTimeout(resolve, 500));
            const userResponse = await axios.get(`${API_URL}/user/${userId}`);

            expect(userResponse.data.isPrivate).toBe(true);
        } catch (error: any) {
            console.error('Privacy update error:',
                error.response ?
                    `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` :
                    error
            );
            throw error;
        }
    });
});
```

# backend\tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./"
  },
  "lib": ["es2015"]
}


```

# backend\user-module\controllers\passwordResetController.ts

```ts
import { Request, Response } from "express";
import { sendPasswordResetEmail_Firebase } from "../services/passwordResetService";
import { getLoggerWithContext } from "../../shared/loggingHandler";

const logger = getLoggerWithContext("PasswordResetController");

/**
 * Controller for handling password reset requests, 
 * this directly uses Firebase's password reset 
 * functionality.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export async function requestPasswordResetController(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // We'll always return the same response regardless of whether the email exists
        // to prevent email enumeration attacks
        await sendPasswordResetEmail_Firebase(email);

        res.status(200).json({
            message: "An email was sent if it matches an existing account, follow the instructions provided in the email."
        });
    } catch (error) {
        logger.error("Error requesting password reset:", error);

        // For security, we still return a success message even if something went wrong
        res.status(200).json({
            message: "An email was sent if it matches an existing account, follow the instructions provided in the email."
        });
    }
}
```

# backend\user-module\controllers\userController.ts

```ts
// src/modules/user/controllers/userController.ts
import { Request, Response } from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  register,
  login,
  followUser,
  unfollowUser,
  requestFollow,
  changePassword,
  changeEmail,
  changeUsername,
  approveFollowRequest,
  rejectFollowRequest
} from "../services/userService";
import { IncomingForm } from "formidable";
import { StorageService } from "../../storage-module/services/serviceStorage";

// ----------------------------------------------------------
// --------------------- Authentication ---------------------
// ----------------------------------------------------------

export async function registerUserController(req: Request, res: Response) {
  console.log("Registering user...");
  const { firstName, lastName, username, email, password } = req.body;

  try {
    const response = await register(
      firstName,
      lastName,
      username,
      email,
      password
    );
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
}

export async function loginUserController(req: Request, res: Response) {
  console.log("Logging in user...");
  const { email, password } = req.body;

  try {
    const response = await login(email, password);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to login user" });
  }
}

// ----------------------------------------------------------
// ---------------------- User - CRUD -----------------------
// ----------------------------------------------------------

export async function uploadProfileImageController(
  req: Request,
  res: Response
) {
  console.log("Uploading Profile Image...");
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to upload profile image." });
    }

    const file = files.profileImage[0];
    const fileName = file.newFilename;
    const fileType = file.mimetype;

    // Delete old profile image if it exists
    const oldProfileImage = fields.oldProfileImage;
    if (oldProfileImage) {
      try {
        await StorageService.deleteFile(oldProfileImage);
      } catch (error) {
        return res.status(500).json({
          error:
            error.message || "Server Error: Failed to delete old profile image",
        });
      }
    }

    // Upload profile image to storage
    try {
      // Upload profile image
      const response = await StorageService.uploadFile(
        file,
        "profileImage",
        fileName,
        fileType
      );
      res.status(201).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ error: error.message || "Failed to upload profile image" });
    }
  });
}

// Create User
export async function createUserController(req: Request, res: Response) {
  console.log("Creating user...");
  const { firstName, lastName, username, email, password } = req.body;

  try {
    await createUser(firstName, lastName, username, email, password);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
}

// Get User
export async function getUserController(req: Request, res: Response) {
  console.log("Fetching user...");
  const { uid } = req.params;

  try {
    const user = await getUser(uid);
    if (user) res.status(200).json(user);
    else res.status(404).json({ error: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
}

// Update User
export async function updateUserController(req: Request, res: Response) {
  console.log("Updating user...");
  const { uid } = req.params;
  const data = req.body;
  try {
    await updateUser(uid, data);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update user" });
  }
}

// Change Password
export async function changePasswordController(req: Request, res: Response) {
  console.log("Changing password...");
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    await changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Failed to update password" });
  }
}

// Change Email Controller
export async function changeEmailController(req: Request, res: Response) {
  console.log("Changing email");
  const { userId } = req.params;
  const { currentPassword, newEmail } = req.body;

  try {
    await changeEmail(userId, currentPassword, newEmail);
    res.status(200).json({
      message:
        "A verification email has been sent to your new email address. Please check your inbox and verify it to complete the email update.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update email" });
  }
}

// Update username
export async function changeUsernameController(req: Request, res: Response) {
  console.log("Changing username");
  const { userId } = req.params;
  const { newUsername } = req.body;

  try {
    await changeUsername(userId, newUsername);
    res.status(200).json({ message: "Username updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Failed to update username" });
  }
}

// Delete User
export async function deleteUserController(req: Request, res: Response) {
  console.log("Deleting user...");
  const { uid } = req.params;
  const { password, email } = req.body;

  try {
    await deleteUser(uid, password, email);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete user" });
  }
}

// ----------------------------------------------------------
// -------------------- User Interactions -------------------
// ----------------------------------------------------------

// Profile View - Follow User
export async function followUserController(req: Request, res: Response) {
  console.log("Following user...");
  const { userId, targetId } = req.params;

  try {
    await followUser(userId, targetId);
    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to follow user" });
  }
}

// Profile View - Unfollow User
export async function unfollowUserController(req: Request, res: Response) {
  console.log("Unfollowing user...");
  const { userId, targetId } = req.params;

  try {
    await unfollowUser(userId, targetId);
    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to unfollow user" });
  }
}

// Profile View - Request Follow
export async function requestFollowController(req: Request, res: Response) {
  console.log("Requesting follow...");
  const { userId, targetId } = req.params;

  try {
    await requestFollow(userId, targetId);
    res.status(200).json({ message: "Follow request sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Failed to send follow request" });
  }
}

// Approve Follow Request
export async function approveFollowRequestController(req: Request, res: Response) {
  const { userId, requesterId } = req.params; // Get both IDs from params
  try {
      await approveFollowRequest(userId, requesterId);
      res.status(200).json({ message: "Follow request approved" });
  } catch (error) {
      console.error("Error approving follow request:", error);
      res.status(500).json({ error: error.message || "Failed to approve follow request" });
  }
}

// Reject Follow Request
export async function rejectFollowRequestController(req: Request, res: Response) {
  const { userId, requesterId } = req.params;
  try {
      await rejectFollowRequest(userId, requesterId);
      res.status(200).json({ message: "Follow request rejected" });
  } catch (error) {
      console.error("Error rejecting follow request:", error);
      res.status(500).json({ error: error.message || "Failed to reject follow request" });
  }
}

```

# backend\user-module\models\userModel.ts

```ts
export interface User {
  uid: string; // Firebase UID
  firstName: string; // User’s first name
  lastName: string; // User’s last name
  email: string; // User’s email
  username: string; // Display name
  createdAt: Date; // Timestamp
  profileImage?: string; // Optional profile image
  bio?: string; // Optional bio
  phone?: string; // Optional phone number
  dateOfBirth?: string; // Optional date of birth
  location?: string; // Optional location
  website?: string; // Optional website
  content?: string[]; // Optional content
  likedContent?: string[]; // Optional liked content
  bookmarkedContent?: string[]; // Optional bookmarked content
  following?: string[]; // Optional followed creators
  followers?: string[]; // Optional followed by users
  sharedContent?: string[]; // Optional shared content
  isPrivate?: boolean; // Optional private account
  usernameLower?: string; // Field for lowercase username, used for search queries.
  followRequests?: string[]; // Optional follow requests
  
  // Subscription related fields
  subscriptionStatus?: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'incomplete_expired'; // User's subscription status
  subscriptionTier?: 'free' | 'pro'; // User's subscription tier
  stripeCustomerId?: string; // Stripe customer ID
  stripeSubscriptionId?: string; // Stripe subscription ID
  subscriptionPeriodEnd?: Date; // When the current subscription period ends
  subscriptionPeriodStart?: Date; // When the current subscription period started
  subscriptionCanceledAt?: Date; // When the subscription was canceled (if applicable)
  gracePeriodEnd?: Date; // End of grace period for failed payments (if applicable)
}

```

# backend\user-module\routes\oauthRoutes.ts

```ts
import { Router } from "express";
import {
    verifyOAuthToken,
    generateOAuthUrl,
    handleOAuthCallback
} from "../services/oauthService";

const router = Router();

// Endpoint to verify OAuth tokens received from the client
router.post("/verify", verifyOAuthToken);

// Endpoint to generate OAuth URLs for different providers
router.post("/url", generateOAuthUrl);

// Callback endpoint for OAuth providers to redirect to after authorization
router.get("/callback/:provider", handleOAuthCallback);

export default router;
```

# backend\user-module\routes\userRoutes.ts

```ts
import { Router } from "express";
import {
  getUserController,
  updateUserController,
  uploadProfileImageController,
  deleteUserController,
  registerUserController,
  loginUserController,
  followUserController,
  unfollowUserController,
  requestFollowController,
  approveFollowRequestController,
  rejectFollowRequestController, 
  changePasswordController,
  changeEmailController,
  changeUsernameController,
} from "../controllers/userController";
import { requestPasswordResetController } from "../controllers/passwordResetController";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user

// Password reset route - using Firebase directly
router.post("/reset-password-request", requestPasswordResetController); // Request password reset

router.get("/:uid", getUserController); // Get a user by UID
router.put("/:uid", updateUserController); // Update a user by UID
router.delete("/:uid", deleteUserController); // Delete a user by UID
router.post("/upload-profile-image", uploadProfileImageController); // Upload Profile Image

// Profile View - Follow/Unfollow User
router.post("/:userId/follow/:targetId", followUserController); // Follow User
router.post("/:userId/unfollow/:targetId", unfollowUserController); // Unfollow User

// Profile View - Request Follow for Private Account
router.post("/:userId/request/:targetId", requestFollowController); // Request Follow
// Approve and Reject Follow Requests
router.post("/:userId/approve/:requesterId", approveFollowRequestController); // Approve Follow Request
router.post("/:userId/reject/:requesterId", rejectFollowRequestController); // Reject Follow Request

// Profile Management - Change Password
router.post("/:userId/change-password", changePasswordController); // Change Password

// Profile Management - Change Email/Username
router.post("/:userId/change-email", changeEmailController);
router.post("/:userId/change-username", changeUsernameController);

export default router;

```

# backend\user-module\services\oauthService.ts

```ts
import { adminAuth } from "../../shared/firebaseAdminConfig";
import { db } from "../../shared/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { getAuth, signInWithCredential, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

/**
 * Handle OAuth verification from providers
 * This function verifies the OAuth token from the provider
 * and creates a user account if it doesn't exist
 */
export async function verifyOAuthToken(req: Request, res: Response) {
    try {
        const { idToken, provider } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "No ID token provided" });
        }

        let uid, email, name, picture;

        // For Google tokens, verify directly with Google instead of Firebase
        if (provider === 'google') {
            try {
                // Verify the token with Google
                const response = await axios.get(
                    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
                );

                // Extract user info from the verification response
                const tokenInfo = response.data;
                uid = tokenInfo.sub;
                email = tokenInfo.email;
                name = tokenInfo.name;
                picture = tokenInfo.picture;

                // Additional check to verify the audience matches our client ID
                if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
                    return res.status(401).json({
                        error: "Token was not issued for this application"
                    });
                }
            } catch (error) {
                console.error("Google token verification error:", error);
                return res.status(401).json({
                    error: "Failed to verify Google token"
                });
            }
        } else {
            // For other providers or if needed later, you can add similar verification
            try {
                // Fallback to Firebase verification for other providers
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                uid = decodedToken.uid;
                email = decodedToken.email;
                name = decodedToken.name;
                picture = decodedToken.picture;
            } catch (error) {
                console.error("Firebase token verification error:", error);
                return res.status(401).json({
                    error: "Failed to verify token"
                });
            }
        }

        // Check if user exists in Firestore
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        // If user doesn't exist, create a new user document
        if (!userDoc.exists()) {
            const nameParts = name ? name.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            const username = email ? email.split('@')[0] : `user_${Date.now()}`;

            const newUser = {
                uid,
                firstName,
                lastName,
                username,
                email: email || '',
                profileImage: picture || undefined,
                createdAt: new Date(),
                authProvider: provider
            };

            await setDoc(userRef, newUser);
        }

        // Generate JWT token for the client
        const token = jwt.sign({ uid }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        return res.status(200).json({
            userUID: uid,
            token
        });

    } catch (error: any) {
        console.error("OAuth verification error:", error);
        return res.status(401).json({
            error: error.message || "Authentication failed"
        });
    }
}

/**
 * Generate OAuth URL for specific providers
 * Returns the URL where the user should be redirected to initiate OAuth flow
 */
export async function generateOAuthUrl(req: Request, res: Response) {
    try {
        const { provider, redirectUri } = req.body;

        // This would typically use Firebase Admin SDK to generate OAuth URLs
        // For demonstration, we're returning placeholder URLs
        let authUrl: string;

        switch (provider) {
            case 'google':
                authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${
                    process.env.GOOGLE_CLIENT_ID
                }&redirect_uri=${encodeURIComponent(
                    'http://localhost:3000/oauth/callback/google'
                )}&scope=email profile&response_type=code`;
                break;

            case 'github':
                authUrl = `https://github.com/login/oauth/authorize?client_id=${
                    process.env.GITHUB_CLIENT_ID
                }&redirect_uri=${encodeURIComponent(
                    'http://localhost:3000/oauth/callback/github'
                )}&scope=email profile&response_type=code`;
                break;

            default:
                return res.status(400).json({ error: "Unsupported provider" });
        }

        return res.status(200).json({ authUrl });

    } catch (error: any) {
        console.error("Generate OAuth URL error:", error);
        return res.status(500).json({ error: error.message || "Failed to generate OAuth URL" });
    }
}

/**
 * Exchange Google authorization code for Firebase token
 */
async function exchangeGoogleCodeForToken(code: string, redirectUri: string) {
    try {
        // Step 1: Exchange authorization code for access and ID tokens
        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }
        );

        const { id_token, access_token } = tokenResponse.data;

        // Step 2: Use the ID token to sign in with Firebase
        const auth = getAuth();
        const credential = GoogleAuthProvider.credential(id_token, access_token);
        const userCredential = await signInWithCredential(auth, credential);

        // Return user info
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL
        };
    } catch (error: any) {
        console.error("Error exchanging Google code for token:", error);
        throw new Error(error.message || "Failed to authenticate with Google");
    }
}

/**
 * Exchange GitHub authorization code for Firebase token
 */
async function exchangeGithubCodeForToken(code: string, redirectUri: string) {
    try {
        // Step 1: Exchange authorization code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: redirectUri
            },
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        const { access_token } = tokenResponse.data;

        // Step 2: Get user info from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${access_token}`
            }
        });

        // Step 3: Create GitHub credential and sign in
        const auth = getAuth();
        const credential = GithubAuthProvider.credential(access_token);
        const userCredential = await signInWithCredential(auth, credential);

        // Return user info
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || userResponse.data.name,
            photoURL: userCredential.user.photoURL || userResponse.data.avatar_url
        };
    } catch (error: any) {
        console.error("Error exchanging GitHub code for token:", error);
        throw new Error(error.message || "Failed to authenticate with GitHub");
    }
}

/**
 * Handle OAuth callback from providers
 * This endpoint is called by the OAuth provider after user authorization
 */
export async function handleOAuthCallback(req: Request, res: Response) {
    try {
        const provider = req.params.provider;
        const { code } = req.query;
        const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:3000'}/oauth/callback/${provider}`;

        // Exchange authorization code for tokens
        let userData: any;
        switch (provider) {
            case 'google':
                // Exchange code for token with Google
                userData = await exchangeGoogleCodeForToken(code as string, redirectUri);
                break;

            case 'github':
                // Exchange code for token with GitHub
                userData = await exchangeGithubCodeForToken(code as string, redirectUri);
                break;

            default:
                return res.status(400).json({ error: "Unsupported provider" });
        }

        // Check if user exists in Firestore and create if not
        const userRef = doc(db, "users", userData.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Create new user
            const nameParts = userData.displayName ? userData.displayName.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            const username = userData.email ? userData.email.split('@')[0] : `user_${Date.now()}`;

            const newUser = {
                uid: userData.uid,
                firstName,
                lastName,
                username,
                email: userData.email || '',
                profileImage: userData.photoURL || undefined,
                createdAt: new Date(),
                authProvider: provider
            };

            await setDoc(userRef, newUser);
        }

        // Generate JWT token for the client
        const token = jwt.sign({ uid: userData.uid }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Redirect to frontend with token
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?token=${token}&uid=${userData.uid}`;
        return res.redirect(redirectUrl);

    } catch (error: any) {
        console.error("OAuth callback error:", error);
        const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/error?message=${encodeURIComponent(error.message)}`;
        return res.redirect(errorUrl);
    }
}
```

# backend\user-module\services\passwordResetService.ts

```ts
import { auth } from "../../shared/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

/**
 * Sends a password reset email using Firebase Authentication
 * @param email - User's email address
 * @returns Promise<void>
 */
export async function sendPasswordResetEmail_Firebase(email: string): Promise<void> {
    try {
        // Set up custom redirect URL for your app after password reset
        const actionCodeSettings = {
            url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/authentication/login`,
            handleCodeInApp: false
        };

        // Send password reset email using Firebase Auth
        await sendPasswordResetEmail(auth, email, actionCodeSettings);

        // We don't need to return anything, Firebase handles the rest
    } catch (error) {
        console.error("Error sending password reset email:", error);
        // We intentionally don't throw here to prevent email enumeration
    }
}
```

# backend\user-module\services\userService.ts

```ts
import { db } from "../../shared/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  where,
  getDocs,
  query,
  arrayUnion,
} from "firebase/firestore";
import { User } from "../models/userModel";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import jwt from "jsonwebtoken";
import { ContentService } from "../../content-module/services/serviceContent";
import { StorageService } from "../../storage-module/services/serviceStorage";

// ----------------------------------------------------------
// --------------------- Authentication ---------------------
// ----------------------------------------------------------

export async function register(
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
) {
  const auth = getAuth();
  try {
    // Register user - Firebase Auth (Email & Password)
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user - Firestore Database (User Data)
    await createUser(user.uid, firstName, lastName, username, email);

    // Log the user
    return await login(email, password);
  } catch (error) {
    let errorMessage = error.message;
    // Remove "Firebase: " prefix from the error message
    if (errorMessage.startsWith("Firebase: ")) {
      errorMessage = errorMessage.replace("Firebase: ", "");
    }
    throw new Error(errorMessage);
  }
}

export async function login(email: string, password: string) {
  const auth = getAuth();
  try {
    // Sign in user - Firebase Auth (Email & Password)
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = jwt.sign({ _id: user.uid, email: email }, "YOUR_SECRET", {
      expiresIn: "30d",
    });

    return {
      userUID: user.uid,
      token: token,
    };
  } catch (error) {
    let errorMessage = error.message;
    // Remove "Firebase: " prefix from the error message
    if (errorMessage.startsWith("Firebase: ")) {
      errorMessage = errorMessage.replace("Firebase: ", "");
    }
    throw new Error(errorMessage);
  }
}

// ----------------------------------------------------------
// ---------------------- User - CRUD -----------------------
// ----------------------------------------------------------

export async function getUser(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUser(
  uid: string,
  data: Partial<{ email: string; username: string; isPrivate: boolean; usernameLower: string }>
) {
  data.usernameLower = data.username.toLowerCase();
  console.log(`updating user ${data.username}: ${JSON.stringify(data)}`);
  await updateDoc(doc(db, "users", uid), data);
}

export async function createUser(
  uid: string,
  firstName: string,
  lastName: string,
  username: string,
  email: string
) {
  const user: User = {
    uid: uid,
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: email,
    createdAt: new Date(),
    isPrivate: false,
    usernameLower: username.toLowerCase(),
  };

  await setDoc(doc(db, "users", uid), user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const auth = getAuth();

  try {
    // Authenticate the user with the current password
    const userRef = await getDoc(doc(db, "users", userId));
    if (!userRef.exists()) {
      throw new Error("User not found");
    }
    const user = userRef.data();
    const email = user.email;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      currentPassword
    );
    const firebaseUser = userCredential.user;

    // Update password
    await updatePassword(firebaseUser, newPassword);
  } catch (error) {
    let errorMessage = error.message;
    // Remove "Firebase: " prefix from the error message
    if (errorMessage.startsWith("Firebase: ")) {
      errorMessage = errorMessage.replace("Firebase: ", "");
    }
    throw new Error(errorMessage);
  }
}

export async function changeEmail(
  userId: string,
  currentPassword: string,
  newEmail?: string
) {
  const auth = getAuth();
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  // Check if the new email already exists in the database
  const usersCollection = collection(db, "users");
  const emailQuery = query(usersCollection, where("email", "==", newEmail));
  const emailQuerySnapshot = await getDocs(emailQuery);

  if (!emailQuerySnapshot.empty) {
    throw new Error("Email already exists");
  }

  const userData = userSnapshot.data();
  const existingEmail = userData.email;

  // Re-authenticate using the current password
  const userCredential = await signInWithEmailAndPassword(
    auth,
    existingEmail,
    currentPassword
  );
  const firebaseUser = userCredential.user;

  // If a new email is provided and different from the current one:
  // Update Firebase Authentication
  // await updateEmail(firebaseUser, newEmail);
  await verifyBeforeUpdateEmail(firebaseUser, newEmail);
}

export async function changeUsername(userId: string, newUsername: string) {
  // Get user
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  // Username already exists in the database
  const usersCollection = collection(db, "users");
  const usernameQuery = query(
    usersCollection,
    where("username", "==", newUsername)
  );
  const usernameQuerySnapshot = await getDocs(usernameQuery);

  if (!usernameQuerySnapshot.empty) {
    throw new Error("Username already exists");
  }

  const userData = userSnapshot.data();
  userData.username = newUsername;
  await updateDoc(userRef, userData);
}

export async function deleteUser(uid: string, password: string, email: string) {
  // Get user
  const userRef = doc(db, "users", uid);
  const userSnapshot = await getDoc(userRef);
  const user = userSnapshot.data() as User;

  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const firebaseUser = userCredential.user;

  // Validate user exists and is authorized
  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  if (firebaseUser.uid !== uid) {
    throw new Error("User not authorized");
  }

  // 1 - Delete all content created by the user
  if (user.content) {
    for (const contentId of user.content) {
      // Delete content
      await ContentService.deleteContent(contentId);
    }
  }

  // 2 - Delete the user profile image
  if (user.profileImage) {
    StorageService.deleteFile(user.profileImage);
  }

  // 3 - Delete the user document
  if (userSnapshot.exists()) {
    await deleteDoc(userRef);
  }

  // 4 - Delete the user from Firebase Authentication
  firebaseUser.delete();
}

// ----------------------------------------------------------
// -------------------- User Interactions -------------------
// ----------------------------------------------------------

// ------------------------- CONTENT ------------------------

export async function addContentToUser(userUID: string, contentUID: string) {
  const userDoc = await getDoc(doc(db, "users", userUID));

  if (userDoc.exists()) {
    const user = userDoc.data();
    if (user?.content) {
      user.content.push(contentUID);
    } else {
      user.content = [contentUID];
    }
    await updateDoc(doc(db, "users", userUID), user);
  }
}

export async function removeContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userDoc = await getDoc(doc(db, "users", userUID));

  if (userDoc.exists()) {
    const user = userDoc.data();

    if (user?.content) {
      user.content = user.content.filter((uid: string) => uid !== contentUID);
    } else {
      console.error("user has no content!!!!! ", user);
    }
    await updateDoc(doc(db, "users", userUID), user);
  }
}

// ------------------------- LIKE ------------------------

export async function addLikedContentToUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const likedContent = user?.likedContent || [];

    if (!likedContent.includes(contentUID)) {
      likedContent.push(contentUID); // Add content ID to likedContent array
      await updateDoc(userRef, { likedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

export async function removeLikedContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const likedContent = user.likedContent || [];

    const index = likedContent.indexOf(contentUID);
    if (index > -1) {
      likedContent.splice(index, 1); // Remove content ID from likedContent
      await updateDoc(userRef, { likedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

// ------------------------- BOOKMARK ------------------------

export async function addBookmarkedContentToUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const bookmarkedContent = user?.bookmarkedContent || [];

    if (!bookmarkedContent.includes(contentUID)) {
      bookmarkedContent.push(contentUID); // Add content ID to bookmarkedContent array
      await updateDoc(userRef, { bookmarkedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

export async function removeBookmarkedContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const bookmarkedContent = user.bookmarkedContent || [];

    const index = bookmarkedContent.indexOf(contentUID);
    if (index > -1) {
      bookmarkedContent.splice(index, 1); // Remove content ID from bookmarkedContent
      await updateDoc(userRef, { bookmarkedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

// ------------------------- SHARE ------------------------

export async function addSharedContentToUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const sharedContent = user?.sharedContent || [];

    if (!sharedContent.includes(contentUID)) {
      sharedContent.push(contentUID); // Add content ID to sharedContent array
      await updateDoc(userRef, { sharedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

export async function removeSharedContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const sharedContent = user.sharedContent || [];

    const index = sharedContent.indexOf(contentUID);
    if (index > -1) {
      sharedContent.splice(index, 1); // Remove content ID from sharedContent
      await updateDoc(userRef, { sharedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

// ------------------------- FOLLOW ------------------------

export async function followUser(userId: string, targetId: string) {
  if (userId === targetId) {
      throw new Error("Users cannot follow themselves");
  }

  const userRef = doc(db, "users", userId);
  const targetRef = doc(db, "users", targetId);

  const [userDoc, targetDoc] = await Promise.all([
      getDoc(userRef),
      getDoc(targetRef),
  ]);

  if (!userDoc.exists() || !targetDoc.exists()) {
      throw new Error("User or target not found");
  }

  const targetData = targetDoc.data() as User; // Use the User interface

  if (targetData.isPrivate) {
      // Target user is private: create a follow request.
      const requests = targetData.followRequests || [];
      if (!requests.includes(userId)) {
          await updateDoc(targetRef, {
              followRequests: arrayUnion(userId), // Use arrayUnion
          });
      }
      //Don't do the below if it's private
      //We do not want to add the user as a follower or to the following list untill approved.
      return; // Exit the function – request only
  }

  // Target user is public: follow directly.
  const userData = userDoc.data();
  const following = userData.following || []; 
  if (!following.includes(targetId)) {
      await updateDoc(userRef, { following: arrayUnion(targetId) }); 
  }

  const followers = targetData.followers || []; 
  if (!followers.includes(userId)) {
      await updateDoc(targetRef, { followers: arrayUnion(userId) });  
  }
}

export async function unfollowUser(userId: string, targetId: string) {
  const userRef = doc(db, "users", userId);
  const targetRef = doc(db, "users", targetId);

  const userDoc = await getDoc(userRef);
  const targetDoc = await getDoc(targetRef);

  if (userDoc.exists() && targetDoc.exists()) {
    const userData = userDoc.data();
    const targetData = targetDoc.data();

    // Update the user's following list
    const following = userData.following || [];
    const updatedFollowing = following.filter((id: string) => id !== targetId);
    await updateDoc(userRef, { following: updatedFollowing });

    // Update the target's followers list
    const followers = targetData.followers || []; 
    const updatedFollowers = followers.filter((id: string) => id !== userId);
    await updateDoc(targetRef, { followers: updatedFollowers });
  } else {
    throw new Error("User or target not found");
  }
}

export async function requestFollow(userId: string, targetId: string) {
  const targetRef = doc(db, "users", targetId);
  const targetDoc = await getDoc(targetRef);

  if (targetDoc.exists()) {
    const targetData = targetDoc.data();
    const requests = targetData.followRequests || [];
    if (!requests.includes(userId)) {
      requests.push(userId);
      await updateDoc(targetRef, { followRequests: requests });
    }
  } else {
    throw new Error("Target user not found");
  }
}

export async function approveFollowRequest(userId: string, requesterId: string) {
  const userRef = doc(db, "users", userId);
  const requesterRef = doc(db, "users", requesterId);

  const [userDoc, requesterDoc] = await Promise.all([
    getDoc(userRef),
    getDoc(requesterRef),
  ]);

  if (!userDoc.exists() || !requesterDoc.exists()) {
    throw new Error("User or requester not found");
  }

  const userData = userDoc.data() as User;
  const requesterData = requesterDoc.data() as User;

  // 1. Remove requesterId from followRequests
  const followRequests = (userData.followRequests || []).filter(
    (id) => id !== requesterId
  );

  // 2. Add requesterId to followers list
  const followers = userData.followers || [];
  if (!followers.includes(requesterId)) {
    followers.push(requesterId);
  }

  // 3. Add userId to requester's following list
  const following = requesterData.following || [];
  if (!following.includes(userId)) {
    following.push(userId);
  }

  // Update both documents atomically
    await Promise.all([
        updateDoc(userRef, {
            followRequests: followRequests,
            followers: followers,
        }),
        updateDoc(requesterRef, {
            following: following,
        }),
    ]);
}

export async function rejectFollowRequest(userId: string, requesterId: string) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
      throw new Error("User not found");
  }
  const userData = userDoc.data() as User; // Use the User interface

  // Remove requesterId from followRequests
  const followRequests = (userData.followRequests || []).filter(
      (id) => id !== requesterId
  );
  await updateDoc(userRef, {
      followRequests: followRequests,
  });
}

```

# docs\assets\turing-sandbox-logo-rbg.png

This is a binary file of the type: Image

# docs\assets\turing-sandbox-logo.png

This is a binary file of the type: Image

# docs\CODE_OF_CONDUCT.md

```md
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual
identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the overall
  community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or advances of
  any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email address,
  without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Community leaders have the right and responsibility to remove, edit, or reject
comments, commits, code, wiki edits, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.
Examples of representing our community include using an official email address,
posting via an official social media account, or acting as an appointed
representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
[INSERT CONTACT METHOD].
All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the
reporter of any incident.

## Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from community leaders, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

### 2. Warning

**Community Impact**: A violation through a single incident or series of
actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified period of time. This
includes avoiding interactions in community spaces as well as external channels
like social media. Violating these terms may lead to a temporary or permanent
ban.

### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including
sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public
communication with the community for a specified period of time. No public or
private interaction with the people involved, including unsolicited interaction
with those enforcing the Code of Conduct, is allowed during this period.
Violating these terms may lead to a permanent ban.

### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community
standards, including sustained inappropriate behavior, harassment of an
individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within the
community.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org/), version 2.0, available at
https://www.contributor-covenant.org/version/2/1/code_of_conduct/.

For answers to common questions about this code of conduct see: https://www.contributor-covenant.org/faq.
```

# docs\CODEOWNERS

```
# https://help.github.com/articles/about-codeowners/

# These owners will be the default owners for everything
# within the repo. Unless a later match takes precedence,
# they will be requested for review when someone opens a
# PR (pull request).
*       @Hi-kue
*       @BengeeL
*       @Abdoullahi-dev
*       @sarahshields77
*       @Mindful-Developer

# Order is important; the last matching pattern takes
# the most precedence. When someone opens a PR that only
# modifies .yml files, only the following people and NOT
# the global owner(s) will be requested for a review.
```

# docs\CONTRIBUTING.md

```md
# Contributing Guidelines

*Pull requests, bug reports, and all other forms of contribution are welcomes and highly encouraged for everyone*

## Contents

- [Contributing Guidelines](#contributing-guidelines)
  - [Contents](#contents)
  - [Code of Conduct](#code-of-conduct)
  - [Asking Questions](#asking-questions)
  - [Opening an Issue](#opening-an-issue)
    - [Bug Reports](#bug-reports)
    - [Security Issues \& Vulnerabilities](#security-issues--vulnerabilities)
    - [Other Issues](#other-issues)
  - [Feature Requests](#feature-requests)
  - [Submitting Pull Requests](#submitting-pull-requests)
  - [Writing Commit Messages](#writing-commit-messages)
  - [Coding Standards](#coding-standards)
  - [Certificate of Origin](#certificate-of-origin)
  - [Ending it Off on a Good Note](#ending-it-off-on-a-good-note)

## Code of Conduct

Please review our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing to this project. It is 
in effect at all times, and we expect it to be honored by everyone who contributes to this project.

## Asking Questions

If you have a question, please open an issue and tag it with the `question` label. We will do our best to
answer your question ASAP, but this is not guaranteed. If you have a question that is not directly related to
the project, please consider asking it somewhere else.

## Opening an Issue

If you have found a bug, security issue, or have a feature request you would like implemented, it would be best to
open an issue to discuss it. Before creating an issue, check if you are using the latest version of the project.
If you are not up-to-date, see if updating fixes your issue first.

### Bug Reports

A great way to contribute to the project is to send a detailed issue when you encounter any problems. We always appreciate
a well-written, thorough bug report.

When submitting a bug report, please make sure to address the following:
- **Review the documentation and Support Guide** before opening a new issue.
- **Do not open duplicate issues**: Search through existing issues to see if your issue has already been reported.
  - If you're issue exists, comment with any additional information you have.
  - You may simply add "I have this problem too" or a "+1" to the existing issue.
  - If you have additional information, please add it to the existing issue.
- **Prefer using [reactions](https://github.blog/2016-03-10-add-reactions-to-pull-requests-issues-and-comments/)**, not comments, if you simply want to "+1" an issue.
- **Full complete the issue with the provided issue template**:
  - The bug report template will guide you through the process of submitting a bug report.
  - The issue report template will help you provide the necessary information for us to help you.
  - Be clear, concise, and descriptive about your issue.
  - Provide as much information as possible, this includes:
    - Steps to reproduce the issue;
    - Stack traces;
    - Compiler errors;
    - Library versions;
    - OS versions;
    - Any other relevant information.
  - **Do not** include any sensitive information in your bug report.
- **Be patient**: We are all volunteers, and we will do our best to help you as soon as possible.
- **Use [GitHub-flavored Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)**:
  - Especially when providing code snippets or logs.
    - Use triple backticks for code blocks (\`\`\`) and syntax highlighting depending on the language.

### Security Issues & Vulnerabilities

Review our [Security Policy](./SECURITY.MD). **DO NOT** file a public issue for security vulnerabilities.

### Other Issues

If you have an issue that doesn't fall within the following categories:
1. Bug Reports;
2. Feature Requests;
3. Security Issues & Vulnerabilities;
4. or General FAQ;

Please open an issue and tag it with the `other` label. We may take more time to respond to these issues, 
but we will do our best to help you as soon as possible, as long as it is somewhat related to the 
project. If it is not related to the project, we may close the issue without further notice, or suggest
that you post the issue somewhere else.


## Feature Requests

Feature request are more than welcome! While we will consider all requests, we cannot guarantee that your
request will be accepted. If your idea is great, but out-of-scope for the current project, we may put
it on the back-burner for the future or suggest that you fork the project and implement it yourself. If you
are accepted, we cannot make any commitments regarding the timeline for the implementation and release of your
feature. However, you are always welcome to submit a pull request to help!

Some things to keep in mind when submitting a feature request:
1. Do not open a duplicate feature request.
2. Fully complete the provided issue template.
3. Be as detailed as possible in your description.
4. Provide examples of how the feature would be used.
5. Be precise about the proposed outcome of the feature.

## Submitting Pull Requests

We all love pull requests! Before [forking the repo](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) and 
[creating a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests) for non-trivial 
changes, it is usually best to first open an issue to discuss the changes, or discuss your intended approach for solving the problem in the comments for an existing 
issue.

For most contributions, after your first pull request is accepted and merged, you will be 
[invited to the project](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository) 
and given push access. 🎉

*Note: All contributions will be licensed under the project's license.*
- **Smaller is better**: Submit one pull request per bug fix or feature.
    - Pull requests should contain isolated changes for a single bug or feature.
    - Don't refactor or reformat code that is unrelated to your change.
    - It is better to submit many small pull requests than a single large one.
    - Enormous pull requests will take time to review, or may be rejected altogether.
- **Coordinate bigger changes**: For large changes, open an issue to discuss a strategy to maintainers.
    - This will help to ensure that your pull request is accepted.
    - Maintainers can help guide you through the process, or you can help them understand the problem.
- **Prioritize understanding over cleverness**: Write code that is clear and concise.
    - Remember that source code usually gets written once and read often. 
    - Ensure the code is always clear to the reader. 
    - The purpose and logic should be obvious to a reasonably skilled developer.
    - Avoid overly clever solutions that are difficult to understand.
    - If you must use a clever solution, ensure that it is well-documented.
- **Follow existing styles and conventions**: Ensure that your code follows the existing style and conventions.
    - Keep consistent with style, formatting, conventions and naming.
    - If you are unsure about the style, ask the maintainers.
    - If you are adding a new feature, ensure that it fits with the existing codebase.
- **Add documentation**: Always add documentation for new features or changes.
    - Documentation should be clear, concise, and easy to understand.
    - Documentation should be written in markdown format.
    - Documentation should be added to the `docs/` directory.
    - Documentation can also be within the code, but at a minimum.
- **Write tests**: Always write tests for new features or changes.
    - Tests should be written in the framework being used for the project.
    - Tests should cover all possible edge cases.
    - Tests should be added to the `test/` directory.
    - Tests should be run before submitting a pull request.

## Writing Commit Messages

Writing a good commit message is important, as it helps to communicate the context of a 
specific change to other developers. A good commit message should follow the following rules:
1. The first line should be a short description of the change;
2. Separate subject from body with a blank line;
3. Limit the subject line to 50 characters;
4. Capitalize the subject line (e.g. `Add feature` not `add feature`);
5. Do not end the subject line with a period;
6. Use the imperative mood in the subject line (e.g. `Add feature` not `Added feature`);
7. Wrap the body to about 72 characters;
8. Use the body to explain **why**, not *what* or *how*;
9. If the commit fixes an issue, reference it in the body (e.g. `Fixes #1`);
10. Separate the body from the footer with a blank line;

## Coding Standards

When contributing to this project, please follow the coding standards outlined in the project's
[CONTRIBUTING.md](./CONTRIBUTING.md) file. This will help to ensure that your code is consistent
with the rest of the project and will make it easier for the maintainers to review your code.

## Certificate of Origin

*Developer's Certificate of Origin 1.1*

By making a contribution to this project, I certify that:
> (a) The contribution was created in whole or in part by me and I
> have the right to submit it under the open source license
> indicated in the file; or
> 
> (b) The contribution is based upon previous work that, to the best
> of my knowledge, is covered under an appropriate open source
> license and I have the right under that license to submit that
> work with modifications, whether created in whole or in part
> by me, under the same open source license (unless I am
> permitted to submit under a different license), as indicated
> in the file; or
> 
> (c) The contribution was provided directly to me by some other
> person who certified (a), (b) or (c) and I have not modified
> it.
> 
> (d) I understand and agree that this project and the contribution
> are public and that a record of the contribution (including all
> personal information I submit with it, including my sign-off) is
> maintained indefinitely and may be redistributed consistent with
> this project or the open source license(s) involved.

## Ending it Off on a Good Note

If you are reading this, bravo to you for making it to the end! We appreciate 
your time and effort in reading this document, you are truly awesome! 🎉

To make sure that you have read this document and are following it as best as possible,
please include this emoji in your issue or pull request: 🦄.

Thanks again for your time and effort, to the moon and back cadets! 🚀

```

# docs\SECURITY.MD

```MD
# Security Policy

If you have recently discovered a security issue, please report it to use 
and bring it to our attention right away!

## 🛡️ Reporting a Vulnerability

Please **DO NOT** file a public issue to report a security vulnerability. It would be
wiser to contact us or any maintainer directly via email or other private means. This 
will help ensure that any vulnerabilities are addressed and resolved as quickly as possible.

## 🔑 Supported Versions

Project versions that are currently being supported with security updated vary per project. Please
see specific project repositories for details. If nothing is specified, consider only the latest
version or major versions to be supported.

```

# frontend\.gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# frontend\netlify.toml

```toml
[build]
  command = "next build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

# frontend\next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

# frontend\next.config.ts

```ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      }
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    silenceDeprecations: ["legacy-js-api"],
  },
  reactStrictMode: false,
};

export default nextConfig;

```

# frontend\package.json

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "@netlify/plugin-nextjs": "^5.10.1",
    "@tiptap/core": "^2.10.2",
    "@tiptap/extension-bold": "^2.10.2",
    "@tiptap/extension-bullet-list": "^2.10.2",
    "@tiptap/extension-heading": "^2.10.2",
    "@tiptap/extension-italic": "^2.10.2",
    "@tiptap/extension-list-item": "^2.10.2",
    "@tiptap/extension-ordered-list": "^2.10.2",
    "@tiptap/extension-paragraph": "^2.10.2",
    "@tiptap/extension-underline": "^2.10.2",
    "@tiptap/pm": "^2.10.2",
    "@tiptap/react": "^2.10.2",
    "@tiptap/starter-kit": "^2.10.2",
    "axios": "^1.7.7",
    "dompurify": "^3.2.1",
    "js-cookie": "^3.0.5",
    "next": "15.0.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "sass": "^1.82.0"
  },
  "devDependencies": {
    "@types/js-cookie": "^3.0.6",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "15.0.3",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```

# frontend\public\images\apple.png

This is a binary file of the type: Image

# frontend\public\images\apple.svg

This is a file of the type: SVG Image

# frontend\public\images\github.png

This is a binary file of the type: Image

# frontend\public\images\github.svg

This is a file of the type: SVG Image

# frontend\public\images\google.png

This is a binary file of the type: Image

# frontend\public\images\google.svg

This is a file of the type: SVG Image

# frontend\public\images\numberedListIcon-dark.png

This is a binary file of the type: Image

# frontend\public\images\numberedListIcon-light.png

This is a binary file of the type: Image

# frontend\public\images\orderedListIcon-dark.png

This is a binary file of the type: Image

# frontend\public\images\orderedListIcon-light.png

This is a binary file of the type: Image

# frontend\public\images\summarizz-logo.png

This is a binary file of the type: Image

# frontend\README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# frontend\src\app\about\page.tsx

```tsx
"use client";

export default function Page() {
  return (
    <div className='main-content'>
      <h1>About Us</h1>

      <p>
        Welcome to Summarizz, your go-to platform for quick and insightful
        content summaries. We are a team of students based in Ontario, Canada,
        passionate about leveraging technology to make information more
        accessible and efficient.
      </p>

      <h2>Our Mission</h2>

      <p>
        Our mission is to simplify the way you consume information. In today's
        fast-paced world, time is precious. We aim to provide you with concise
        and accurate summaries of articles, allowing you to quickly grasp key
        concepts and stay informed without spending hours reading lengthy
        documents.
      </p>

      <h2>What We Do</h2>

      <p>
        Summarizz utilizes advanced artificial intelligence to analyze and
        summarize content articles. We are also developing AI-powered thumbnail
        generation to provide visually engaging previews. Our platform is
        designed to help you:
      </p>

      <ul>
        <li>
          <strong>Save Time:</strong> Quickly understand the essence of articles
          without reading them in their entirety.
        </li>
        <li>
          <strong>Stay Informed:</strong> Keep up with current events and
          trending topics efficiently.
        </li>
        <li>
          <strong>Enhance Productivity:</strong> Focus on what matters most by
          getting straight to the point.
        </li>
      </ul>

      <h2>Our Journey</h2>

      <p>
        As students, we embarked on this project as a way to explore the
        potential of AI and web development. We are continually learning and
        improving our platform, driven by a desire to create a valuable tool for
        our users. While we are not a registered business, we are committed to
        providing a reliable and user-friendly experience.
      </p>

      <h2>Our Technology</h2>

      <p>
        Summarizz is powered by sophisticated AI algorithms that analyze text
        and extract key information. We are also integrating AI for thumbnail
        generation to enhance visual engagement. We utilize third-party services
        like Stripe for secure payment processing, AdSense for advertising, and
        Algolia for efficient search functionality. We host our application on
        reliable hosting platforms to ensure smooth and consistent performance.
      </p>

      <h2>Our Commitment to Accessibility</h2>

      <p>
        We are dedicated to making Summarizz accessible to all users. While we
        are currently working on implementing comprehensive accessibility
        features, we are committed to providing text-to-voice functionality,
        display customization options, and improved screen reader compatibility
        in the near future. We value your feedback and are continuously working
        to improve our platform.
      </p>

      <h2>Contact Us</h2>

      <p>
        We value your feedback and are always eager to hear from you. If you
        have any questions, suggestions, or comments, please reach out to us
        through our contact page:{" "}
        <a href='https://summarizz.app/contact'>
          https://summarizz.app/contact
        </a>
      </p>

      <p>Thank you for using Summarizz!</p>
    </div>
  );
}

```

# frontend\src\app\auth\callback\page.tsx

```tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/services/authService";
import { useAuth } from "@/hooks/AuthProvider";

function CallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    const processCallbackData = async () => {
      try {
        const token = searchParams.get("token");
        const uid = searchParams.get("uid");
        const errorMsg = searchParams.get("error");

        if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
          return;
        }

        if (!token || !uid) {
          setError("Invalid authentication data received");
          return;
        }

        // Verify token with backend
        const result = await AuthService.handleCallbackResult(token, uid);

        // Login and redirect
        auth.login(result.token, result.userUID);
        router.push("/");
      } catch (err: any) {
        setError(err.message || "Authentication failed");
      }
    };

    processCallbackData();
  }, [auth, router, searchParams]);

  // If this is a popup callback, we need to send the data back to the opener window
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    if (window.opener) {
      const token = searchParams.get("token");
      const uid = searchParams.get("uid");
      const errorMsg = searchParams.get("error");

      if (errorMsg) {
        window.opener.postMessage(
          { error: decodeURIComponent(errorMsg) },
          window.location.origin
        );
      } else if (token && uid) {
        window.opener.postMessage({ token, uid }, window.location.origin);
      } else {
        window.opener.postMessage(
          { error: "Invalid authentication data received" },
          window.location.origin
        );
      }

      // Close the popup
      window.close();
    }
  }, [searchParams]);

  return (
    <div className='auth-callback-container'>
      <div className='auth-callback-content'>
        <h1>Authentication in progress...</h1>
        {error ? (
          <div className='auth-callback-error'>
            <p>Authentication failed: {error}</p>
            <button onClick={() => router.push("/authentication/login")}>
              Back to Login
            </button>
          </div>
        ) : (
          <p>Please wait while we complete your authentication.</p>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

```

# frontend\src\app\auth\popup-callback\page.tsx

```tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * This page is specifically designed to handle OAuth popup callbacks.
 * It receives OAuth tokens from the authentication provider and sends
 * them to the parent window that opened this popup.
 */
function PopupCallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const token = searchParams.get("token");
      const uid = searchParams.get("uid");
      const errorMsg = searchParams.get("error");

      // Only proceed if we're in the browser environment
      if (typeof window === "undefined") return;

      // Verify window.opener exists
      if (!window.opener) {
        setError("Authentication window was not opened correctly");
        return;
      }

      // Send message to parent window
      if (errorMsg) {
        window.opener.postMessage(
          { error: decodeURIComponent(errorMsg) },
          window.location.origin
        );
      } else if (token && uid) {
        window.opener.postMessage({ token, uid }, window.location.origin);
      } else {
        window.opener.postMessage(
          { error: "Invalid authentication data received" },
          window.location.origin
        );
      }

      // Close the popup after sending the message
      window.close();
    } catch (err: any) {
      console.error("Error in popup callback:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process authentication"
      );
    }
  }, [searchParams]);

  return (
    <div className='popup-callback-container'>
      <h1>Authentication Complete</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <p>Authentication successful! You can close this window.</p>
      )}
    </div>
  );
}

export default function PopupCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PopupCallbackContent />
    </Suspense>
  );
}

```

# frontend\src\app\authentication\login\page.tsx

```tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { apiURL } from "@/app/scripts/api";
import { useAuth } from "@/hooks/AuthProvider";
import { OAuthButtons } from "@/components/authentication/OAuthButtons";

import "@/app/styles/authentication/authentication.scss";

export default function Page() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const auth = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1 - Reset Error Message
    setError("");

    // 2 - Login user
    await axios
      .post(`${apiURL}/user/login`, user)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          const userUID = res.data.userUID;
          const token = res.data.token;

          // 3 - Set User Session (Save Token and User UID)
          auth.login(token, userUID);

          // Update user email
          axios.put(`${apiURL}/user/${userUID}`, {
            email: user.email,
          });

          // 4 - Redirect to home page
          router.push("/");

          // 5 - Error Handling
        } else {
          setError("An error occurred. Please try again.");
        }
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setError(error.response.data.error);
        } else {
          setError("An error occurred. Please try again.");
        }
      });
  };

  // Authenticated users should not be able to access the login page
  if (auth.getUserUID() !== null && auth.getToken() !== null) {
    router.push("/");
  }

  return (
    <>
      <div className='authentication'>
        <div className='container'>
          <div className='auth-box'>
            <h1 className='summarizz-logo auth-title'>Summarizz</h1>
            <form onSubmit={handleSubmit}>
              <input
                type='email'
                value={user.email}
                onChange={handleChange}
                name='email'
                id='email'
                placeholder='Email'
                className='auth-input'
                required
              />
              <input
                type='password'
                value={user.password}
                onChange={handleChange}
                name='password'
                id='password'
                placeholder='Password'
                className='auth-input'
                required
              />

              {error && <p className='auth-error'>{error}</p>}

              <button type='submit' className='auth-button'>
                Login
              </button>

              <OAuthButtons />
            </form>

            <p>
              Don&apos;t have an account?{" "}
              <a href='/authentication/register'>Register</a>
              <br />
              Forgot your password?{" "}
              <a href='/authentication/reset-password'>Reset your password</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

```

# frontend\src\app\authentication\register\page.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { OAuthButtons } from "@/components/authentication/OAuthButtons";

import "@/app/styles/authentication/authentication.scss";

export default function Page() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const auth = useAuth();

  // Check if passwords match
  useEffect(() => {
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }, [user.password, user.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1 - Reset Error Message
    setError("");

    // 2 - Validate user input
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 3 - Register user
    axios
      .post(`${apiURL}/user/register`, user)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          const userUID = res.data.userUID;
          const token = res.data.token;

          // 3 - Set User Session (Save Token and User UID)
          auth.login(token, userUID);

          // 4 - Redirect to home page
          router.push("/");

          // 5 - Error Handling
        } else {
          setError("An error occurred. Please try again.");
        }
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setError(error.response.data.error);
        } else {
          setError("An error occurred. Please try again.");
        }
      });
  };

  // Redirect to home page if user is already logged in
  if (auth.getUserUID() !== null && auth.getToken() !== null) {
    router.push("/");
  }

  return (
    <>
      <div className='authentication'>
        <div className='container'>
          <div className='auth-box'>
            <h1 className='summarizz-logo auth-title'>Summarizz</h1>
            <form onSubmit={handleSubmit}>
              <input
                type='text'
                value={user.firstName}
                onChange={handleChange}
                name='firstName'
                placeholder='First Name'
                className='auth-input'
                required
              />
              <input
                type='text'
                value={user.lastName}
                onChange={handleChange}
                name='lastName'
                placeholder='Last Name'
                className='auth-input'
                required
              />
              <input
                type='text'
                value={user.username}
                onChange={handleChange}
                name='username'
                placeholder='Username'
                className='auth-input'
                required
              />
              <input
                type='email'
                value={user.email}
                onChange={handleChange}
                name='email'
                placeholder='Email'
                className='auth-input'
                required
              />
              <input
                type='password'
                value={user.password}
                onChange={handleChange}
                name='password'
                placeholder='Password'
                className='auth-input'
                required
              />
              <input
                type='password'
                value={user.confirmPassword}
                onChange={handleChange}
                name='confirmPassword'
                placeholder='Confirm Password'
                className='auth-input'
                required
              />

              {error && <p className='auth-error'>{error}</p>}

              <button type='submit' className='auth-button'>
                Register
              </button>

              <OAuthButtons />
            </form>

            <p>
              Already have an account? <a href='/authentication/login'>Login</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

```

# frontend\src\app\authentication\reset-password\page.tsx

```tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { apiURL } from "@/app/scripts/api";

import "@/app/styles/authentication/authentication.scss";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isButtonDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsButtonDisabled(false);
      setCountdown(60);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isButtonDisabled, countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await axios.post(`${apiURL}/user/reset-password-request`, { email });
      setMessage(
        "✓ Reset link sent! Please check your email inbox (and spam folder) for instructions."
      );
      setIsButtonDisabled(true);
    } catch (error) {
      // Display the same message even if there's an error to prevent email enumeration
      setMessage(
        "✓ Reset link sent! Please check your email inbox (and spam folder) for instructions."
      );
      setIsButtonDisabled(true);
      console.error("Error requesting password reset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='authentication'>
        <div className='container'>
          <div className='auth-box'>
            <h1 className='summarizz-logo auth-title'>Summarizz</h1>
            <h2>Reset Password</h2>
            <p>
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type='email'
                value={email}
                onChange={handleChange}
                name='email'
                id='email'
                placeholder='Email'
                className='auth-input'
                required
                disabled={isButtonDisabled}
              />

              {message && (
                <p className='auth-message auth-success'>{message}</p>
              )}

              <button
                type='submit'
                className='auth-button'
                disabled={isLoading || isButtonDisabled}
              >
                {isLoading
                  ? "Sending..."
                  : isButtonDisabled
                  ? `Try again in ${countdown}s`
                  : "Reset Password"}
              </button>
            </form>

            <p>
              Remember your password? <a href='/authentication/login'>Login</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

```

# frontend\src\app\contact\page.tsx

```tsx
"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiURL } from "../scripts/api";

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  // Countdown timer for button (avoid spamming)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isButtonDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsButtonDisabled(false);
      setCountdown(60);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isButtonDisabled, countdown]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    setSuccessMessage("");
    setErrorMessage("");

    try {
      let response = await axios.post(`${apiURL}/contact`, {
        email,
        name,
        message,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("✓ Message sent! We will respond within 48 hours.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsButtonDisabled(true);
      setIsLoading(false);
    }
  }

  return (
    <div className='main-content'>
      <h1>Contact Us</h1>
      <p>
        For any questions, concerns, or feedback, please fill out this form.
        Someone from our team will respond to you within 48 hours.
      </p>

      {/* TODO: IMPLEMENT CONTACT MODULE WITH DATABASE DETAILS 
      STORED FOR ACCESSIBILITY BY ALL TEAM MEMBER??? */}
      <form onSubmit={handleSubmit}>
        <div className='input-group'>
          <label htmlFor='name'>Name:</label>
          <input
            type='text'
            id='name'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <label htmlFor='email'>Email:</label>
        <input
          type='email'
          id='email'
          name='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor='message'>Message:</label>
        <textarea
          id='message'
          name='message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button className='save-button' type='submit'>
          Submit
        </button>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {isLoading && <p>Loading...</p>}
      </form>
    </div>
  );
}

```

# frontend\src\app\content\[id]\page.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import DOMPurify from "dompurify";
import { Content } from "@/models/Content";
import { User } from "@/models/User";

import Image from "next/image";
import CommentList from "@/components/content/CommentList";

import {
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid,
  PencilIcon as PencilIconSolid,
  ShareIcon as ShareIconSolid,
  TrashIcon as TrashIconSolid,
} from "@heroicons/react/24/solid";

import {
  BookmarkIcon as BookmarkIconOutline,
  HeartIcon as HeartIconOutline,
  ShareIcon as ShareIconOutline,
} from "@heroicons/react/24/outline";

// Styles
import "@/app/styles/content/viewContent.scss";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Content page by Id, allowing users to view content based on the Id.
 *
 * @returns JSX.Element
 */
export default function Page() {
  // Content ID from URL
  const { id } = useParams();

  // useAuth Hook for Authentication
  const { userUID } = useAuth();

  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [formatedContent, setFormatedContent] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);

  const [isShared, setIsShared] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const [views, setViews] = useState(0);
  const [firstRender, setFirstRender] = useState(true);

  const router = useRouter();

  // ---------------------------------------
  // -------------- Helpers ----------------
  // ---------------------------------------

  // Normalizes date fields into proper Date objects
  function normalizeContentDates(contentObj: any): any {
    if (contentObj.dateCreated) {
      if (typeof contentObj.dateCreated === "string") {
        contentObj.dateCreated = new Date(contentObj.dateCreated);
      } else if (contentObj.dateCreated.seconds) {
        contentObj.dateCreated = new Date(
          contentObj.dateCreated.seconds * 1000
        );
      }
    }
    return contentObj;
  }

  // ---------------------------------------
  // -------------- Data Fetching ----------
  // ---------------------------------------

  /**
   * fetchLoggedInuser() -> void
   *
   * @description
   * Fetches the logged in user's information from the backend using the userUID
   * provided in the AuthProvider, this will set the user accordingly.
   *
   * @returns void
   */
  const fetchUser = async (id: string): Promise<User | undefined> => {
    try {
      const res = await axios.get(`${apiURL}/user/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching logged-in user:", error);
      return undefined;
    }
  };

  // Fetch content data and, if available, its creator data.
  const fetchContentData = async () => {
    try {
      const contentResponse = await axios.get(`${apiURL}/content/${id}`);

      if (!contentResponse.data) {
        console.error("No content found with ID:", id);
        return;
      }
      let fetchedContent = contentResponse.data;

      fetchedContent = normalizeContentDates(fetchedContent);
      fetchedContent.uid = id;
      setContent(contentResponse.data as Content);

      // Fetch creator info if available.
      if (fetchedContent.creatorUID) {
        const creator = await fetchUser(fetchedContent.creatorUID);
        if (creator) {
          setCreator(creator);
        }
      }

      // Increment views only on first page load.
      if (firstRender) {
        await incrementViews();
        setFirstRender(false);
      }
    } catch (error) {
      console.error("Error fetching content or creator:", error);
    }
  };

  // ---------------------------------------
  // -------------- useEffects -------------
  // ---------------------------------------

  // Fetch logged-in user when userUID changes.
  useEffect(() => {
    (async () => {
      if (userUID) {
        const user = await fetchUser(userUID);
        if (user) {
          setUser(user);
        }
      }
    })();
  }, [userUID]);

  // Fetch content data and creator data on mount or when id changes.
  useEffect(() => {
    fetchContentData();
  }, [id]);

  // Sanitize content and update related state whenever content changes.
  useEffect(() => {
    if (content) {
      let rawContent: string;
      // Use content.content (which is expected to be a string).
      if (typeof content.content === "string") {
        rawContent = content.content;
      } else if (
        typeof content.content === "object" &&
        (content.content as any).content
      ) {
        // If it accidentally becomes an object, extract the inner value.
        rawContent = (content.content as any).content;
      } else {
        rawContent = "";
      }
      const sanitized = DOMPurify.sanitize(rawContent);
      setFormatedContent(sanitized);
      setLikes(typeof content.likes === "number" ? content.likes : 0);
      setViews(content.views || 0);
      if (userUID) {
        setIsLiked(content.peopleWhoLiked?.includes(userUID) || false);
        setIsBookmarked(content.bookmarkedBy?.includes(userUID) || false);
      }
    }
  }, [content, userUID]);

  // Update status content stats
  useEffect(() => {
    if (content?.uid) {
      setIsBookmarked(user?.bookmarkedContent?.includes(content.uid) || false);
      setBookmarks(content?.bookmarkedBy?.length || 0);

      setIsShared(user?.sharedContent?.includes(content.uid) || false);
      setShareCount(content?.shares || 0);

      setIsLiked(user?.likedContent?.includes(content.uid) || false);
      setLikes(content?.peopleWhoLiked?.length || 0);
    }

    if (content?.creatorUID) {
      setIsFollowing(user?.following?.includes(content.creatorUID) || false);
    }
  }, [content, user]);

  // ---------------------------------------
  // -------------- Handlers ---------------
  // ---------------------------------------

  /**
   * handleDelete() -> void
   *
   * @description
   * Handles the delete action for the content, deleting the content and thumbnail
   * if it exists, and redirecting to the profile page of the creator.
   *
   * @returns void
   */
  const handleDelete = async () => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    if (localStorage.getItem("userUID") === content?.creatorUID) {
      try {
        // Delete comments
        const user_id = content?.creatorUID;
        await axios.delete(`${apiURL}/comment/post/${content.uid}/${user_id}`);

        // Delete content
        const content_id = content?.uid;
        await axios({
          method: "delete",
          url: `${apiURL}/content/${content_id}`,
          headers: {},
          data: {
            userId: user_id,
          },
        });
      } catch (error) {
        alert(error);
      }
    } else {
      alert(
        "You do not have permission to delete this page as you are not the creator."
      );
    }

    router.push(`/profile/${userUID}`);
  };

  /**
   * handleLike() -> void
   *
   * @description
   * Handles the liking and unliking of the content, setting the isLiked state
   * to the opposite of the current state.
   *
   * @returns {Promise<void>}
   */
  const handleLike = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      const action = isLiked ? "unlike" : "like";
      const url = `${apiURL}/content/${id}/${action}/${userUID}`;
      const response = await axios.post(url);

      if (response.status == 200) {
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
      }
    } catch (error) {
      alert(
        `Failed to ${isLiked ? "unlike" : "like"} content. Please try again.`
      );
    }
  };

  /**
   * handleBookmark() -> void
   *
   * @description
   * Handles the bookmarking and unbookmarking of the content,
   * setting the isBookmarked state to the opposite of the current state.
   *
   * @returns void
   */
  const handleBookmark = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      const action = isBookmarked ? "unbookmark" : "bookmark";
      const url = `${apiURL}/content/${userUID}/${action}/${id}`;
      const response = await axios.post(url);

      if (response.status === 200) {
        setIsBookmarked(!isBookmarked);
        setBookmarks(isBookmarked ? bookmarks - 1 : bookmarks + 1);
      }
    } catch (error) {
      alert(
        `Failed to ${
          isBookmarked ? "unbookmark" : "bookmark"
        } content. Please try again.`
      );
    }
  };

  /**
   * handleShare() -> void
   *
   * @description
   * Handles the share action for the content, copying the share
   * link to the clipboard.
   *
   * @returns void
   */
  const handleShare = async () => {
    try {
      // Check if the user is logged in via AuthProvider
      if (!userUID) {
        alert("Please log in to share this article.");
        return;
      }

      const action = isShared ? "unshare" : "share";
      const userId = userUID;
      const shareResponse = await axios.post(
        `${apiURL}/content/${id}/user/${userId}/${action}`

        // `${apiURL}/content/user/${userId}/${action}/${id}`
      );

      if (shareResponse.status == 200) {
        setIsShared(!isShared);
        setShareCount(isShared ? shareCount - 1 : shareCount + 1);
      }
    } catch (error) {
      alert(
        `Failed to ${isShared ? "unshare" : "share"} content. Please try again.`
      );
    }
  };

  /**
   * handleFollow() -> void
   *
   * @description
   * Handles the follow/unfollow actions for the creator of the content.
   *
   * @returns void
   */
  const handleFollow = async () => {
    try {
      if (!userUID || !content?.creatorUID) {
        console.error("User ID or Creator ID not available");
        return;
      }

      const action = isFollowing ? "unfollow" : "follow";
      const url = `${apiURL}/user/${userUID}/${action}/${content.creatorUID}`;
      const res = await axios.post(url);

      if (res.status === 200) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      alert(
        `Failed to ${
          isFollowing ? "unfollow" : "follow"
        } user. Please try again.`
      );
    }
  };

  /**
   * editContent() -> void
   *
   * @description
   * Redirects user to the edit page for the current content.
   */
  const editContent = () => {
    if (content?.creatorUID === userUID) redirect(`edit/${content?.uid}`);
    else throw Error("You cannot edit this content");
  };

  /**
   * incrementViews() -> void
   *
   * @description
   * Increments the number of times the content has been viewed.
   */
  const incrementViews = async () => {
    try {
      await axios.put(`${apiURL}/content/views/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const isCreator = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userUID") === content?.creatorUID;
    }
    return false;
  };

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <div className='main-content'>
        <div className='row'>
          {/* Left Column: Thumbnail and Comments */}
          <div className='col-1'>
            {content?.thumbnail && (
              <Image
                src={content.thumbnail}
                alt='Thumbnail'
                width={200}
                height={200}
                className='thumbnail'
              />
            )}
            <CommentList />
          </div>

          {/* Right Column: Content Details */}
          <div className='col-2'>
            {/* Title and Interaction Buttons */}
            <div className='content-title-bar'>
              <h1 className='content-title'>{content?.title}</h1>

              <div className='content-interactions'>
                {/* LIKE BUTTON */}
                <button
                  className='icon-button'
                  onClick={handleLike}
                  title={isLiked ? "Unlike Content" : "Like Content"}
                >
                  {isLiked ? (
                    <HeartIconSolid className='icon' />
                  ) : (
                    <HeartIconOutline className='icon ' />
                  )}
                  {likes > 0 && <span className='icon counter'>{likes}</span>}
                </button>

                {/* BOOKMARK BUTTON */}
                <button
                  className='icon-button'
                  onClick={handleBookmark}
                  title={
                    isBookmarked ? "Unbookmark Content" : "Bookmark Content"
                  }
                >
                  {isBookmarked ? (
                    <BookmarkIconSolid className='icon' />
                  ) : (
                    <BookmarkIconOutline className='icon' />
                  )}
                  {bookmarks > 0 && (
                    <span className='icon counter'>{bookmarks}</span>
                  )}
                </button>

                {/* SHARE BUTTON */}
                <button
                  className='icon-button'
                  onClick={handleShare}
                  title={isShared ? "Unshare Content" : "Share Content"}
                >
                  {isShared ? (
                    <ShareIconSolid className='icon' />
                  ) : (
                    <ShareIconOutline className='icon' />
                  )}
                  {shareCount > 0 && (
                    <span className='icon counter'>{shareCount}</span>
                  )}
                </button>
              </div>

              {/* EDIT & DELETE (Only for Creator) */}
              {isCreator() && (
                <div className='content-interactions'>
                  <div className='icon-container'>
                    <button
                      className='icon-button'
                      onClick={editContent}
                      title='Edit Content'
                    >
                      <PencilIconSolid className='icon edit' />
                    </button>
                    <button
                      className='icon-button'
                      onClick={handleDelete}
                      title='Delete Content'
                    >
                      <TrashIconSolid className='icon delete' />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content Header: Info and Creator */}
            <div className='content-header'>
              <div className='content-info'>
                {/* LEFT SIDE (VIEW, DATE, READ TIME AND CREATOR) */}
                <p className='username'>By: {creator?.username}</p>
                <p>
                  {content?.dateCreated?.toLocaleDateString()}
                  {content?.readtime ? ` - ${content.readtime} min` : ""}
                </p>
                <p>{views ? ` ${views} views` : ""}</p>

                <div className='creator-follow-section'>
                  {/* CLICK CREATOR IMAGE TO NAVIGATE TO THEIR PROFILE */}
                  <div onClick={() => router.push(`/profile/${creator?.uid}`)}>
                    {creator?.profileImage ? (
                      <Image
                        className='profile-image-creator'
                        src={creator.profileImage}
                        width={70}
                        height={70}
                        alt='Profile Picture'
                      />
                    ) : (
                      <div className='profile-image-creator'>
                        <h1 className='profile-initial'>
                          {creator?.username[0].toUpperCase()}
                        </h1>
                      </div>
                    )}
                  </div>

                  {userUID && userUID !== creator?.uid && (
                    <button
                      className='follow-button'
                      onClick={handleFollow}
                      title={isFollowing ? "Unfollow Author" : "Follow Author"}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className='spliter'></div>

              {/* RIGHT SIDE - SUMMARY */}
              <div className='content-summary'>
                <p>Article Summary</p>
              </div>
            </div>

            {/* Render the Main Content */}
            {formatedContent && (
              <div dangerouslySetInnerHTML={{ __html: formatedContent }} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

```

# frontend\src\app\content\create\page.tsx

```tsx
"use client";

// React & NextJs (Import)
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Third-Party Libraries (Import)
import Cookies from "js-cookie";

// TipTap (Import)
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";

// Local Files (Import)
import { useAuth } from "@/hooks/AuthProvider";
import { apiAIURL, apiURL } from "@/app/scripts/api";
import Toolbar from "@/components/content/toolbar";

// Stylesheets (Import)
import "@/app/styles/content/createContent.scss";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Create Content page, allowing users to create content.
 *
 * @returns JSX.Element
 */
export default function Page() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  // State for Editro and Content
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSummarizing, setIsSummarizing] = useState(false);
  const auth = useAuth();
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      Cookies.set("content", html);
    },
  });

  // ---------------------------------------
  // ----------- Event Handlers ------------
  // ---------------------------------------
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const savedTitle = localStorage.getItem("title");
    const savedContent = Cookies.get("content");

    if (savedTitle) {
      setTitle(savedTitle);
    }

    if (savedContent && editor) {
      setContent(savedContent);
      editor.commands.setContent(savedContent);
    }
  }, [editor]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  /**
   * handleThumbnailChange() -> void
   *
   * @description
   * Handles the file upload for the thumbnail, and sets the thumbnail preview
   * to the file that was uploaded. If the file is not an image, or one was not provided, it
   * will throw and error indicating that the thumbnail was not set and to try again.
   *
   * @param e - Change Event for Thumbnail File
   */
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
      setError("Please select a valid image file.");
    }
  };

  /**
   * handleSummarize() -> void
   *
   * @description
   * Handles the summarization of the content using the AI service backend,
   * this will set the isSummarizing state to true and then call the backend
   * to summarize the content using the API. If the content is not provided,
   * it will set an error message and return.
   *
   * @returns {Promise<void>}
   */
  const handleSummarize = async () => {
    if (!content) {
      setError(
        "Please add some content before summarizing using our AI service."
      );
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch(`${apiAIURL}/api/v1/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: content }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error ||
            "Failed to summarize provided content. Please Try again."
        );
      }

      if (!editor) {
        return;
      }

      const formattedSummary = `
        <div class="summary-container">
          <h2 class="summary-title">Summary</h2>
          <div class="summary-content">
            <p>${data.summary.output.replace(/\n/g, "</p><p>")}</p>
          </div>
        </div>
      `;

      editor.commands.setContent(formattedSummary);
      setContent(formattedSummary);
      Cookies.set("content", formattedSummary);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error(error.message);
      setError(
        `Failed to summarize provided content: ${error}, something went wrong. Please Try again.`
      );
    }

    setIsSummarizing(false);
  };

  /**
   * handleSubmit() -> void
   *
   * @description
   * Handles the submission of the content, setting { title, content, thumbnail }
   * respectively amnd redirecting to the Content page. If the title and content
   * are not provided, it will throw an error and set the error state to the current
   * error message based on the error thrown.
   *
   * @returns
   */
  function handleSubmit() {
    setError("");

    if (title === "" || content === "") {
      setError(
        "Title and content are required, and were not provided. Please Try again."
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newContent: Record<string, any> = {
      creatorUID: auth.getUserUID(),
      title,
      content,
    };

    if (thumbnail) {
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);

      fetch(`${apiURL}/content/uploadThumbnail`, {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          const res = await response.json();
          const thumbnailUrl = res.url;
          newContent["thumbnailUrl"] = thumbnailUrl;

          return fetch(`${apiURL}/content`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newContent),
          });
        })
        .then(async (response) => {
          if (response.status === 200 || response.status === 201) {
            Cookies.remove("content");
            localStorage.removeItem("title");
            router.push("/");
          } else {
            setError("Failed to create content. Please Try again.");
          }
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to create content. Please Try again.");
        });
    } else {
      fetch(`${apiURL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      })
        .then((response) => response.json())
        .then(() => {
          Cookies.remove("content");
          localStorage.removeItem("title");
          router.push("/");
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to create content. Please Try again.");
        });
    }
  }

  // User must be authenticated to create content
  if (auth.getUserUID() === null || auth.getToken() === null) {
    router.push("/authentication/login");
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <div className='main-content'>
        <h1>Create Content</h1>

        <form className='create-content-form'>
          <input
            className='content-input'
            type='text'
            id='title'
            name='title'
            value={title}
            onChange={(e) => {
              // Only proceed if we're in the browser environment
              if (typeof window === "undefined") return;
              setTitle(e.target.value);
              localStorage.setItem("title", e.target.value);
            }}
            placeholder='Title'
          />
          <a
            onClick={() => {
              // Only proceed if we're in the browser environment
              if (typeof window === "undefined") return;
              setTitle("");
              localStorage.removeItem("title");
            }}
            className='clear-button'
          >
            Clear
          </a>

          <Toolbar editor={editor} />

          <EditorContent
            editor={editor}
            className='content-input text-editor'
          />
          <a
            onClick={() => {
              setContent("");
              Cookies.remove("content");
            }}
            className='clear-button'
          >
            Clear
          </a>

          {thumbnail && thumbnailPreview && (
            <Image
              src={thumbnailPreview}
              alt='Thumbnail Preview'
              width={200}
              height={200}
              className='thumbnail-preview'
            />
          )}
          <div>
            <label htmlFor='file-upload' className='content-file-upload'>
              {thumbnail ? "Change" : "Upload"} Thumbnail
            </label>
            <input
              id='file-upload'
              type='file'
              accept='image/*'
              onChange={handleThumbnailChange}
            />
          </div>
        </form>

        {error && <p className='error-message'>{error}</p>}

        <div className='form-buttons'>
          <button
            className='content-button left-button'
            onClick={() => {
              // Only proceed if we're in the browser environment
              if (typeof window === "undefined") return;

              localStorage.removeItem("title");
              Cookies.remove("content");
              setTitle("");
              setContent("");
              if (editor) {
                editor.commands.setContent("");
              }
              setThumbnail(null);
              setThumbnailPreview(null);
            }}
          >
            Clear
          </button>

          <button className='content-button' onClick={handleSummarize}>
            Summarize with AI
          </button>

          <button className='content-button' onClick={handleSubmit}>
            Publish
          </button>
        </div>
      </div>
    </>
  );
}

```

# frontend\src\app\content\edit\[id]\page.tsx

```tsx
"use client";

// React & NextJs (Import)
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Third-Party Libraries (Import)
import axios from "axios";
import Cookies from "js-cookie";

// TipTap (Import)
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";

// Local Files (Import)
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { Content } from "@/models/Content";
import Toolbar from "@/components/content/toolbar";

// Stylesheets (Import)
import "@/app/styles/content/createContent.scss";

/**
 * Renders the Edit content page, allowing users to edit their previously
 * created content.
 */
export default function Page() {
  // Hooks for Authentication and Routing
  const auth = useAuth();
  const router = useRouter();
  const contentId = useParams().id;

  // State for Editor and Content
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [page, setPage] = useState<Content | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Initialization of Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      Cookies.set("content", html);
    },
  });

  // EFFECT: Fetch Content once Editor and User are ready
  useEffect(() => {
    if (editor) {
      const getContent = async () => {
        try {
          const res = await axios.get(`${apiURL}/content/${contentId}`);
          const data = res.data;
          setPage(data);
          setTitle(data.title);
          setContent(data.content);
          editor.commands.setContent(data.content);
        } catch (err: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setError(err.message || "Failed to fetch content. Please try again.");
        }
      };
      getContent();
    }
  }, [editor, contentId]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------

  /**
   * handleThumbnailChange() -> void
   *
   * @description
   * This function handles the file upload for the thumbnail, and sets the thumbnail preview
   * to the file that was uploaded. If the file is not an image, or one was not provided, it
   * will throw and error indicating that the thumbnail was not set and to try again.
   *
   * @param e - Change Event for File
   */
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
      setError(
        "Please select a valid image file, thumbnail was not edited. Please Try again."
      );
    }
  };

  /**
   * handleSubmit() -> async
   *
   * @description
   * This function handles the submission of the content, handling and setting the
   * title, content, and thumbnail. If the title and content are not provided, it will
   * throw an error and set the error state to the current error message based on the
   * error thrown. If everything is successful, it will set { title, content, thumbnail }.
   *
   * @returns null
   */
  const handleSubmit = async () => {
    setError("");

    if (title === "" || content === "") {
      setError(
        "Title and content are required, and was not provided. Please Try again."
      );
      return;
    }

    try {
      const user_id = auth.getUserUID();
      if (!user_id || !contentId) {
        setError("Missing user or content information. Please Try again.");
        return;
      }

      if (thumbnail) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnail);

        if (page?.thumbnail) {
          const file_path = decodeURIComponent(
            page.thumbnail.split("/o/")[1].split("?")[0]
          );
          const file_name = file_path.split("/")[1];
          formData.append("file_name", file_name);
        }

        const editData = {
          title: title,
          content: content,
          dateUpdated: new Date(),
        };
        formData.append("data", JSON.stringify(editData));

        await axios.put(
          `${apiURL}/content/editThumbnail/${contentId}/${user_id}`,
          formData
        );
      } else {
        await axios.put(`${apiURL}/content/${contentId}/${user_id}`, {
          data: {
            title: title,
            content: content,
            dateUpdated: Date.now(),
          },
        });
      }

      localStorage.removeItem("title");
      Cookies.remove("content");
      router.replace(`../../content/${contentId}?${Date.now()}`);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(
        error.message ||
          "Something went wrong, we are unable to update the content. Please Try again."
      );
    }
  };

  /**
   * cancelEdit() -> void
   *
   * @description
   * This function handles the cancellation of the edit, removing all changes made to
   * { content, title, thumbnail } and redirecting to the content page.
   *
   * @returns null
   */
  const cancelEdit = () => {
    localStorage.removeItem("title");
    Cookies.remove("content");

    setTitle("");
    setContent("");

    if (editor) {
      editor.commands.setContent("");
    }

    setThumbnail(null);
    setThumbnailPreview(null);
    router.push(`/content/${contentId}`);
  };

  // User must be authenticated to create content
  if (auth.getUserUID() === null || auth.getToken() === null) {
    router.push("/authentication/login");
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <div className='main-content'>
        <h1>Edit Content</h1>
        <form>
          <input
            className='content-input'
            type='text'
            id='title'
            name='title'
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              localStorage.setItem("title", e.target.value);
            }}
            placeholder='Title'
          />
          <a
            onClick={() => {
              setTitle("");
              localStorage.removeItem("title");
            }}
            className='clear-button'
          >
            Clear
          </a>

          <Toolbar editor={editor} />

          <EditorContent
            editor={editor}
            className='content-input text-editor'
          />

          <a
            onClick={() => {
              setContent("");
              Cookies.remove("content");
            }}
            className='clear-button'
          >
            Clear
          </a>

          {thumbnail && thumbnailPreview && (
            <Image
              src={thumbnailPreview}
              alt='Thumbnail Preview'
              width={200}
              height={200}
              className='thumbnail-preview'
            />
          )}
          <div>
            <label htmlFor='file-upload' className='content-file-upload'>
              {thumbnail ? "Change" : "Upload"} Thumbnail
            </label>
            <input
              id='file-upload'
              type='file'
              accept='image/*'
              onChange={handleThumbnailChange}
            />
          </div>
        </form>

        {error && <p className='error-message'>{error}</p>}

        <div className='form-buttons'>
          <button className='content-button left-button' onClick={cancelEdit}>
            Cancel
          </button>
          <button className='content-button' onClick={() => handleSubmit()}>
            Publish
          </button>
        </div>
      </div>
    </>
  );
}

```

# frontend\src\app\favicon.ico

This is a binary file of the type: Binary

# frontend\src\app\fonts\Blanka-Regular.otf

This is a binary file of the type: Binary

# frontend\src\app\fonts\Blanka-Regular.woff

This is a binary file of the type: Binary

# frontend\src\app\fonts\Blanka-Regular.woff2

This is a binary file of the type: Binary

# frontend\src\app\layout.tsx

```tsx
// React & NextJs (Import)
import type { Metadata } from "next";

// Stylesheets
import "@/app/styles/global.scss";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import AuthProvider from "@/hooks/AuthProvider";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: "Summarizz",
  description: "TL;DR for your articles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        {/* Mondiad */}
        <meta name='mnd-ver' content='tqpk2mhrbw7rn7kvycrga' />
        <script async src='https://ss.mrmnd.com/native.js'></script>
      </head>
      <body>
        {/* Mondiad Script */}
        {/* AdSense Script (if needed) */}
        {/* <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5798408924792660"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        /> */}
        <AuthProvider>
          <Background />
          <NavbarWrapper />
          {children}
          <Footer />
        </AuthProvider>
        {/* <script async src='https://ss.mrmnd.com/native.js'></script> */}
      </body>
    </html>
  );
}

```

# frontend\src\app\legal\accessibility\page.tsx

```tsx
"use client";

export default function Page() {
  return (
    <div className='main-content'>
      <h1>Accessibility</h1>

      <p>
        <strong>Last Updated:</strong> March 25, 2025
      </p>

      <p>
        Summarizz is committed to making our application accessible to all
        users, including those with disabilities. We understand the importance
        of providing an inclusive experience and are continuously working to
        improve the accessibility of our platform. However, at this time, some
        accessibility features are still under development.
      </p>

      <h2>Current Accessibility Status</h2>

      <p>
        Currently, Summarizz has limited accessibility features. We acknowledge
        that this may create challenges for some users. We are actively planning
        and developing the following accessibility enhancements:
      </p>

      <ul>
        <li>
          <strong>Text-to-Voice Feature:</strong> We are developing a
          text-to-voice feature to provide audio output of content, making it
          easier for users with visual impairments or reading difficulties to
          access information.
        </li>
        <li>
          <strong>Display Preference/Customization:</strong> We are working on
          providing users with options to customize display settings, such as
          font size, color contrast, and layout, to accommodate various visual
          needs.
        </li>
        <li>
          <strong>Keyboard Navigation:</strong> We are aiming to improve
          keyboard navigation throughout the application to make it more usable
          for users who rely on keyboard input.
        </li>
        <li>
          <strong>Screen Reader Compatibility:</strong> We are working to
          improve compatibility with screen reader software, ensuring that users
          can effectively navigate and interact with the application.
        </li>
      </ul>

      <h2>Our Commitment</h2>

      <p>
        We are dedicated to making Summarizz more accessible and are committed
        to following accessibility guidelines and best practices. We recognize
        that accessibility is an ongoing process, and we will continue to
        evaluate and improve our application to meet the needs of all users.
      </p>

      <h2>Feedback and Suggestions</h2>

      <p>
        We welcome feedback and suggestions from users regarding accessibility.
        If you encounter any accessibility barriers or have recommendations for
        improvement, please contact us through our contact page. Your input is
        valuable in helping us create a more inclusive experience.
      </p>

      <h2>Temporary Limitations</h2>

      <p>
        Please be aware that due to the ongoing development of accessibility
        features, some parts of Summarizz may not be fully accessible at this
        time. We apologize for any inconvenience this may cause and appreciate
        your patience as we work to implement these enhancements.
      </p>

      <h2>Future Improvements</h2>

      <p>
        We are committed to continuously improving the accessibility of
        Summarizz. As we implement new features and updates, we will prioritize
        accessibility to ensure that all users can fully utilize our
        application.
      </p>

      <h2>Contact Us</h2>

      <p>
        If you have any questions or concerns about the accessibility of
        Summarizz, please contact us at:{" "}
        <a href='https://summarizz.app/contact'>
          https://summarizz.app/contact
        </a>
      </p>
    </div>
  );
}

```

# frontend\src\app\legal\ai-disclaimer\page.tsx

```tsx
"use client";

export default function Page() {
  return (
    <div className='main-content'>
      <h1>AI Disclaimer</h1>

      <p>
        <strong>Last Updated:</strong> March 25, 2025
      </p>

      <p>
        Summarizz utilizes artificial intelligence (AI) to provide certain
        features, including content summarization and thumbnail generation.
        Please read this disclaimer carefully to understand the limitations and
        implications of AI-generated content within our App.
      </p>

      <h2>1. AI-Generated Summaries</h2>

      <p>
        Summarizz employs AI algorithms to generate summaries of content
        articles. While we strive to ensure the accuracy and relevance of these
        summaries, AI-generated content may not always perfectly reflect the
        original source material. Therefore:
      </p>

      <ul>
        <li>
          <strong>Accuracy:</strong> AI-generated summaries are provided for
          convenience and informational purposes only. They should not be
          considered a substitute for reading the full original article.
        </li>
        <li>
          <strong>Bias:</strong> AI models can sometimes reflect biases present
          in the data they were trained on. Summaries may inadvertently include
          or omit information, potentially leading to biased or incomplete
          representations.
        </li>
        <li>
          <strong>Interpretation:</strong> The AI's interpretation of the source
          material may differ from human understanding. Critical analysis and
          independent verification are recommended.
        </li>
        <li>
          <strong>Changes:</strong> The algorithms and models are continuously
          being improved, thus the results may change over time.
        </li>
      </ul>

      <h2>2. AI-Generated Thumbnails</h2>

      <p>
        Summarizz plans to use AI to generate thumbnails for content. These
        thumbnails are intended to provide visual representations of the
        content. However:
      </p>

      <ul>
        <li>
          <strong>Relevance:</strong> While AI will attempt to create relevant
          thumbnails, the generated images may not always perfectly represent
          the content or its context.
        </li>
        <li>
          <strong>Aesthetic:</strong> The aesthetic quality and style of
          AI-generated thumbnails may vary.
        </li>
        <li>
          <strong>Originality:</strong> The created thumbnails may not be wholly
          original, and could contain elements similar to images used in the AI
          training data.
        </li>
        <li>
          <strong>Liability:</strong> We are not responsible for any
          misinterpretations or offense caused by the generated thumbnails.
        </li>
      </ul>

      <h2>3. User Responsibility</h2>

      <p>
        Users are responsible for evaluating the accuracy and appropriateness of
        AI-generated content and thumbnails. You should exercise your own
        judgment and discretion when using the App and its features.
      </p>

      <h2>4. Limitation of Liability</h2>

      <p>
        Summarizz and its creators are not liable for any errors, inaccuracies,
        or omissions in AI-generated content or thumbnails. We are not
        responsible for any damages or losses arising from your reliance on
        AI-generated content.
      </p>

      <h2>5. Continuous Improvement</h2>

      <p>
        We are continuously working to improve the accuracy and reliability of
        our AI models. However, AI technology is still evolving, and its
        limitations should be acknowledged.
      </p>

      <h2>6. Feedback</h2>

      <p>
        We welcome user feedback on AI-generated content and thumbnails. Your
        feedback helps us improve our services. Please contact us through our
        contact page with any comments or suggestions.
      </p>

      <h2>7. Changes to this AI Disclaimer</h2>

      <p>
        We may update this AI Disclaimer from time to time to reflect changes in
        our AI technologies or for other operational, legal, or regulatory
        reasons. Any changes will be posted on this page, and your continued use
        of the App constitutes acceptance of the revised disclaimer.
      </p>

      <h2>8. Contact Us</h2>

      <p>
        If you have any questions about this AI Disclaimer, please contact us
        at:{" "}
        <a href='https://summarizz.app/contact'>
          https://summarizz.app/contact
        </a>
      </p>
    </div>
  );
}

```

# frontend\src\app\legal\cookie-policy\page.tsx

```tsx
"use client";

export default function Page() {
  return (
    <div className='main-content'>
      <h1>Cookie Policy</h1>

      <p>
        <strong>Last Updated:</strong> March 25, 2025
      </p>

      <p>
        This Cookie Policy explains how Summarizz (hereinafter referred to as
        "the App"), accessible at https://summarizz.app/, uses cookies and
        similar tracking technologies to enhance your user experience. By using
        our App, you consent to the use of cookies as described in this policy.
      </p>

      <h2>1. What are Cookies?</h2>

      <p>
        Cookies are small text files that are placed on your device (computer,
        tablet, or mobile) when you visit a website or use an application. They
        are widely used to make websites and applications work, or work more
        efficiently, as well as to provide information to the owners of the site
        or app.
      </p>

      <h2>2. How We Use Cookies</h2>

      <p>Summarizz uses cookies for various purposes, including:</p>

      <ul>
        <li>
          <strong>Authentication:</strong> We use cookies to authenticate users
          who log in via OAuth. This allows us to remember your login state and
          provide a seamless user experience.
        </li>
        <li>
          <strong>Advertising:</strong> We use AdSense, which may use cookies to
          serve personalized ads based on your browsing activity. These cookies
          help AdSense and its partners to show you relevant ads.
        </li>
        <li>
          <strong>Analytics and Performance:</strong> We may use cookies to
          collect information about how users interact with our App. This helps
          us analyze and improve the App's performance and functionality.
        </li>
        <li>
          <strong>Preferences:</strong> We may use cookies to remember your
          preferences, such as language settings or display options.
        </li>
      </ul>

      <h2>3. Third-Party Cookies</h2>

      <p>
        In addition to our own cookies, we may use third-party cookies from
        services like AdSense and OAuth providers. These third parties may use
        cookies to track your online activities across different websites and
        applications.
      </p>

      <ul>
        <li>
          <strong>AdSense:</strong> Google AdSense uses cookies to deliver ads
          based on your previous visits to our App and other websites. You can
          learn more about Google's use of cookies for advertising at:{" "}
          <a href='https://policies.google.com/technologies/ads'>
            https://policies.google.com/technologies/ads
          </a>
        </li>
        <li>
          <strong>OAuth:</strong> When you log in with OAuth (e.g., Google,
          etc.), the provider sets cookies to manage the authentication process.
          Please refer to the privacy policies of the respective OAuth providers
          for more information on their cookie usage.
        </li>
      </ul>

      <h2>4. Managing Cookies</h2>

      <p>
        Most web browsers allow you to control cookies through their settings.
        You can typically choose to accept, reject, or delete cookies. However,
        please note that disabling cookies may affect the functionality of our
        App and your user experience. We are currently not displaying a cookie
        banner, but we recommend you adjust your browser settings to manage
        cookies according to your preferences.
      </p>

      <p>
        To manage cookies, you can typically find the settings in the "Options"
        or "Preferences" menu of your browser. Here are some links to cookie
        management guides for popular browsers:
      </p>

      <ul>
        <li>
          Google Chrome:{" "}
          <a href='https://support.google.com/chrome/answer/95647?hl=en'>
            https://support.google.com/chrome/answer/95647?hl=en
          </a>
        </li>
        <li>
          Mozilla Firefox:{" "}
          <a href='https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences'>
            https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences
          </a>
        </li>
        <li>
          Safari:{" "}
          <a href='https://support.apple.com/en-ca/guide/safari/sfri11471/mac'>
            https://support.apple.com/en-ca/guide/safari/sfri11471/mac
          </a>
        </li>
        <li>
          Microsoft Edge:{" "}
          <a href='https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-9474-177a-9c70-3947934dd8bb'>
            https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-9474-177a-9c70-3947934dd8bb
          </a>
        </li>
      </ul>

      <h2>5. Changes to this Cookie Policy</h2>

      <p>
        We may update this Cookie Policy from time to time to reflect changes in
        our use of cookies or for other operational, legal, or regulatory
        reasons. Any changes will be posted on this page, and your continued use
        of the App constitutes acceptance of the revised policy.
      </p>

      <h2>6. Contact Us</h2>

      <p>
        If you have any questions about our use of cookies, please contact us
        at:{" "}
        <a href='https://summarizz.app/contact'>
          https://summarizz.app/contact
        </a>
      </p>
    </div>
  );
}

```

# frontend\src\app\legal\privacy-policy\page.tsx

```tsx
"use client";

export default function Page() {
  return (
    <div className='main-content'>
      <h1>Privacy Policy</h1>
      <p>Last updated: March 25, 2025</p>
      <p>
        This Privacy Policy describes Our policies and procedures on the
        collection, use and disclosure of Your information when You use the
        Service and tells You about Your privacy rights and how the law protects
        You.
      </p>
      <p>
        We use Your Personal data to provide and improve the Service. By using
        the Service, You agree to the collection and use of information in
        accordance with this Privacy Policy.
      </p>
      <h2>Interpretation and Definitions</h2>
      <h3>Interpretation</h3>
      <p>
        The words of which the initial letter is capitalized have meanings
        defined under the following conditions. The following definitions shall
        have the same meaning regardless of whether they appear in singular or
        in plural.
      </p>
      <h3>Definitions</h3>
      <p>For the purposes of this Privacy Policy:</p>
      <ul>
        <li>
          <p>
            <strong>Account</strong> means a unique account created for You to
            access our Service or parts of our Service.
          </p>
        </li>
        <li>
          <p>
            <strong>Affiliate</strong> means an entity that controls, is
            controlled by or is under common control with a party, where
            &quot;control&quot; means ownership of 50% or more of the shares,
            equity interest or other securities entitled to vote for election of
            directors or other managing authority.
          </p>
        </li>
        <li>
          <p>
            <strong>Company</strong> (referred to as either &quot;the
            Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in
            this Agreement) refers to Summarizz.
          </p>
        </li>
        <li>
          <p>
            <strong>Cookies</strong> are small files that are placed on Your
            computer, mobile device or any other device by a website, containing
            the details of Your browsing history on that website among its many
            uses.
          </p>
        </li>
        <li>
          <p>
            <strong>Country</strong> refers to: Ontario, Canada
          </p>
        </li>
        <li>
          <p>
            <strong>Device</strong> means any device that can access the Service
            such as a computer, a cellphone or a digital tablet.
          </p>
        </li>
        <li>
          <p>
            <strong>Personal Data</strong> is any information that relates to an
            identified or identifiable individual.
          </p>
        </li>
        <li>
          <p>
            <strong>Service</strong> refers to the Website.
          </p>
        </li>
        <li>
          <p>
            <strong>Service Provider</strong> means any natural or legal person
            who processes the data on behalf of the Company. It refers to
            third-party companies or individuals employed by the Company to
            facilitate the Service, to provide the Service on behalf of the
            Company, to perform services related to the Service or to assist the
            Company in analyzing how the Service is used.
          </p>
        </li>
        <li>
          <p>
            <strong>Third-party Social Media Service</strong> refers to any
            website or any social network website through which a User can log
            in or create an account to use the Service.
          </p>
        </li>
        <li>
          <p>
            <strong>Usage Data</strong> refers to data collected automatically,
            either generated by the use of the Service or from the Service
            infrastructure itself (for example, the duration of a page visit).
          </p>
        </li>
        <li>
          <p>
            <strong>Website</strong> refers to Summarizz, accessible from{" "}
            <a
              href='https://summarizz.app/'
              rel='external nofollow noopener'
              target='_blank'
            >
              https://summarizz.app/
            </a>
          </p>
        </li>
        <li>
          <p>
            <strong>You</strong> means the individual accessing or using the
            Service, or the company, or other legal entity on behalf of which
            such individual is accessing or using the Service, as applicable.
          </p>
        </li>
      </ul>
      <h2>Collecting and Using Your Personal Data</h2>
      <h3>Types of Data Collected</h3>
      <h4>Personal Data</h4>
      <p>
        While using Our Service, We may ask You to provide Us with certain
        personally identifiable information that can be used to contact or
        identify You. Personally identifiable information may include, but is
        not limited to:
      </p>
      <ul>
        <li>
          <p>Email address</p>
        </li>
        <li>
          <p>First name and last name</p>
        </li>
        <li>
          <p>Phone number</p>
        </li>
        <li>
          <p>Usage Data</p>
        </li>
      </ul>
      <h4>Usage Data</h4>
      <p>Usage Data is collected automatically when using the Service.</p>
      <p>
        Usage Data may include information such as Your Device's Internet
        Protocol address (e.g. IP address), browser type, browser version, the
        pages of our Service that You visit, the time and date of Your visit,
        the time spent on those pages, unique device identifiers and other
        diagnostic data.
      </p>
      <p>
        When You access the Service by or through a mobile device, We may
        collect certain information automatically, including, but not limited
        to, the type of mobile device You use, Your mobile device unique ID, the
        IP address of Your mobile device, Your mobile operating system, the type
        of mobile Internet browser You use, unique device identifiers and other
        diagnostic data.
      </p>
      <p>
        We may also collect information that Your browser sends whenever You
        visit our Service or when You access the Service by or through a mobile
        device.
      </p>
      <h4>Information from Third-Party Social Media Services</h4>
      <p>
        The Company allows You to create an account and log in to use the
        Service through the following Third-party Social Media Services:
      </p>
      <ul>
        <li>Google</li>
        <li>Facebook</li>
        <li>Instagram</li>
        <li>Twitter</li>
        <li>LinkedIn</li>
      </ul>
      <p>
        If You decide to register through or otherwise grant us access to a
        Third-Party Social Media Service, We may collect Personal data that is
        already associated with Your Third-Party Social Media Service's account,
        such as Your name, Your email address, Your activities or Your contact
        list associated with that account.
      </p>
      <p>
        You may also have the option of sharing additional information with the
        Company through Your Third-Party Social Media Service's account. If You
        choose to provide such information and Personal Data, during
        registration or otherwise, You are giving the Company permission to use,
        share, and store it in a manner consistent with this Privacy Policy.
      </p>
      <h4>Tracking Technologies and Cookies</h4>
      <p>
        We use Cookies and similar tracking technologies to track the activity
        on Our Service and store certain information. Tracking technologies used
        are beacons, tags, and scripts to collect and track information and to
        improve and analyze Our Service. The technologies We use may include:
      </p>
      <ul>
        <li>
          <strong>Cookies or Browser Cookies.</strong> A cookie is a small file
          placed on Your Device. You can instruct Your browser to refuse all
          Cookies or to indicate when a Cookie is being sent. However, if You do
          not accept Cookies, You may not be able to use some parts of our
          Service. Unless you have adjusted Your browser setting so that it will
          refuse Cookies, our Service may use Cookies.
        </li>
        <li>
          <strong>Web Beacons.</strong> Certain sections of our Service and our
          emails may contain small electronic files known as web beacons (also
          referred to as clear gifs, pixel tags, and single-pixel gifs) that
          permit the Company, for example, to count users who have visited those
          pages or opened an email and for other related website statistics (for
          example, recording the popularity of a certain section and verifying
          system and server integrity).
        </li>
      </ul>
      <p>
        Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies.
        Persistent Cookies remain on Your personal computer or mobile device
        when You go offline, while Session Cookies are deleted as soon as You
        close Your web browser. Learn more about cookies on the{" "}
        <a
          href='https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/#Use_Of_Cookies_And_Tracking'
          target='_blank'
        >
          Free Privacy Policy website
        </a>{" "}
        article.
      </p>
      <p>
        We use both Session and Persistent Cookies for the purposes set out
        below:
      </p>
      <ul>
        <li>
          <p>
            <strong>Necessary / Essential Cookies</strong>
          </p>
          <p>Type: Session Cookies</p>
          <p>Administered by: Us</p>
          <p>
            Purpose: These Cookies are essential to provide You with services
            available through the Website and to enable You to use some of its
            features. They help to authenticate users and prevent fraudulent use
            of user accounts. Without these Cookies, the services that You have
            asked for cannot be provided, and We only use these Cookies to
            provide You with those services.
          </p>
        </li>
        <li>
          <p>
            <strong>Cookies Policy / Notice Acceptance Cookies</strong>
          </p>
          <p>Type: Persistent Cookies</p>
          <p>Administered by: Us</p>
          <p>
            Purpose: These Cookies identify if users have accepted the use of
            cookies on the Website.
          </p>
        </li>
        <li>
          <p>
            <strong>Functionality Cookies</strong>
          </p>
          <p>Type: Persistent Cookies</p>
          <p>Administered by: Us</p>
          <p>
            Purpose: These Cookies allow us to remember choices You make when
            You use the Website, such as remembering your login details or
            language preference. The purpose of these Cookies is to provide You
            with a more personal experience and to avoid You having to re-enter
            your preferences every time You use the Website.
          </p>
        </li>
      </ul>
      <p>
        For more information about the cookies we use and your choices regarding
        cookies, please visit our Cookies Policy or the Cookies section of our
        Privacy Policy.
      </p>
      <h3>Use of Your Personal Data</h3>
      <p>The Company may use Personal Data for the following purposes:</p>
      <ul>
        <li>
          <p>
            <strong>To provide and maintain our Service</strong>, including to
            monitor the usage of our Service.
          </p>
        </li>
        <li>
          <p>
            <strong>To manage Your Account:</strong> to manage Your registration
            as a user of the Service. The Personal Data You provide can give You
            access to different functionalities of the Service that are
            available to You as a registered user.
          </p>
        </li>
        <li>
          <p>
            <strong>For the performance of a contract:</strong> the development,
            compliance and undertaking of the purchase contract for the
            products, items or services You have purchased or of any other
            contract with Us through the Service.
          </p>
        </li>
        <li>
          <p>
            <strong>To contact You:</strong> To contact You by email, telephone
            calls, SMS, or other equivalent forms of electronic communication,
            such as a mobile application's push notifications regarding updates
            or informative communications related to the functionalities,
            products or contracted services, including the security updates,
            when necessary or reasonable for their implementation.
          </p>
        </li>
        <li>
          <p>
            <strong>To provide You</strong> with news, special offers and
            general information about other goods, services and events which we
            offer that are similar to those that you have already purchased or
            enquired about unless You have opted not to receive such
            information.
          </p>
        </li>
        <li>
          <p>
            <strong>To manage Your requests:</strong> To attend and manage Your
            requests to Us.
          </p>
        </li>
        <li>
          <p>
            <strong>For business transfers:</strong> We may use Your information
            to evaluate or conduct a merger, divestiture, restructuring,
            reorganization, dissolution, or other sale or transfer of some or
            all of Our assets, whether as a going concern or as part of
            bankruptcy, liquidation, or similar proceeding, in which Personal
            Data held by Us about our Service users is among the assets
            transferred.
          </p>
        </li>
        <li>
          <p>
            <strong>For other purposes</strong>: We may use Your information for
            other purposes, such as data analysis, identifying usage trends,
            determining the effectiveness of our promotional campaigns and to
            evaluate and improve our Service, products, services, marketing and
            your experience.
          </p>
        </li>
      </ul>
      <p>We may share Your personal information in the following situations:</p>
      <ul>
        <li>
          <strong>With Service Providers:</strong> We may share Your personal
          information with Service Providers to monitor and analyze the use of
          our Service, to contact You.
        </li>
        <li>
          <strong>For business transfers:</strong> We may share or transfer Your
          personal information in connection with, or during negotiations of,
          any merger, sale of Company assets, financing, or acquisition of all
          or a portion of Our business to another company.
        </li>
        <li>
          <strong>With Affiliates:</strong> We may share Your information with
          Our affiliates, in which case we will require those affiliates to
          honor this Privacy Policy. Affiliates include Our parent company and
          any other subsidiaries, joint venture partners or other companies that
          We control or that are under common control with Us.
        </li>
        <li>
          <strong>With business partners:</strong> We may share Your information
          with Our business partners to offer You certain products, services or
          promotions.
        </li>
        <li>
          <strong>With other users:</strong> when You share personal information
          or otherwise interact in the public areas with other users, such
          information may be viewed by all users and may be publicly distributed
          outside. If You interact with other users or register through a
          Third-Party Social Media Service, Your contacts on the Third-Party
          Social Media Service may see Your name, profile, pictures and
          description of Your activity. Similarly, other users will be able to
          view descriptions of Your activity, communicate with You and view Your
          profile.
        </li>
        <li>
          <strong>With Your consent</strong>: We may disclose Your personal
          information for any other purpose with Your consent.
        </li>
      </ul>
      <h3>Retention of Your Personal Data</h3>
      <p>
        The Company will retain Your Personal Data only for as long as is
        necessary for the purposes set out in this Privacy Policy. We will
        retain and use Your Personal Data to the extent necessary to comply with
        our legal obligations (for example, if we are required to retain your
        data to comply with applicable laws), resolve disputes, and enforce our
        legal agreements and policies.
      </p>
      <p>
        The Company will also retain Usage Data for internal analysis purposes.
        Usage Data is generally retained for a shorter period of time, except
        when this data is used to strengthen the security or to improve the
        functionality of Our Service, or We are legally obligated to retain this
        data for longer time periods.
      </p>
      <h3>Transfer of Your Personal Data</h3>
      <p>
        Your information, including Personal Data, is processed at the Company's
        operating offices and in any other places where the parties involved in
        the processing are located. It means that this information may be
        transferred to — and maintained on — computers located outside of Your
        state, province, country or other governmental jurisdiction where the
        data protection laws may differ than those from Your jurisdiction.
      </p>
      <p>
        Your consent to this Privacy Policy followed by Your submission of such
        information represents Your agreement to that transfer.
      </p>
      <p>
        The Company will take all steps reasonably necessary to ensure that Your
        data is treated securely and in accordance with this Privacy Policy and
        no transfer of Your Personal Data will take place to an organization or
        a country unless there are adequate controls in place including the
        security of Your data and other personal information.
      </p>
      <h3>Delete Your Personal Data</h3>
      <p>
        You have the right to delete or request that We assist in deleting the
        Personal Data that We have collected about You.
      </p>
      <p>
        Our Service may give You the ability to delete certain information about
        You from within the Service.
      </p>
      <p>
        You may update, amend, or delete Your information at any time by signing
        in to Your Account, if you have one, and visiting the account settings
        section that allows you to manage Your personal information. You may
        also contact Us to request access to, correct, or delete any personal
        information that You have provided to Us.
      </p>
      <p>
        Please note, however, that We may need to retain certain information
        when we have a legal obligation or lawful basis to do so.
      </p>
      <h3>Disclosure of Your Personal Data</h3>
      <h4>Business Transactions</h4>
      <p>
        If the Company is involved in a merger, acquisition or asset sale, Your
        Personal Data may be transferred. We will provide notice before Your
        Personal Data is transferred and becomes subject to a different Privacy
        Policy.
      </p>
      <h4>Law enforcement</h4>
      <p>
        Under certain circumstances, the Company may be required to disclose
        Your Personal Data if required to do so by law or in response to valid
        requests by public authorities (e.g. a court or a government agency).
      </p>
      <h4>Other legal requirements</h4>
      <p>
        The Company may disclose Your Personal Data in the good faith belief
        that such action is necessary to:
      </p>
      <ul>
        <li>Comply with a legal obligation</li>
        <li>Protect and defend the rights or property of the Company</li>
        <li>
          Prevent or investigate possible wrongdoing in connection with the
          Service
        </li>
        <li>
          Protect the personal safety of Users of the Service or the public
        </li>
        <li>Protect against legal liability</li>
      </ul>
      <h3>Security of Your Personal Data</h3>
      <p>
        The security of Your Personal Data is important to Us, but remember that
        no method of transmission over the Internet, or method of electronic
        storage is 100% secure. While We strive to use commercially acceptable
        means to protect Your Personal Data, We cannot guarantee its absolute
        security.
      </p>
      <h2>Children's Privacy</h2>
      <p>
        Our Service does not address anyone under the age of 13. We do not
        knowingly collect personally identifiable information from anyone under
        the age of 13. If You are a parent or guardian and You are aware that
        Your child has provided Us with Personal Data, please contact Us. If We
        become aware that We have collected Personal Data from anyone under the
        age of 13 without verification of parental consent, We take steps to
        remove that information from Our servers.
      </p>
      <p>
        If We need to rely on consent as a legal basis for processing Your
        information and Your country requires consent from a parent, We may
        require Your parent's consent before We collect and use that
        information.
      </p>
      <h2>Links to Other Websites</h2>
      <p>
        Our Service may contain links to other websites that are not operated by
        Us. If You click on a third party link, You will be directed to that
        third party's site. We strongly advise You to review the Privacy Policy
        of every site You visit.
      </p>
      <p>
        We have no control over and assume no responsibility for the content,
        privacy policies or practices of any third party sites or services.
      </p>
      <h2>Changes to this Privacy Policy</h2>
      <p>
        We may update Our Privacy Policy from time to time. We will notify You
        of any changes by posting the new Privacy Policy on this page.
      </p>
      <p>
        We will let You know via email and/or a prominent notice on Our Service,
        prior to the change becoming effective and update the &quot;Last
        updated&quot; date at the top of this Privacy Policy.
      </p>
      <p>
        You are advised to review this Privacy Policy periodically for any
        changes. Changes to this Privacy Policy are effective when they are
        posted on this page.
      </p>
      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, You can contact us:
      </p>
      <ul>
        <li>
          By visiting this page on our website:{" "}
          <a
            href='https://summarizz.app/contact'
            rel='external nofollow noopener'
            target='_blank'
          >
            https://summarizz.app/contact
          </a>
        </li>
      </ul>
    </div>
  );
}

```

# frontend\src\app\legal\terms-of-service\page.tsx

```tsx
"use client";

export default function Page() {
  return (
    <div className='main-content'>
      <h1>Terms of Service</h1>

      <p>
        <strong>Last Updated:</strong> March 25, 2025
      </p>

      <p>
        Welcome to Summarizz (hereinafter referred to as "the App"), accessible
        at https://summarizz.app/. By accessing or using the App, you
        (hereinafter referred to as "the User") agree to comply with and be
        bound by the following Terms of Service ("Terms"). If you do not agree
        with these Terms, please do not use the App.
      </p>

      <h2>1. Acceptance of Terms</h2>

      <p>
        By creating an account, uploading images, or subscribing to Pro features
        on Summarizz, you acknowledge that you have read, understood, and agreed
        to these Terms.
      </p>

      <h2>2. User Accounts</h2>

      <p>
        Users may create accounts to utilize the App's features. You are
        responsible for maintaining the confidentiality of your account
        credentials and for all activities that occur under your account. You
        agree to notify us immediately of any unauthorized access or use of your
        account.
      </p>

      <h2>3. User Content</h2>

      <p>
        Users may upload images to the App. By uploading images, you grant
        Summarizz a non-exclusive, royalty-free, worldwide license to use,
        reproduce, modify, and display the images for the purpose of providing
        and improving the App's services. You warrant that you have the
        necessary rights and permissions to upload and use the images.
      </p>

      <h2>4. Pro Subscription</h2>

      <p>
        Users may subscribe to Pro features for enhanced functionality.
        Subscription fees are processed through Stripe, a third-party payment
        processor. You agree to Stripe's terms of service and privacy policy.
        Summarizz is not responsible for any issues related to payment
        processing by Stripe.
      </p>

      <h2>5. Intellectual Property</h2>

      <p>
        The App and its content, including but not limited to software, code,
        and design, are owned by us (Summarizz). You may not reproduce,
        distribute, or modify any part of the App without our express written
        consent.
      </p>

      <h2>6. Third-Party Services</h2>

      <p>
        Summarizz utilizes third-party services, including but not limited to
        Stripe (payment processing), AdSense (advertising), Algolia (search),
        and hosting platforms. You agree to abide by the terms of service and
        privacy policies of these third-party services. Summarizz is not
        responsible for the performance or availability of these services.
      </p>

      <h2>7. Feedback and Improvements</h2>

      <p>
        We may use user feedback and suggestions to improve the App without
        providing compensation or credit to the users who provided the feedback.
        By providing feedback, you grant us a non-exclusive, perpetual,
        irrevocable, royalty-free, worldwide license to use and incorporate such
        feedback into the App.
      </p>

      <h2>8. Promotions</h2>

      <p>
        Summarizz may offer promotions and discounts from time to time. We
        reserve the right to modify or terminate any promotion at any time
        without notice.
      </p>

      <h2>9. Limitation of Liability</h2>

      <p>
        Summarizz is provided "as is" and "as available" without any warranties.
        We are not liable for any direct, indirect, incidental, consequential,
        or punitive damages arising from your use of the App. As we are students
        and this is a hobby project, there is no formal business entity.
        Therefore, no legal entity will be held liable.
      </p>

      <h2>10. Governing Law</h2>

      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the Province of Ontario, Canada, without regard to its conflict
        of law principles.
      </p>

      <h2>11. Changes to Terms</h2>

      <p>
        We reserve the right to modify these Terms at any time. Any changes will
        be posted on this page, and your continued use of the App constitutes
        acceptance of the revised Terms.
      </p>

      <h2>12. Contact Us</h2>

      <p>
        If you have any questions about these Terms, please contact us at:{" "}
        <a href='https://summarizz.app/contact'>
          https://summarizz.app/contact
        </a>
      </p>
    </div>
  );
}

```

# frontend\src\app\page.tsx

```tsx
"use client";

import { useAuth } from "@/hooks/AuthProvider";
import { Content } from "@/models/Content";
import { useEffect, useState } from "react";
import { apiURL } from "./scripts/api";
import axios from "axios";
import { User } from "@/models/User";
import ContentTile from "@/components/content/ContentTile";

import "@/app/styles/feed.scss";

export default function Page() {
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [latestContent, setLatestContent] = useState<Content[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { userUID } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const [errorTrending, setErrorTrending] = useState<string | null>(null);
  const [errorLatest, setErrorLatest] = useState<string | null>(null);
  const [errorPersonalized, setErrorPersonalized] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Function to reload the Mondiad script (ADS)
    const reloadMondiadScript = () => {
      const existingScript = document.querySelector(
        "script[src='https://ss.mrmnd.com/native.js']"
      );
      if (existingScript) {
        // Remove the existing script
        existingScript.remove();
      }

      // Create a new script element
      const script = document.createElement("script");
      script.src = "https://ss.mrmnd.com/native.js";
      script.async = true;

      // Append the script to the document head
      document.head.appendChild(script);
    };

    // Reload the script whenever the component renders
    reloadMondiadScript();
  }, [trendingContent, personalizedContent, latestContent]); // Dependency array ensures this runs when trendingContent changes

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);

      setErrorTrending(null);
      setErrorLatest(null);
      setErrorPersonalized(null);

      let userFetched = await fetchUser();
      let latestFetched = await fetchLatestContent();
      let trendingFetched = await fetchTrendingContent();
      let personalizedFetched = await fetchPersonalizedContent();

      if (!userFetched) {
        setUser(null);
      }

      if (!latestFetched) {
        setErrorLatest(
          "Failed to fetch latest content. Please reload the page or contact support."
        );
      }

      if (!trendingFetched) {
        setErrorTrending(
          "Failed to fetch trending content. Please reload the page or contact support."
        );
      }

      if (!personalizedFetched) {
        setErrorPersonalized(
          "Failed to fetch personalized content. Please reload the page or contact support."
        );
      }

      setIsLoading(false);
    };

    fetchContent();
  }, [userUID]);

  async function fetchUser(): Promise<boolean> {
    if (!userUID) {
      setUser(null);
      return false;
    }
    try {
      const userResponse = await axios.get(`${apiURL}/user/${userUID}`, {
        timeout: 5000,
      });

      if (userResponse.status === 200 || userResponse.status === 201) {
        setUser(userResponse.data);
        return true;
      } else {
        setUser(null);
      }
    } catch (userError) {
      setUser(null);
    }

    return false;
  }

  async function fetchTrendingContent(): Promise<boolean> {
    try {
      const trendingResponse = await axios.get(
        `${apiURL}/content/feed/trending`,
        { timeout: 5000 }
      );

      if (trendingResponse.data && trendingResponse.data.success) {
        const normalizedContent = trendingResponse.data.trendingContent.map(
          (content: Content) => normalizeContentDates(content)
        );
        setTrendingContent(normalizedContent);
        return true;
      } else {
        setTrendingContent([]);
      }
    } catch (trendingError) {
      setTrendingContent([]);
    }

    return false;
  }

  async function fetchLatestContent(): Promise<boolean> {
    try {
      const contentResponse = await axios.get(`${apiURL}/content`, {
        timeout: 5000,
      });

      if (contentResponse.data && contentResponse.data.success) {
        const latestContent = contentResponse.data.content;

        const normalizedContent = latestContent.map((content: Content) =>
          normalizeContentDates(content)
        );

        setLatestContent(normalizedContent);
        return true;
      } else {
        setLatestContent([]);
      }
    } catch (contentError) {
      setLatestContent([]);
    }

    return false;
  }

  async function fetchPersonalizedContent(): Promise<boolean> {
    if (!userUID) {
      setPersonalizedContent([]);
      return false;
    }

    try {
      const personalizedResponse = await axios.get(
        `${apiURL}/content/feed/${userUID}`,
        { timeout: 5000 }
      );

      if (personalizedResponse.data && personalizedResponse.data.success) {
        const normalizedContent =
          personalizedResponse.data.personalizedContent.map(
            (content: Content) => normalizeContentDates(content)
          );
        setPersonalizedContent(normalizedContent);
        return true;
      } else {
        setPersonalizedContent([]);
      }
    } catch (personalizedError) {
      setPersonalizedContent([]);
    }
    return false;
  }

  function normalizeContentDates(content: Content): Content {
    if (content.dateCreated && (content.dateCreated as any).seconds) {
      content.dateCreated = new Date(
        (content.dateCreated as any).seconds * 1000
      );
    }

    return content;
  }

  return (
    <div className='main-content'>
      {isLoading && <p>Loading...</p>}
      {user ? (
        <h1>Welcome, {user?.firstName}</h1>
      ) : (
        <h1 className='summarizz-logo-container'>
          <span className='summarizz-logo'>SUMMARIZZ</span>
        </h1>
      )}

      <h2 className='feed-section-title'>Top Trending</h2>
      <div className='content-list-horizontal'>
        {/* <div className='ad-tile'>
          <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
        </div> */}
        {trendingContent.length === 0 ? (
          <h3>No content found</h3>
        ) : (
          <div className='content-list-horizontal'>
            {trendingContent.map((content, index) => (
              <div>
                {index % 8 === 2 ? (
                  <div className='ad-tile'>
                    <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
                  </div>
                ) : (
                  <ContentTile
                    key={content.uid || index}
                    content={content}
                    index={index}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {errorTrending && <p className='error'>{errorTrending}</p>}
      {/* <h2 className='feed-section-title'>Latest Post</h2>
      {latestContent.length === 0 ? (
        <h3>No content found</h3>
      ) : (
        <div className='content-list'>
          {latestContent.map((content, index) => (
            <ContentTile
              key={content.uid || index}
              content={content}
              index={index}
            />
          ))}
        </div>
      )}
      {errorLatest && <p className='error'>{errorLatest}</p>} */}
      {user && (
        <div>
          <h2 className='feed-section-title'>For You</h2>
          {personalizedContent.length === 0 ? (
            <h3>No content found</h3>
          ) : (
            <div className='content-list'>
              {personalizedContent.map((content, index) => (
                <div>
                  {index % 10 === 4 ? (
                    <div className='ad-tile'>
                      <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
                    </div>
                  ) : (
                    <ContentTile
                      key={content.uid || index}
                      content={content}
                      index={index}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {errorPersonalized && <p className='error'>{errorPersonalized}</p>}
        </div>
      )}
    </div>
  );
}

```

# frontend\src\app\pro\manage\page.tsx

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import "@/app/styles/manage-subscription.scss";

interface SubscriptionStatus {
  active: boolean;
  tier: string;
  periodEnd: string;
  canceledAt: string | null;
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  useEffect(() => {
    const isAuthenticated = auth.getUserUID() !== null && auth.getToken() !== null;
    
    if (!isAuthenticated) {
      router.push("/authentication/login?redirect=/pro/manage");
      return;
    }
    
    fetchSubscriptionStatus();
  }, [auth, router]);

  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = auth.getToken();
      const response = await axios.get(
        `${apiURL}/subscription/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setSubscription(response.data);
    } catch (err: any) {
      console.error("Failed to fetch subscription status:", err);
      setError(err.response?.data?.error || "Failed to load subscription details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period.")) {
      return;
    }
    
    setCancelLoading(true);
    setError("");
    
    try {
      const token = auth.getToken();
      const response = await axios.post(
        `${apiURL}/subscription/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setCancelSuccess(true);
      // Refresh subscription status
      setSubscription({
        ...subscription!,
        canceledAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Failed to cancel subscription:", err);
      setError(err.response?.data?.error || "Failed to cancel subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="manage-subscription-container">
        <div className="subscription-card">
          <h1>Loading subscription details...</h1>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.active) {
    return (
      <div className="manage-subscription-container">
        <div className="subscription-card">
          <h1>No Active Subscription</h1>
          <p>You don't have an active Summarizz Pro subscription.</p>
          <button 
            className="subscribe-button" 
            onClick={() => router.push("/pro/subscribe")}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-subscription-container">
      <div className="subscription-card">
        <h1>Manage Your Subscription</h1>
        
        {error && <div className="error-message">{error}</div>}
        {cancelSuccess && <div className="success-message">Your subscription has been canceled successfully. You'll have access until the end of your current billing period.</div>}
        
        <div className="subscription-details">
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">
              {subscription.canceledAt ? "Canceled (access until period end)" : "Active"}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Plan:</span>
            <span className="detail-value">Summarizz Pro</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Current Period Ends:</span>
            <span className="detail-value">{formatDate(subscription.periodEnd)}</span>
          </div>
          
          {subscription.canceledAt && (
            <div className="detail-row">
              <span className="detail-label">Canceled On:</span>
              <span className="detail-value">{formatDate(subscription.canceledAt)}</span>
            </div>
          )}
        </div>
        
        {!subscription.canceledAt && (
          <button 
            className="cancel-button" 
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
          >
            {cancelLoading ? "Processing..." : "Cancel Subscription"}
          </button>
        )}
        
        <div className="subscription-info">
          <p>
            {subscription.canceledAt 
              ? "Your subscription has been canceled and will not renew. You'll have access to Pro features until the end of your current billing period."
              : "You can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your current billing period."}
          </p>
        </div>
        
        <button 
          className="back-button" 
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

```

# frontend\src\app\pro\page.tsx

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import "@/app/styles/pro.scss";
import SummarizzPro from "@/components/SummarizzPro";

export default function ProPage() {
  const router = useRouter();
  const auth = useAuth();
  const [authenticated, setAuthenticated] = useState(
    auth.getUserUID() !== null && auth.getToken() !== null
  );
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authenticated) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [authenticated]);

  const checkSubscriptionStatus = async () => {
    try {
      const token = auth.getToken();
      const response = await axios.get(
        `${apiURL}/subscription/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setHasSubscription(response.data.active);
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setHasSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!authenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
      return;
    }
    router.push("/pro/subscribe");
  };
  
  const handleManageSubscription = () => {
    router.push("/pro/manage");
  };

  return (
    <div className='main-content'>
      <div className='pro-hero'>
        <SummarizzPro />
        <p className='pro-subtitle'>
          Unlock the full potential of your content
        </p>
        {loading ? (
          <button className='pro-cta-button' disabled>
            Loading...
          </button>
        ) : hasSubscription ? (
          <button className='pro-cta-button manage-button' onClick={handleManageSubscription}>
            Manage Your Subscription
          </button>
        ) : (
          <button className='pro-cta-button' onClick={handleSubscribe}>
            Get Summarizz Pro
          </button>
        )}
      </div>

      <div className='pro-features'>
        <h2 className='pro-section-header'>Why upgrade?</h2>
        <div className='features-grid'>
          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Unlimited Summaries</h3>
            <p>Create as many summaries as you need without restrictions</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Priority Processing</h3>
            <p>Your content gets processed faster than free accounts</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Advanced Analytics</h3>
            <p>Gain insights into how your content performs</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Premium Templates</h3>
            <p>Access to exclusive premium summary templates</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Ad-Free Experience</h3>
            <p>Enjoy Summarizz without any advertisements</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Priority Support</h3>
            <p>Get help faster with dedicated support for Pro users</p>
          </div>
        </div>
      </div>

      <div className='pro-pricing'>
        <h2 className='pro-section-header'>Simple, Transparent Pricing</h2>
        <div className='pricing-card'>
          <SummarizzPro />
          <div className='price'>
            $9.99<span>/month</span>
          </div>
          <ul className='pricing-features'>
            <li>Unlimited Summaries</li>
            <li>Priority Processing</li>
            <li>Advanced Analytics</li>
            <li>Premium Templates</li>
            <li>Ad-Free Experience</li>
            <li>Priority Support</li>
          </ul>
          {loading ? (
            <button className='pricing-button' disabled>
              Loading...
            </button>
          ) : hasSubscription ? (
            <button className='pricing-button manage-button' onClick={handleManageSubscription}>
              Manage Subscription
            </button>
          ) : (
            <button className='pricing-button' onClick={handleSubscribe}>
              Subscribe Now
            </button>
          )}
        </div>
      </div>

      <div className='pro-testimonials'>
        <h2>What Our Pro Users Say</h2>
        <div className='testimonials-container'>
          <div className='testimonial-card'>
            <p>
              "Summarizz Pro has completely transformed how I consume content.
              The unlimited summaries feature alone is worth the subscription!"
            </p>
            <div className='testimonial-author'>- Alex Johnson</div>
          </div>

          <div className='testimonial-card'>
            <p>
              "The premium templates have saved me countless hours. I can now
              create professional-looking summaries in minutes."
            </p>
            <div className='testimonial-author'>- Sarah Williams</div>
          </div>

          <div className='testimonial-card'>
            <p>
              "As a content creator, the analytics feature has been invaluable
              in understanding what resonates with my audience."
            </p>
            <div className='testimonial-author'>- Michael Chen</div>
          </div>
        </div>
      </div>

      <div className='pro-cta'>
        <h2>Ready to Upgrade Your Experience?</h2>
        <p>
          Join thousands of satisfied users who have already upgraded to
          Summarizz Pro
        </p>
        {loading ? (
          <button className='pro-cta-button' disabled>
            Loading...
          </button>
        ) : hasSubscription ? (
          <button className='pro-cta-button manage-button' onClick={handleManageSubscription}>
            Manage Your Subscription
          </button>
        ) : (
          <button className='pro-cta-button' onClick={handleSubscribe}>
            Get Started with Pro
          </button>
        )}
      </div>
    </div>
  );
}

```

# frontend\src\app\pro\subscribe\page.tsx

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import "@/app/styles/subscribe.scss";

export default function SubscribePage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const isAuthenticated = auth.getUserUID() !== null && auth.getToken() !== null;
    setAuthenticated(isAuthenticated);
    
    if (!isAuthenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
    }
  }, [auth, router]);

  const handleSubscribe = async () => {
    if (!authenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = auth.getToken();
      const response = await axios.post(
        `${apiURL}/subscription/create-checkout-session`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (err: any) {
      console.error("Subscription error:", err);
      setError(err.response?.data?.error || "Failed to create subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscribe-page-container">
      <div className="subscribe-card">
        <h1>Subscribe to Summarizz Pro</h1>
        <p className="subscribe-description">
          You're just one step away from unlocking all the premium features of Summarizz Pro.
        </p>

        <div className="subscription-details">
          <div className="subscription-plan">
            <h2>Monthly Plan</h2>
            <div className="subscription-price">$9.99<span>/month</span></div>
            <ul className="subscription-features">
              <li>Unlimited Summaries</li>
              <li>Priority Processing</li>
              <li>Advanced Analytics</li>
              <li>Premium Templates</li>
              <li>Ad-Free Experience</li>
              <li>Priority Support</li>
            </ul>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          className="subscribe-button" 
          onClick={handleSubscribe}
          disabled={loading || !authenticated}
        >
          {loading ? "Processing..." : "Subscribe Now"}
        </button>

        <div className="payment-info">
          <p>Secure payment processing by Stripe</p>
          <p className="payment-disclaimer">
            You can cancel your subscription at any time from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}

```

# frontend\src\app\profile\[id]\manage\page.tsx

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";

import { apiURL } from "@/app/scripts/api";
import { useAuth } from "@/hooks/AuthProvider";
import { User } from "@/models/User";

import "@/app/styles/profile/ProfileManagement.scss";
import { useParams } from "next/navigation";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Profile Management page, allowing users to manage their profile.
 *
 * @returns JSX.Element
 */
export default function Page() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const { id } = useParams();
  const auth = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [imageError, setImageError] = useState("");
  const [errorEditProfile, setErrorEditProfile] = useState("");
  const [successEditProfile, setSuccessEditProfile] = useState("");

  const [activeTab, setActiveTab] = useState<"password" | "email" | "username">(
    "password"
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorEditPassword, setErrorEditPassword] = useState("");
  const [successEditPassord, setSuccessEditPassord] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [errorEditEmail, setErrorEditEmail] = useState("");
  const [successEditEmail, setSuccessEditEmail] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [errorEditUsername, setErrorEditUsername] = useState("");
  const [successEditUsername, setSuccessEditUsername] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorDeleteAccount, setErrorDeleteAccount] = useState("");
  const [successDeleteAccount, setSuccessDeleteAccount] = useState("");

  // ---------------------------------------
  // ------------ Event Handlers -----------
  // ---------------------------------------
  /**
   * @description
   * Used to prevent fetching user data on page load.
   *
   * @returns void
   */
  const hasFetchedData = useRef(false);
  useEffect(() => {
    if (!hasFetchedData.current) {
      if (typeof id === "string") {
        getUserInfo(id);
      }
      hasFetchedData.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update profile image if it exists
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImagePreview(user.profileImage);
    }
  }, [user]);

  /**
   * @description
   * Handles the file upload for the thumbnail, and sets the thumbnail preview
   * to the file that was uploaded. If the file is not an image, or one was not provided, it
   * will throw and error indicating that the thumbnail was not set and to try again.
   *
   * @param e - Change Event for Thumbnail File
   * @returns void
   */
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files ? e.target.files[0] : null;

    if (file && file.type.startsWith("image/")) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    } else {
      setProfileImage(null);
      setProfileImagePreview(null);
      setImageError("Please select a valid image file.");
    }
  };

  /**
   * @description
   * Handles the edit profile form, setting the error and success states
   * to an empty string and calling the backend to update the user profile.
   *
   * @param e - Form Event
   * @returns void
   */

  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorEditProfile("");
    setSuccessEditProfile("");

    // 1- Validation
    if (!user) {
      setErrorEditProfile("No user found.");
      return;
    }

    if (!user?.firstName || !user?.lastName) {
      setErrorEditProfile("Please fill out all fields with: *.");
      return;
    }

    if (profileImage && profileImage.size > 5000000) {
      setErrorEditProfile("Profile image must be less than 5MB.");
      return;
    }

    if (user?.phone && user.phone.length > 15) {
      setErrorEditProfile("Please provide a valid phone number.");
      return;
    }

    if (user?.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const currentDate = new Date();
      if (dob > currentDate) {
        setErrorEditProfile("Please provide a valid date of birth.");
        return;
      }
    }

    // 2- Send upload image request to backend if profile image exists
    if (profileImage) {
      await uploadProfileImage();
    }

    // 3- Update user profile
    try {
      const res = await axios.put(`${apiURL}/user/${id}`, user);

      // 3- Handle response
      if (res.status === 200 || res.status === 201) {
        setSuccessEditProfile("Profile updated successfully.");
      } else {
        setErrorEditProfile("An error occurred. Please try again.");
      }
    } catch (error) {
      setErrorEditProfile("Failed to update profile. Please try again.");
    }
  };

  /**
   * @description
   * Uploads the profile image to the backend, and sets the user's profile image
   * to the new profile image.
   *
   * @returns void
   */
  const uploadProfileImage = async () => {
    if (!user) {
      setErrorEditProfile("No user found.");
      return;
    }

    if (!profileImage) {
      setErrorEditProfile("No profile image found.");
      return;
    }

    const oldProfileImage = user.profileImage || "";

    try {
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("oldProfileImage", oldProfileImage);

      const res = await axios.post(
        `${apiURL}/user/upload-profile-image`,
        formData
      );

      if (res.status === 200 || res.status === 201) {
        user.profileImage = res.data.url;
      } else {
        console.error("Error uploading profile image:", res);
        setErrorEditProfile("An error occurred. Please try again.");
        return;
      }
    } catch (error) {
      setErrorEditProfile("Failed to upload profile image. Please try again.");
      return;
    }
  };

  /**
   * handleChangePassword() -> void
   *
   * @description
   * Handles the change password form, setting the error and success states
   * to an empty string and calling the backend to change the password.
   *
   * @param e - Form Event
   * @returns void
   */
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorEditPassword("");
    setSuccessEditPassord("");

    // Validation
    if (!currentPassword) {
      setErrorEditPassword("Please provide your current password.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorEditPassword("Please provide a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorEditPassword("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorEditPassword("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorEditPassword(
        "New password cannot be the same as the current password."
      );
      return;
    }

    if (
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setErrorEditPassword(
        "Password must contain at least one number, one lowercase and one uppercase letter."
      );
      return;
    }

    try {
      // Send a request to the backend to change the password
      await axios.post(`${apiURL}/user/${id}/change-password`, {
        userId: id,
        currentPassword,
        newPassword,
      });
      setSuccessEditPassord("Password has been successfully updated.");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update password.";
      setErrorEditPassword(errorMessage);
    }
  };

  /**
   * handleUpdateEmailUsername() -> void
   *
   * @description
   * Handles the update email or username form, setting the error and success states
   * to an empty string and calling the backend to update the email or username.
   *
   * @param e - Form Event
   * @returns void
   */
  const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorEditEmail("");
    setSuccessEditEmail("");

    if (!user) {
      setErrorEditEmail("No user is signed in.");
      return;
    }

    if (!user.email) {
      setErrorEditEmail(
        "User does not have an email associated with their account."
      );
      return;
    }

    if (!currentPassword) {
      setErrorEditEmail("Please provide your current password.");
      return;
    }

    if (!newEmail) {
      setErrorEditEmail("Please provide a new email.");
      return;
    }

    try {
      // Send a request to the backend to change the email
      let res = await axios.post(`${apiURL}/user/${id}/change-email`, {
        currentPassword,
        newEmail,
      });

      setSuccessEditEmail(res.data.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update information.";
      setErrorEditEmail(errorMessage);
    }
  };

  /**
   * handleUpdateUsername() -> void
   *
   * @description
   * Handles the update username form, setting the error and success states
   * to an empty string and calling the backend to update the username.
   *
   * @param e - Form Event
   * @returns void
   */
  const handleUpdateUsername = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorEditUsername("");
    setSuccessEditUsername("");

    if (!user) {
      setErrorEditUsername("No user is signed in.");
      return;
    }

    if (!newUsername) {
      setErrorEditUsername("Please provide a new username.");
      return;
    }

    // Valid format for username
    if (newUsername.length < 3 || newUsername.length > 20) {
      setErrorEditUsername(
        "Username must be between 3 and 20 characters in length."
      );
      return;
    }

    if (!/^[a-zA-Z0-9_]*$/.test(newUsername)) {
      setErrorEditUsername(
        "Username must only contain letters, numbers, and underscores."
      );
      return;
    }

    try {
      // Send a request to the backend to change the email
      let res = await axios.post(`${apiURL}/user/${id}/change-username`, {
        newUsername,
      });

      setSuccessEditUsername(res.data.message);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to update information.";
      setErrorEditUsername(errorMessage);
    }
  };

  const handleDeleteAccount = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    setErrorDeleteAccount("");
    setSuccessDeleteAccount("");

    if (!email) {
      setErrorDeleteAccount("Please provide your email.");
      return;
    }

    if (!password) {
      setErrorDeleteAccount("Please provide your password.");
      return;
    }

    try {
      // Send a request to the backend to delete the account
      let res = await axios.delete(`${apiURL}/user/${id}`, {
        data: {
          email,
          password,
        },
      });

      setSuccessDeleteAccount(res.data.message);

      // Log the user out
      auth.logout();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete account.";
      setErrorDeleteAccount(errorMessage);
    }
  };

  // --------------------------------------
  // ------------- Functions --------------
  // --------------------------------------

  /**
   * getUserInfo() -> void
   *
   * @description
   * Fetches user data from the backend using the id provided in the route, this
   * will fetch { firstName, lastName, bio, profileImage, followers, followRequests }
   * from the backend and set the user accordingly.
   *
   * @param userId - The id of the user to fetch
   */
  function getUserInfo(userId: string) {
    axios
      .get(`${apiURL}/user/${userId}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
      });
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <div className='main-content'>
      {/******************** EDIT PROFILE  ********************/}
      <div className='profile-management-section'>
        <h2>Edit Profile</h2>

        <form onSubmit={handleEditProfile}>
          {/* TODO: Profile Image */}
          <div className='profile-image-section'>
            <div className='input-group'>
              {profileImagePreview ? (
                <Image
                  src={profileImagePreview}
                  width={200}
                  height={200}
                  alt='Profile Picture'
                  className='profile-edit-image'
                />
              ) : (
                <h1 className='profile-edit-image profile-initial'>
                  {user?.username[0].toUpperCase()}
                </h1>
              )}
            </div>

            <div>
              <label htmlFor='profile-image' className='profile-image-upload'>
                {profileImage ? "Change" : "Upload"} Profile Image
              </label>
              <input
                id='profile-image'
                type='file'
                accept='image/*'
                onChange={handleProfileImageChange}
              />
              {imageError && <p className='error-message'>{imageError}</p>}
            </div>
          </div>

          <div className='form-group'>
            {/* TODO: First Name */}
            <div className='input-group'>
              <label htmlFor='firstName'>First Name *</label>
              <input
                type='text'
                id='firstName'
                placeholder='First Name'
                value={user?.firstName ? user.firstName : ""}
                onChange={(e) =>
                  setUser(user ? { ...user, firstName: e.target.value } : null)
                }
              />
            </div>

            {/* TODO: Last Name */}
            <div className='input-group'>
              <label htmlFor='lastName'>Last Name *</label>
              <input
                type='text'
                id='lastName'
                placeholder='Last Name'
                value={user?.lastName ? user.lastName : ""}
                onChange={(e) =>
                  setUser(user ? { ...user, lastName: e.target.value } : null)
                }
              />
            </div>
          </div>

          {/* TODO: Bio */}
          <div className='input-group'>
            <label htmlFor='bio'>Bio</label>
            <textarea
              id='bio'
              placeholder='Tell us about yourself...'
              value={user?.bio ? user.bio : ""}
              onChange={(e) =>
                setUser(user ? { ...user, bio: e.target.value } : null)
              }
            />
          </div>

          {/* TODO: Phone */}
          <div className='input-group'>
            <label htmlFor='phone'>Phone</label>
            <input
              type='tel'
              id='phone'
              placeholder='(123) 321-1234'
              value={user?.phone ? user.phone : ""}
              onChange={(e) =>
                setUser(user ? { ...user, phone: e.target.value } : null)
              }
            />
          </div>

          {/* TODO: Date of Birth */}
          <div className='input-group'>
            <label htmlFor='dob'>Date of Birth</label>
            <input
              type='date'
              id='dob'
              value={user?.dateOfBirth ? user.dateOfBirth : ""}
              onChange={(e) =>
                setUser(user ? { ...user, dateOfBirth: e.target.value } : null)
              }
            />
          </div>

          {/* Privacy Setting */}
          <div className='input-group'>
            <label htmlFor='isPrivate'>Make Profile Private</label>
            <input
              type='checkbox'
              id='isPrivate'
              checked={user?.isPrivate || false}
              onChange={(e) =>
                setUser(user ? { ...user, isPrivate: e.target.checked } : null)
              }
            />
          </div>

          {errorEditProfile && (
            <p className='error-message'>{errorEditProfile}</p>
          )}

          {successEditProfile && (
            <p className='success-message'>{successEditProfile}</p>
          )}

          <button type='submit' className='save-button'>
            Save Changes
          </button>
        </form>
      </div>

      {/******************** EDIT CREDENTIALS  ********************/}
      <div className='profile-management-section'>
        <h2>Edit Credentials</h2>

        {/* TABS */}
        <div className='tabs'>
          <button
            className={
              "tab first-tab" + (activeTab === "password" ? " active-tab" : "")
            }
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
          <button
            className={"tab" + (activeTab === "email" ? " active-tab" : "")}
            onClick={() => setActiveTab("email")}
          >
            Change Email
          </button>
          <button
            className={
              "tab last-tab" + (activeTab === "username" ? " active-tab" : "")
            }
            onClick={() => setActiveTab("username")}
          >
            Change Username
          </button>
        </div>

        {/* PASSWORD */}
        {activeTab === "password" && (
          <div className='tab-content'>
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className='input-group'>
                <label htmlFor='currentPassword'>Current Password</label>
                <input
                  type='password'
                  id='currentPassword'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <div className='input-group'>
                  <label htmlFor='newPassword'>New Password</label>
                  <input
                    type='password'
                    id='newPassword'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className='input-group'>
                  <label htmlFor='confirmPassword'>Confirm New Password</label>
                  <input
                    type='password'
                    id='confirmPassword'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {errorEditPassword && (
                <p className='error-message'>{errorEditPassword}</p>
              )}
              {successEditPassord && (
                <p className='success-message'>{successEditPassord}</p>
              )}

              <button type='submit' className='save-button'>
                Change Password
              </button>
            </form>
          </div>
        )}

        {/* EMAIL */}

        {activeTab === "email" && (
          <div className='tab-content'>
            <h3>Change Email</h3>
            <form onSubmit={handleUpdateEmail}>
              <div className='input-group'>
                <label htmlFor='newEmail'>New Email</label>
                <input
                  type='email'
                  id='newEmail'
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className='input-group'>
                <label htmlFor='currentPassword'>Enter Password</label>
                <input
                  type='password'
                  id='currentPassword'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              {errorEditEmail && (
                <p className='error-message'>{errorEditEmail}</p>
              )}
              {successEditEmail && (
                <p className='success-message'>{successEditEmail}</p>
              )}

              <button type='submit' className='save-button'>
                Change Email
              </button>
            </form>
          </div>
        )}

        {/* USERNAME */}
        {activeTab === "username" && (
          <div className='tab-content'>
            <h3>Change Username</h3>
            <form onSubmit={handleUpdateUsername}>
              <div className='input-group'>
                <label htmlFor='newUsername'>New Username</label>
                <input
                  type='text'
                  id='newUsername'
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              {errorEditUsername && (
                <p className='error-message'>{errorEditUsername}</p>
              )}
              {successEditUsername && (
                <p className='success-message'>{successEditUsername}</p>
              )}

              <button type='submit' className='save-button'>
                Change Username
              </button>
            </form>
          </div>
        )}
      </div>

      {/******************** DELETE ACCOUNT  ********************/}
      <div className='profile-management-section'>
        <h2>Delete Account</h2>

        <div className='input-group'>
          <label htmlFor='email'>Enter Email</label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className='input-group'>
          <label htmlFor='password'>Enter Password</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <p>
          By pressing "Delete Account", I acknowledge the account will be
          deleted from this platform as well as all the content related. There
          is no recovery once an account is deleted.
        </p>

        {errorDeleteAccount && (
          <p className='error-message'>{errorDeleteAccount}</p>
        )}
        {successDeleteAccount && (
          <p className='success-message'>{successDeleteAccount}</p>
        )}

        <button onClick={handleDeleteAccount} className='save-button warning'>
          Delete Account
        </button>
      </div>
    </div>
  );
}

```

# frontend\src\app\profile\[id]\page.tsx

```tsx
"use client";

// React & NextJs (Import)
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

// Third-Party Libraries (Import)
import axios from "axios";
import {
  UserPlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// Local Files (Import)
import { useAuth } from "@/hooks/AuthProvider";
import { Content } from "@/models/Content";
import { User } from "@/models/User";
import { apiURL } from "@/app/scripts/api";

// Stylesheets
import "@/app/styles/profile/profile.scss";
import ContentTile from "@/components/content/ContentTile";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Profile page by Id, allowing users to view their profile.
 *
 * @returns JSX.Element
 */
export default function Page() {
  const { id } = useParams();
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequested, setFollowRequested] = useState(false);
  const [sharedContent, setSharedContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"created" | "shared">("created");
  const [followUsernames, setFollowUsernames] = useState<{
    [userId: string]: string;
  }>({}); // Cache for usernames

  const { userUID } = useAuth(); // Get logged in user's UID
  const router = useRouter();

  // ----------------------------------------
  // ------------ Event Handlers ------------
  // ----------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch User Data
        const userResponse = await axios.get(`${apiURL}/user/${id}`);
        const userData = userResponse.data;
        setUser(userData);

        // 2. Fetch User's Created Content
        if (userData?.content) {
          const contentPromises = userData.content.map((contentId: string) =>
            getContent(contentId)
          );
          await Promise.all(contentPromises);
        }

        // 3. Fetch Shared Content (only if sharedContent exists)
        if (userData?.sharedContent) {
          const validSharedContent = await getAndFilterSharedContent(
            userData.sharedContent
          );
          setSharedContent(validSharedContent);
        }

        // 4. Check follow status (only if viewing another user's profile)
        if (userUID && userUID !== id) {
          setIsFollowing(userData.followers?.includes(userUID));
          setFollowRequested(userData.followRequests?.includes(userUID));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, userUID]);

  // Fetch usernames for follow requests
  useEffect(() => {
    if (!user || !user.followRequests) return;

    const followRequests = user.followRequests;

    async function fetchUsernames() {
      const usernamesMap: { [key: string]: string } = {};
      for (const requesterId of followRequests) {
        try {
          const username = await getUsername(requesterId);
          usernamesMap[requesterId] = username;
        } catch (error) {
          usernamesMap[requesterId] = "Unknown User";
        }
      }
      setFollowUsernames(usernamesMap);
    }

    fetchUsernames();
  }, [user]);

  // Helper function to fetch and filter shared content
  async function getAndFilterSharedContent(
    contentIds: string[]
  ): Promise<Content[]> {
    const validContent: Content[] = [];

    for (const contentId of contentIds) {
      try {
        const response = await axios.get(`${apiURL}/content/${contentId}`);
        if (response.status === 200) {
          const fetchedContent = response.data;

          // Date conversion
          if (fetchedContent.dateCreated) {
            if (typeof fetchedContent.dateCreated === "string") {
              fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
            } else if (fetchedContent.dateCreated.seconds) {
              fetchedContent.dateCreated = new Date(
                fetchedContent.dateCreated.seconds * 1000
              );
            } else if (!(fetchedContent.dateCreated instanceof Date)) {
              fetchedContent.dateCreated = null;
            }
          }

          validContent.push(fetchedContent);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log(`Content ID ${contentId} not found, skipping.`);
        } else {
          console.error("Error fetching shared content:", error);
        }
      }
    }

    return validContent;
  }

  /**
   * getContent() -> void
   *
   * @description
   * Fetches the content from the backend using the content id provided, this
   * will fetch all information regarding the content, including but not limited
   * to{ creatorUID, title, content, thumbnail, dateCreated, readtime, likes,
   * peopleWhoLiked, bookmarkedBy } from the backend and set the content
   * accordingly.
   *
   * @param contentId - The id of the content to fetch
   */
  async function getContent(contentId: string) {
    try {
      const res = await axios.get(`${apiURL}/content/${contentId}`);
      const fetchedContent = res.data;

      if (fetchedContent.dateCreated && fetchedContent.dateCreated.seconds) {
        fetchedContent.dateCreated = new Date(
          fetchedContent.dateCreated.seconds * 1000
        );
      } else if (fetchedContent.dateCreated) {
        fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
      }

      fetchedContent.uid = contentId; // Ensure the ID is set
      setContents((prevContents) => {
        // Prevent duplicates
        if (!prevContents.some((c) => c.uid === fetchedContent.uid)) {
          return [...prevContents, fetchedContent];
        }
        return prevContents;
      });
    } catch (err) {
      console.error("Error in getContent:", err);
    }
  }

  /**
   * handleFollow() -> void
   *
   * @description
   * Handles the follow/unfollow actions for the user, setting the isFollowing
   * state to the opposite of the current state.
   *
   * @returns void
   */
  const handleFollow = async () => {
    if (!userUID) {
      alert("Please log in to follow users.");
      return;
    }

    if (userUID === id) {
      alert("You can't follow yourself.");
      return;
    }

    if (!user) {
      // Defensive check
      console.error("User data not available.");
      return;
    }

    try {
      let url = "";
      let method = "post";

      if (isFollowing) {
        // Unfollow
        url = `${apiURL}/user/${userUID}/unfollow/${id}`;
      } else if (user.isPrivate) {
        // Private profile: Send request, or cancel if already requested (optional)
        if (followRequested) {
          // cancel request (OPTIONAL: Handle Cancel Request (requires backend endpoint))
          // url = `${apiURL}/user/${userUID}/cancel-request/${id}`;
          // await axios.post(url); // UNCOMMENT WHEN ENDPOINT IS READY
          // setFollowRequested(false); // OPTIONAL: Update local state
          return; // for now
        } else {
          // Send Request
          url = `${apiURL}/user/${userUID}/request/${id}`;
        }
      } else {
        // Public profile: Follow directly
        url = `${apiURL}/user/${userUID}/follow/${id}`;
      }

      // Only make the API call if a URL is set
      if (url) {
        await axios.post(url);

        // Optimistically update the UI *immediately*
        if (isFollowing) {
          setIsFollowing(false); // Just unfollowed
        } else if (user.isPrivate && !followRequested) {
          setFollowRequested(true); // Just sent a request
        } else if (!user.isPrivate) {
          setIsFollowing(true); // Just followed directly
        }
        // Refetch data
        const userResponse = await axios.get(`${apiURL}/user/${id}`);
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error("Error handling follow/request:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleUnshare = async (contentId: string) => {
    if (!userUID) {
      console.error("User not logged in.");
      return;
    }

    try {
      // Make API call to unshare
      await axios.post(
        `${apiURL}/content/${contentId}/user/${userUID}/unshare`
      );

      // Update the UI: Filter out the unshared content
      setSharedContent((prevSharedContent) =>
        prevSharedContent.filter((content) => content.uid !== contentId)
      );
      // Refetch
      const userResponse = await axios.get(`${apiURL}/user/${id}`);
      setUser(userResponse.data);
    } catch (error) {
      console.error("Error unsharing content:", error);
    }
  };

  // Approve Follow Request
  const handleApproveRequest = async (requesterId: string) => {
    try {
      await axios.post(`${apiURL}/user/${id}/approve/${requesterId}`);

      //Update local state
      setUser((prevUser) => {
        if (!prevUser) return null;

        const updatedFollowRequests = prevUser.followRequests?.filter(
          (id) => id !== requesterId
        );
        const updatedFollowers = prevUser.followers
          ? [...prevUser.followers, requesterId]
          : [requesterId];

        return {
          ...prevUser,
          followRequests: updatedFollowRequests,
          followers: updatedFollowers,
        };
      });
      // Refetch user data to be 100% sure
      const userResponse = await axios.get(`${apiURL}/user/${id}`);
      setUser(userResponse.data);

      console.log("Follow request approved successfully.");
    } catch (error) {
      console.error("Error approving follow request:", error);
      alert("Failed to approve follow request. Please try again.");
    }
  };

  // Reject Follow Request
  const handleRejectRequest = async (requesterId: string) => {
    try {
      await axios.post(`${apiURL}/user/${id}/reject/${requesterId}`);

      // Update local state
      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedFollowRequests = prevUser.followRequests?.filter(
          (id) => id !== requesterId
        );

        return {
          ...prevUser,
          followRequests: updatedFollowRequests,
        };
      });
      // Refetch user data to be 100% sure
      const userResponse = await axios.get(`${apiURL}/user/${id}`);
      setUser(userResponse.data);

      console.log("Follow request rejected successfully.");
    } catch (error) {
      console.error("Error rejecting follow request:", error);
      alert("Failed to reject follow request. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------

  const followersCount = user?.followers ? user.followers.length : 0;
  const followingCount = user?.following ? user.following.length : 0;
  const createdCount = user?.content ? user.content.length : 0;
  const sharedCount = user?.sharedContent ? user.sharedContent.length : 0;
  const canViewFullProfile =
    !user?.isPrivate ||
    userUID === id ||
    (userUID && user?.followers?.includes(userUID));

  // Helper function to get username by ID (Simplified)
  async function getUsername(userId: string): Promise<string> {
    try {
      const userResponse = await axios.get(`${apiURL}/user/${userId}`);
      return userResponse.data.username || "Unknown User"; // Provide a fallback
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User"; // Fallback in case of error
    }
  }

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }
  return (
    <>
      <div className='main-content'>
        <div className='profile-banner'>
          <div className='profile-banner-image'>
            {user && user.profileImage ? (
              <Image
                src={user.profileImage}
                width={200}
                height={200}
                alt='Profile Picture'
                className='profile-banner-image'
              />
            ) : (
              <h1 className='profile-initial'>
                {user?.username[0].toUpperCase()}
              </h1>
            )}
          </div>

          <div className='profile-banner-info'>
            <div className='username-follow'>
              <h1 className='username'>{user?.username}</h1>
              {/* Follow/Request Button (Conditional Rendering) */}
              {userUID !== id && ( // Don't show button if viewing own profile
                <button
                  className={`icon-button follow ${
                    isFollowing ? "following" : ""
                  }`}
                  onClick={handleFollow}
                  title={
                    isFollowing
                      ? "Unfollow User"
                      : followRequested
                      ? "Request Sent"
                      : user?.isPrivate
                      ? "Request to Follow"
                      : "Follow User"
                  }
                >
                  <UserPlusIcon
                    className={`icon follow ${
                      isFollowing || followRequested ? "following" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {canViewFullProfile ? (
              <>
                {/* Stats */}
                <div className='profile-stats'>
                  <div className='stat-item'>
                    <span className='stat-number'>{followersCount}</span>
                    <span className='stat-label'>Followers</span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-number'>{followingCount}</span>
                    <span className='stat-label'>Following</span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-number'>{createdCount}</span>
                    <span className='stat-label'>Created</span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-number'>{sharedCount}</span>
                    <span className='stat-label'>Shared</span>
                  </div>
                </div>
              </>
            ) : (
              <p>This account is private.</p>
            )}

            <p>
              {user?.firstName} {user?.lastName}
            </p>
            <p>{user?.bio}</p>
          </div>
        </div>

        {/* Follow Requests Section (Conditional Rendering) */}
        {userUID === id &&
          user?.followRequests &&
          user.followRequests.length > 0 && (
            <div className='follow-requests-section'>
              <h3>Follow Requests</h3>
              <ul>
                {user.followRequests.map((requesterId) => (
                  <li key={requesterId}>
                    <span>{followUsernames[requesterId] || "Loading..."}</span>
                    <div className='request-buttons'>
                      <button
                        className='icon-button approve'
                        onClick={() => handleApproveRequest(requesterId)}
                        title='Approve Request'
                      >
                        <CheckIcon className='icon check' />
                      </button>
                      <button
                        className='icon-button reject'
                        onClick={() => handleRejectRequest(requesterId)}
                        title='Reject Request'
                      >
                        <XMarkIcon className='icon xmark' />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Tabs for Created/Shared Content */}
        <div className='tabs'>
          <button
            onClick={() => setTab("created")}
            className={tab === "created" ? "tab-active" : "tab-inactive"}
          >
            Created
          </button>
          <button
            onClick={() => setTab("shared")}
            className={tab === "shared" ? "tab-active" : "tab-inactive"}
          >
            Shared
          </button>
        </div>

        {/* Conditionally Render the Created vs Shared Section */}
        {tab === "created" && (
          <>
            <h2 className='section-title'>
              {contents.length === 1 ? "Content" : "Contents"}
            </h2>
            {contents.length === 0 ? (
              <h3>No content found</h3>
            ) : (
              <div className='content-list'>
                {contents.map((content, index) => (
                  <ContentTile
                    key={content.uid || index}
                    content={content}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "shared" && (
          <>
            <h3 className='section-title'>Shared Content</h3>
            {canViewFullProfile ? (
              sharedContent.length === 0 ? (
                <h4>No shared content found</h4>
              ) : (
                <div className='content-list'>
                  {sharedContent.map((content, index) => (
                    <ContentTile
                      key={content.uid || index}
                      content={content}
                      index={index}
                      deleteShareOption={
                        sharedContent.some(
                          (sharedItem) => sharedItem.uid === content.uid
                        ) && userUID === id
                      }
                      handleUnshare={handleUnshare}
                    />
                  ))}
                </div>
              )
            ) : (
              <p>This account is private.</p>
            )}
          </>
        )}
      </div>
    </>
  );
}

```

# frontend\src\app\scripts\api.ts

```ts
export const apiURL = "https://comp313-402-team3-w25-production.up.railway.app";
// export const apiURL = "http://localhost:3000";

export const apiAIURL = "http://localhost:8000";

```

# frontend\src\app\search\page.tsx

```tsx
"use client";

import SearchList from "@/components/search/searchList";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Create Content page, allowing users to create content.
 *
 * @returns JSX.Element
 */
export default function Page() {
  return (
    <>
      <div className='main-content'>
        <SearchList />
      </div>
    </>
  );
}

```

# frontend\src\app\styles\authentication\authentication.scss

```scss
@use "@/app/styles/colors.scss";

.authentication body,
.authentication html {
  height: 100vh;
  margin: 0;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
}

.authentication p {
  user-select: none;
  cursor: default;
}

.authentication a {
  cursor: pointer;
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
}

.auth-box {
  background-color: var(--tile-color);
  box-shadow: 0 0px 25px var(--shadow-color),
    inset 0 0px 25px var(--shadow-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  padding: 50px 25px;
  border-radius: 25px;

  max-width: 700px;
  width: 90vw;

  text-align: center;

  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: relative;
  z-index: 1;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 30px;
}

.auth-title {
  margin: 25px 0 50px;
  font-weight: 100;
}

.auth-input {
  width: 100%;

  margin: 0.5rem auto;
  padding: 0.8rem;
  box-sizing: border-box;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;

  background-color: var(--input-field-color);
  color: var(--text-color);
}

.auth-error {
  color: red;
  font-size: 0.8rem;
  margin: 0.2rem 0;
  text-align: left;
}

.auth-message {
  color: var(--text-color);
  font-size: 0.9rem;
  margin: 1rem 0;
  text-align: center;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
}

.auth-success {
  color: #2e7d32;
  font-size: 0.95rem;
  font-weight: 500;
  margin: 1rem 0;
  text-align: center;
  padding: 12px;
  background-color: rgba(46, 125, 50, 0.1);
  border-radius: 5px;
  border-left: 4px solid #2e7d32;
}

.auth-error-container {
  text-align: center;
  width: 100%;
}

.auth-button {
  width: 100%;

  margin: 1rem auto;
  padding: 15px;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  background-color: var(--background-color);
  color: var(--text-color);

  font-size: 1.1rem;
}

.auth-button:hover {
  background-color: var(--input-border-color);
  color: var(--background-color);

  cursor: pointer;
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-oauth-button {
  margin-top: 0;
  padding: 10px;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  background-color: var(--background-color);
  color: var(--text-color);

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.1rem;
}

.auth-oauth-button .logo {
  height: 20px;
  width: 20px;
  margin-right: 10px;
}

.auth-oauth-section {
  width: 100%;
  display: flex;
  border-top: 1px solid var(--input-border-color);
  padding-top: 1rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 25px;
  color: var(--text-color);
  fill: var(--text-color);
}

// Phone View
@media screen and (max-width: 767px) {
  .auth-box {
    width: 80vw;
  }
}

// Tablet View
@media screen and (min-width: 768px) and (max-width: 1023px) {
  .auth-box {
    width: 60vw;
  }
}

// Desktop View
@media screen and (min-width: 1024px) {
  .auth-box {
    width: 50vw;
    max-width: 550px;
  }
}

```

# frontend\src\app\styles\background.scss

```scss
// Import colors.scss to use the variables
@use "./colors.scss";

.left-bottom-rectangle {
  background-color: var(--left-bottom-rectangle);
  opacity: 0.8;

  height: 90vh;
  width: 10vw;
  position: fixed;
  bottom: -5vh;
  left: -2vw;

  z-index: -1;

  filter: blur(100px);
}

.left-top-rectangle {
  background-color: var(--left-top-rectangle);
  opacity: 0.5;

  height: 50vh;
  width: 20vw;
  position: fixed;
  top: -10vh;
  left: 10vw;

  z-index: -1;

  filter: blur(100px);
}

.middle-bottom-circle {
  background-color: var(--middle-bottom-circle);
  opacity: 0.7;

  border-radius: 50%;

  height: 40vw;
  width: 40vw;
  position: fixed;
  bottom: 0vh;
  left: 40vw;

  z-index: -1;

  filter: blur(100px);
}

.right-top-circle {
  background-color: var(--right-top-circle);
  opacity: 0.9;

  border-radius: 50%;

  height: 90vw;
  width: 90vw;
  position: fixed;
  top: -40vw;
  right: -40vw;

  z-index: -1;

  filter: blur(100px);
}

.background-shapes {
  z-index: -1;

  position: fixed;
  width: 100vw;
  height: 100vh;
}

.smooth-filter {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
}

```

# frontend\src\app\styles\colors.scss

```scss
// LIGHT MODE
:root {
  --background-color: #d9d9d9;
  --text-color: #2a2a2a;
  --text-color-light: #505050;

  --tile-color: rgba(176, 176, 176, 0.5);
  --input-field-color: rgba(255, 255, 255, 0.25);
  --input-border-color: rgba(0, 0, 0, 0.25);
  --comment-background-color: rgb(218, 212, 210);
  --comment-text-color: rgb(255, 255, 255);
  --icon-color: #2a2a2a;
  --icon-hover-color: rgb(70, 70, 70);
  --icon-selected-color: rgba(120, 120, 120, 0.5);
  --delete-hover-color: #ff5656;
  --like-hover-color: #fa4d8a;
  --edit-hover-color: #ff8500;
  --add-hover-color: #2d559f;
  --share-hover-color: rgb(37, 80, 251);
  --cancel-hover-color: #ff5656;

  // Background color
  --left-bottom-rectangle: #7e5c47;
  --left-top-rectangle: #765846;
  --middle-bottom-circle: #837977;
  --right-top-circle: #948a88;

  // Shadow color
  --shadow-color: rgba(255, 255, 255, 0.25);
}

// DARK MODE
[data-theme="dark"] {
  --background-color: #2a2a2a;
  --text-color: #ffffff;
  --text-color-light: #cdcdcd;

  --tile-color: rgba(67, 63, 63, 0.8);
  --input-field-color: rgba(0, 0, 0, 0.25);
  --input-border-color: rgba(255, 255, 255, 0.25);
  --comment-background-color: rgb(41, 41, 41);
  --comment-text-color: rgba(0, 0, 0, 0.25);
  --icon-color: #ffffff;
  --icon-hover-color: rgb(200, 200, 200);
  --icon-selected-color: rgba(129, 129, 129, 0.8);
  --delete-hover-color: #d66363;
  --like-hover-color: #fa4d8a;
  --edit-hover-color: #d69d63;
  --add-hover-color: #8e9cff;
  --share-hover-color: rgb(37, 80, 251);
  --cancel-hover-color: #ff5656;

  // Background color
  --left-bottom-rectangle: #7e5c47;
  --left-top-rectangle: #765846;
  --middle-bottom-circle: #726967;
  --right-top-circle: #6b615f;

  --shadow-color: rgba(13, 13, 13, 0.25);
}

```

# frontend\src\app\styles\content\contentTile.scss

```scss
@use "../colors.scss";
@use "../global.scss";

.content-tile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 10px;
}

.unshare {
  margin-top: 5px;
}

.content-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 50px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  width: 20px;
  height: 20px;
  color: var(--icon-color);
}

.stat-number {
  margin: 0;
}

.content-list-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 20px;

  border-radius: 20px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  @include global.glassmorphic-background;
  color: var(--text-color);

  font-size: 1.1rem;

  height: 500px;
  min-width: 300px;
  max-width: 700px;
}

.content-item-title {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 10px;
}

.content-list-item:hover {
  background-color: var(--background-color);
  cursor: pointer;
}

.content-thumbnail-container {
  overflow: hidden;
  border-radius: 10px;
}

.content-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.5s;
}

.content-thumbnail:hover {
  transform: scale(1.1);
}

.icon-button {
  padding: 0;
  border: none;
  background: none;
  display: inline-flex;
  align-items: center;
  position: relative;
  gap: 1px;
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--icon-color);
  transition: all ease-out 0.3s;
}

.icon:hover {
  color: var(--icon-hover-color);
  cursor: pointer;
}

.icon.delete:hover {
  color: var(--delete-hover-color);
}

.content-item-date {
  font-size: 0.8rem;
  margin: 0;
}

.content-tile-info {
  margin-bottom: 20px;
}

```

# frontend\src\app\styles\content\createContent.scss

```scss
@use "@/app/styles/colors.scss";

.create-content-form {
  display: flex;
  flex-direction: column;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-button {
  width: 49%;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 20px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;
  background-color: var(--background-color);
  color: var(--text-color);
  font-size: 1.1rem;
}

.left-button {
  background-color: var(--input-background-color);
}

.content-button:hover {
  background-color: var(--input-border-color);
  color: var(--background-color);

  cursor: pointer;
}

.content-input {
  width: 100%;

  padding: 0.8rem;
  box-sizing: border-box;

  font-size: large;
  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;

  background-color: var(--input-field-color);
  color: var(--text-color);
}

.text-editor {
  border-radius: 0 0 10px 10px;
}

.clear-button {
  cursor: pointer;
  user-select: none;
  display: inline-block;
  margin: 5px 5px 20px auto;
}

.create-content-form input[type="file"] {
  display: none;
}

.content-file-upload {
  display: inline-block;
  width: 30%;

  margin-right: 20px;
  padding: 1rem;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  background-color: var(--background-color);
  color: var(--text-color);

  font-size: 1.1rem;
  cursor: pointer;
}

.content-file-upload:hover {
  background-color: var(--input-border-color);
  color: var(--background-color);

  cursor: pointer;
}

.thumbnail-preview {
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: -1rem;
}

.summary-container {
  border: 1px solid #ddd;
  padding: 20px;
  margin: 20px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}

.summary-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  text-align: justify;
}

.summary-content p {
  margin: 10px 0;
}

```

# frontend\src\app\styles\content\toolbar.scss

```scss
.toolbar select {
  width: 200px;
  padding: 5px;
  box-sizing: border-box;
  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  background-color: var(--input-field-color);
  color: var(--text-color);
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
  background-color: var(--tile-color);
  border-radius: 10px 10px 0 0;
  padding: 5px;
  border: solid 1px var(--input-border-color);
}

.toolbar-button {
  padding: 5px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  border-radius: 10px 10px 0 0;
  box-sizing: border-box;
  background-color: var(--background-color);
  color: var(--text-color);
}

.small-button {
  width: 40px;
}

.toolbar-button:hover {
  background-color: var(--background-color);
  color: var(--text-color);
  cursor: pointer;
}

.toolbar-button:disabled {
  background-color: var(--input-background-color);
  color: var(--background-color);
  cursor: not-allowed;
}

.toolbar-button.active {
  background-color: var(--input-border-color);
  font-weight: bold;
}

.markdown-preview {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;

  .preview-content {
    font-family: "Arial", sans-serif;
    line-height: 1.6;
    color: #333;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 16px 0;
      font-weight: bold;
    }

    p {
      margin: 12px 0;
    }

    ul,
    ol {
      margin: 12px 0;
      padding-left: 20px;
    }

    code {
      background-color: #f4f4f4;
      border-radius: 4px;
      padding: 2px 6px;
      font-family: "Courier New", Courier, monospace;
    }

    pre {
      background-color: #f4f4f4;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
    }
  }
}

```

# frontend\src\app\styles\content\viewContent.scss

```scss
@use "@/app/styles/global.scss";

.content-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.content-interactions {
  display: flex;
  gap: 5px;
}

.content-interactions .icon {
  width: 25px;
  height: 25px;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}

.profile-image-creator {
  border-radius: 50%;
  object-fit: cover;

  cursor: pointer;
}

.row {
  display: flex;
  gap: 20px;
}

.spliter {
  height: 150px;
  width: 1px;
  background-color: var(--input-border-color);
}

.col-1 {
  width: 30%;
}

.col-2 {
  width: 70%;
}

/* Icon styles */
.icon {
  width: 16px;
  height: 16px;
  color: var(--text-color);
  transition: all ease-out 0.3s;
}

.icon.cancel {
  width: 25px;
  height: 25px;
}

.icon:hover {
  color: var(--icon-hover-color);
}

.icon.delete:hover {
  color: var(--delete-hover-color);
}

.icon.cancel:hover {
  color: var(--cancel-hover-color);
}

.icon.counter {
  font-size: 12px;
  margin-top: 0;
  width: fit-content;
  display: inline;
}

.thumbnail {
  width: 100%;
  height: 300px;
  border-radius: 10px;
  object-fit: cover;
  background-color: var(--tile-color);
}

.icon-container {
  display: inline-flex;
  justify-content: center;
  gap: 5px;
}

.icon-button {
  padding: 0;
  border: none;
  background: none;
  display: inline-flex;
  align-items: center;
  position: relative;
  gap: 1px;
  cursor: pointer;
}

.creator-follow-section {
  position: relative;
}

.follow-button {
  position: absolute;
  bottom: -5px;
  left: 40px;

  padding: 5px 10px;
  border-radius: 10px;

  background-color: var(--tile-color);
  color: var(--text-color);
  border: 1px solid var(--input-border-color);

  cursor: pointer;
}

.follow-button:hover {
  background-color: var(--input-border-color);
  color: var(--background-color);
}

// COMMENT SECTION
.add-button {
  color: var(--text-color);
  transition: all ease-out 0.3s;
  width: 30px;
  position: absolute;
  left: 20;
}

.add-button:hover {
  transition: all ease-out 0.1s;
  color: var(--icon-hover-color);
  cursor: pointer;
}

.content-info > p,
.stats-col-2 > p {
  padding-top: 0;
  margin-top: 0;
}

.stats-col-2 {
  display: flex;
  justify-content: flex-start;
  flex-direction: column-reverse;
  text-align: right;
  gap: 0.3rem;
}

.comment-textarea {
  @include global.glassmorphic-background;
  border-radius: 10px;
  resize: none;
  overflow: hidden;
  size: 12px;
  padding: 5px 10px;
  color: var(--text-color);
  min-height: 20px;
  max-height: 6em;
  width: calc(100% - 20px);
}

.comment-icons-edit {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.close-button {
  margin-left: auto;
  margin-bottom: 0;
}

.popup-title {
  margin-top: 0;
}

.submit-button {
  background-color: var(--tile-color);
  margin-left: auto;
  margin-top: 20px;
  padding: 5px 10px;
  color: var(--text-color);
}

.edit-comment {
  @include global.glassmorphic-background;
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid gray;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 80%;
  max-width: 500px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); // Semi-transparent background
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 999; // Ensure it appears below the popup but above other content
}

.create-comment {
  width: 100%;
  display: grid;
  gap: 10px;
  grid-template-columns: 5fr 1fr;
  margin-bottom: 20px;
}

.comment {
  @include global.glassmorphic-background;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
}

.comment-info-container {
  display: flex;
  justify-content: space-between;
}

.comment-username {
  font-weight: bolder;
  margin: 0px;
  display: inline-block;
}

// media queries
@media screen and (max-width: 768px) {
  .row {
    flex-direction: column;
  }

  .col-1 {
    width: 100%;
  }

  .col-2 {
    width: 100%;
  }
}

```

# frontend\src\app\styles\feed.scss

```scss
@use "colors.scss";
@use "global.scss";

.content-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
}

.content-list-horizontal {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  gap: 1rem;

  width: 100%;
  overflow-y: scroll;
}

.feed-section-title {
  margin-bottom: 1rem;
}

.summarizz-logo-container {
  text-align: center;
}

// media queries
@media screen and (max-width: 2824px) {
  .content-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 2324px) {
  .content-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 1824px) {
  .content-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 1224px) {
  .content-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 908px) {
  .content-list {
    grid-template-columns: repeat(1, 1fr);
  }
}

.ad-tile {
  padding: 20px;

  border-radius: 20px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  @include global.glassmorphic-background;
  background-color: var(--input-border-color);
  color: var(--text-color);

  font-size: 1.1rem;

  height: 500px;
  min-width: 300px;
  max-width: 700px;
}

```

# frontend\src\app\styles\footer.scss

```scss
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  box-sizing: border-box;
  margin: 20px 0px;
}

.website-links {
  width: 85vw;
  display: grid;
  grid-template-columns: 1fr 4fr;
  margin: 20px 0;
  gap: 20px;
}

.website-links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.website-links-list h4 {
  display: inline-block;
  margin: 10px 0;
}

.footer-logo {
  width: 50px;
  height: 50px;
  margin: 20 0 5 0;
}

@media screen and (max-width: 768px) {
  .website-links {
    grid-template-columns: 1fr;
  }
}

```

# frontend\src\app\styles\global.scss

```scss
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=Inter:wght@400&family=Work+Sans:wght@400&display=swap");

// Mixins for reusable styles
@mixin glassmorphic-background {
  background-color: var(--tile-color);
  box-shadow: 0 0px 25px var(--shadow-color),
    inset 0 0px 25px var(--shadow-color);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

@font-face {
  font-family: "Blanka";
  src: url(../fonts/Blanka-Regular.otf) format("opentype"),
    url("../fonts/Blanka-Regular.woff2") format("woff2"),
    url("../fonts/Blanka-Regular.woff") format("woff");
}

:root {
  --font-headings: "IBM Plex Mono", monospace;
  --font-body: "Work Sans", sans-serif;
  --font-interactive: "Inter", sans-serif;
}

html {
  background-color: var(--background-color);
}

body {
  margin: 0 auto;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
}

h1 {
  font-family: var(--font-headings);
  font-weight: 900;
  font-size: 2.5rem;
}

h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-headings);
  margin: 40px 0 0px;
  padding: 0;
  font-weight: 700;
  font-style: normal;
}

%base-font {
  font-weight: 200;
  font-style: normal;
}

p,
label,
input,
textarea,
ul,
ol,
a {
  font-family: var(--font-body);
  font-size: small;
  @extend %base-font;
}

a,
button,
label {
  font-family: var(--font-interactive);
  text-decoration: none;
  @extend %base-font;
}

button {
  font-weight: 400;
}

a {
  color: var(--text-color);
  cursor: pointer;
}

a:hover {
  color: var(--icon-hover-color);
  font-weight: 500;
}

%block-style {
  display: block;
  width: 90%;
  font-size: small;
  padding: 1rem;
  margin: 1rem auto;
  border-radius: 10px;
}

code {
  @extend %block-style;
  font-family: var(--font-headings);
  background-color: var(--background-color);
  overflow-x: auto;
}

blockquote {
  @extend %block-style;
  font-family: var(--font-body);
  font-style: italic;
  background-color: var(--tile-color);
  border-left: 5px solid var(--input-border-color);
  border-radius: 5px;
}

.input-group {
  text-align: left;
  margin: 10px 0;
}

input[type="checkbox"] {
  width: auto;
  margin: 0 0.5rem 0 1rem;
  cursor: pointer;
}

input,
textarea {
  width: 100%;

  margin: 0.5rem auto;
  padding: 0.8rem;
  box-sizing: border-box;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;

  background-color: var(--input-field-color);
  color: var(--text-color);
}

textarea {
  resize: vertical;
  min-height: 50px;
  max-height: 200px;
}

.save-button {
  width: 100%;

  margin: 1rem auto;
  padding: 15px;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  background-color: var(--background-color);
  color: var(--text-color);
}

.save-button:hover {
  background-color: var(--input-border-color);
  color: var(--background-color);

  cursor: pointer;
}

.summarizz-logo {
  font-family: "Blanka";
  user-select: none;
  color: var(--text-color);
}

.main-content {
  width: 85vw;
  margin: 0 auto;
  padding-top: 120px;
  flex: 1;
}

.error-message {
  color: red;
  margin: 2rem auto 0;
}

.content-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem; /* Adjust the gap between items */
}


```

# frontend\src\app\styles\manage-subscription.scss

```scss
.manage-subscription-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: calc(100vh - 200px);
  background-color: #f8f9fa;
}

.subscription-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
    text-align: center;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
}

.subscription-details {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }
  }
  
  .detail-label {
    font-weight: 600;
    color: #555;
  }
  
  .detail-value {
    color: #333;
  }
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.subscribe-button, .cancel-button, .back-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  margin-bottom: 1rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.subscribe-button {
  background-color: #4caf50;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #43a047;
  }
}

.cancel-button {
  background-color: white;
  color: #f44336;
  border: 1px solid #f44336;
  
  &:hover:not(:disabled) {
    background-color: #ffebee;
  }
}

.back-button {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #e0e0e0;
  }
}

.subscription-info {
  margin: 1.5rem 0;
  font-size: 0.9rem;
  color: #777;
  
  p {
    margin-bottom: 0.5rem;
  }
}

```

# frontend\src\app\styles\navbar.scss

```scss
@use "colors.scss";
@use "global.scss";

@mixin absolute-positioned {
  position: absolute;
  right: 30px;
  top: 30px;
}

:root {
  --profile-size: 50px;
  --navbar-height: 80px;
  --navbar-margin: 10px 5vw;
}

.navbar {
  display: flex;

  &-background {
    @include global.glassmorphic-background;
    border-radius: 25px;
    height: var(--navbar-height);
    width: 90vw;
    position: fixed;
    top: 0;
    left: 0;
    margin: var(--navbar-margin);
    z-index: 2;
    display: flex;
  }

  &-auth {
    display: grid;
    grid-template-columns: repeat(2, auto);
    @include absolute-positioned;
    gap: 10px;
  }

  &-link {
    color: var(--text-color);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 400;
    cursor: pointer;
  }

  &-title {
    font-size: 20px;
    margin: 24px 30px 25px 30px;
    display: inline-block;
    cursor: pointer;
  }

  &-menu {
    display: inline-block;
    position: absolute;
    right: 90px;
    top: 30px;

    &-item {
      display: inline-block;
      margin: 0 5px;
      cursor: pointer;
    }
  }

  &-button {
    margin-top: 22px;
    padding: 8px;
    right: 80px;
    position: absolute;
    border: 1px solid var(--input-border-color);
    border-radius: 10px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: 400;

    &:hover {
      background-color: var(--input-border-color);
      color: var(--background-color);
    }
  }
}
.profile {
  &-picture {
    &-container {
      width: var(--profile-size);
      height: var(--profile-size);
      border-radius: 50%;
      margin: 15px 20px;
      display: flex;
      background-color: var(--background-color);
      cursor: pointer;
      justify-content: center;
      align-items: center;
    }

    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.no-profile-picture-container {
  width: var(--profile-size);
  height: var(--profile-size);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--background-color);
}

.-no-profile-picture {
  font-size: 20px;
  color: var(--text-color);
  margin: 0;
  user-select: none;
  padding: 0;
}

.menu {
  @include global.glassmorphic-background;
  border-radius: 25px;
  position: fixed;
  top: 90px;
  right: 0;
  padding: 10px 30px;
  margin: var(--navbar-margin);
  z-index: 2;
  min-width: 150px;

  &-item {
    display: block;
    margin: 10px 0;
    font-size: 1rem;
    text-align: center;
    cursor: pointer;
    font-weight: 400;
  }
}

.theme-toggle {
  @mixin toggle-base {
    display: inline-block;
    width: 25px;
    height: 15px;
    position: absolute;
  }

  @mixin slider-base {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: 0.4s;
    border-radius: 17px;
    background-color: var(--background-color);
  }

  @mixin slider-before {
    position: absolute;
    content: "";
    height: 10px;
    width: 10px;
    left: 2.5px;
    bottom: 2.5px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  &,
  &-auth {
    @include toggle-base;
    right: 15px;
    bottom: 10px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }

  &-auth {
    right: 0;
    top: 2px;
  }

  .slider,
  .slider-auth {
    @include slider-base;

    &:before {
      @include slider-before;
    }
  }

  input:checked + .slider:before,
  input:checked + .slider-auth:before {
    transform: translateX(10px);
  }
}

.padding-right {
  padding-right: 15px;
}

.searchBarContainer {
  display: flex;
  flex-direction: row;
  margin-inline: auto;
  align-items: center;
  align-self: center;
  height: 3rem;
  position: relative;
}

.searchBar {
  max-height: 1rem;
  background: var(--tile-color);
  color: var(--text-color);
  border: none;
  border-top-left-radius: 5px;
  padding: 1rem;
  margin-right: 0;
  width: 250px;
}

.searchButton {
  height: 100%;
  background-color: var(--tile-color);
  border: none;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
}

.searchButton > * {
  width: 1.5rem;
  color: var(--text-color);
}

.nav-searchResults {
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  z-index: 2;
}

.navbar-page-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1;
}

```

# frontend\src\app\styles\pro.scss

```scss
// Pro feature page styles
// Using project CSS variables

.pro-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: var(--text-color);
}

.pro-hero {
  text-align: center;
  padding: 3rem 1rem;
  margin-top: 5rem;
  margin-bottom: 3rem;
  background: linear-gradient(
    135deg,
    var(--background-color) 0%,
    var(--middle-bottom-circle) 100%
  );
  border-radius: 10px;
  color: white;

  .pro-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
}

.pro-cta-button {
  background-color: var(--background-color);
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.2rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &.manage-button {
    background-color: white;
    color: var(--background-color);
    border: 2px solid var(--background-color);
    
    &:hover {
      background-color: rgba(var(--background-color-rgb), 0.05);
    }
  }
}

.pro-features {
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: var(--tile-color);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    width: 50px;
    height: 50px;
    background-color: var(--input-field-color);
    color: var(--text-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }

  p {
    color: var(--text-color);
    line-height: 1.6;
  }
}

.pro-section-header {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.pro-pricing {
  margin-bottom: 4rem;
  text-align: center;
}

.pricing-card {
  max-width: 400px;
  margin: 0 auto;
  background-color: var(--tile-color);
  border-radius: 10px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--input-field-color);

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .price {
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 1.5rem;
    font-family: sans-serif;

    span {
      font-size: 1.2rem;
      font-weight: 400;
      opacity: 0.8;
    }
  }
}

.pricing-features {
  list-style-type: none;
  padding: 0;
  margin-bottom: 2rem;

  li {
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--input-field-color);

    &:last-child {
      border-bottom: none;
    }
  }
}

.pricing-button {
  background-color: var(--background-color);
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    background-color: var(--left-top-rectangle);
  }
}

.pro-testimonials {
  margin-bottom: 4rem;

  h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
  }
}

.testimonials-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background-color: var(--tile-color);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;

  &::before {
    content: '"';
    position: absolute;
    top: 10px;
    left: 15px;
    font-size: 4rem;
    color: var(--text-color);
    opacity: 0.7;
    font-family: serif;
    opacity: 50%;
  }

  p {
    font-style: italic;
    line-height: 1.6;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }

  .testimonial-author {
    font-weight: 600;
    color: var(--text-color);
    opacity: 50%;
  }
}

.pro-cta {
  text-align: center;
  padding: 3rem;
  background-color: var(--tile-color);
  border-radius: 10px;
  margin-bottom: 2rem;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .pro-hero h1 {
    font-size: 2.5rem;
  }

  .pro-hero .pro-subtitle {
    font-size: 1.2rem;
  }

  .features-grid,
  .testimonials-container {
    grid-template-columns: 1fr;
  }

  .pricing-card {
    max-width: 100%;
  }
}

```

# frontend\src\app\styles\profile\profile.scss

```scss
.profile-banner {
  display: flex;
  gap: 1rem;
}

.profile-banner-image {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  background-color: var(--tile-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-initial {
  font-size: 100px;
  color: var(--text-color);
  margin: 0;
  user-select: none;
}

.profile-banner-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  p {
    margin: 0;
    margin-bottom: 0.5rem; /* small gap between paragraphs */
  }
}

/* Username and follow button container */
.username-follow {
  display: inline-flex; /* Align username and icon horizontally */
  align-items: center;
  gap: 5px; /* Space between username and icon */
}

/* Follow button styles */
.icon-button.follow {
  padding: 0;
  border: none;
  background: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer; /* Ensure pointer cursor */
}

/* Follow icon styles */
.icon.follow {
  width: 16px; 
  height: 16px; 
  color: var(--icon-color); 
}

.icon.follow.following {
  color: var(--icon-selected-color); 
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: 0.7rem; 
  margin-bottom: 1.25rem; 
  font-family: var(--font-body);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center number and label horizontally */
  font-size: 0.7rem; /* Smaller font size for stats */
}

.stat-number {
  font-size: 0.9rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-color-light); 
}

.section-title {
  font-size: 2rem;
  margin-top: 2rem;
  margin-bottom: 10px;
}

.content-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem; /* Adjust the gap between items */
}

/* Tabs container */
.tabs {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem; /* spacing between tabs and content */

  /* Center tabs horizontally */
  justify-content: center;
}

/* Base tab button styles */
.tab-active,
.tab-inactive {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;

  /* Transparent background so it blends with the page */
  background-color: transparent;
  color: var(--text-color);

  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 1rem;
}

/* Active tab styling */
.tab-active {
  font-weight: bold;
  text-decoration: underline;
  color: var(--text-color);
}

/* Inactive tab styling */
.tab-inactive:hover {
  color: var(--icon-hover-color);
}

// media queries
@media screen and (max-width: 1024px) {
  .content-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .content-list {
    grid-template-columns: repeat(1, 1fr);
  }

  .profile-banner {
    flex-direction: column;
  }

  .profile-banner-info {
    margin-left: 0;
  }
}

```

# frontend\src\app\styles\profile\ProfileManagement.scss

```scss
/* Profile Management Page Styles */

// Mixins for reusable styles
@mixin glassmorphic-background {
  background-color: var(--tile-color);
  box-shadow: 0 0px 25px var(--shadow-color),
    inset 0 0px 25px var(--shadow-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.profile-management-section {
  @include glassmorphic-background;
  padding: 20px 40px;
  border-radius: 25px;
  margin-bottom: 30px;
}

.form-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 10px 0;
}

.form-group .input-group {
  margin: 0;
}

.input-group {
  text-align: left;
  margin: 10px 0;
}

input[type="checkbox"] {
  width: auto;
  margin: 0 0.5rem 0 1rem;
  cursor: pointer;
}

input,
textarea {
  width: 100%;

  margin: 0.5rem auto;
  padding: 0.8rem;
  box-sizing: border-box;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;

  background-color: var(--input-field-color);
  color: var(--text-color);
}

textarea {
  resize: vertical;
  min-height: 50px;
  max-height: 200px;
}

.profile-image-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.profile-edit-image {
  display: inline-block;

  padding: 0.8rem;
  box-sizing: border-box;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;

  background-color: var(--input-field-color);
  color: var(--text-color);
}

.profile-initial {
  width: 200px;
  height: 200px;

  font-size: 100px;
  color: var(--text-color);
  margin: 0;
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image-upload {
  display: inline-block;
  width: 200px;

  margin-bottom: 20px;
  padding: 1rem;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  user-select: none;

  background-color: var(--background-color);
  color: var(--text-color);

  cursor: pointer;
}

.profile-image-upload:hover {
  background-color: var(--input-border-color);
  color: var(--background-color);

  cursor: pointer;
}

input[type="file"] {
  display: none;
}

.save-button {
  width: 100%;

  margin: 1rem auto;
  padding: 15px;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  background-color: var(--background-color);
  color: var(--text-color);

  // font-size: 1.1rem;
}

.save-button:hover {
  background-color: var(--input-border-color);
  color: var(--background-color);

  cursor: pointer;
}

.success-message {
  color: green;
  margin: 2rem auto 0;
}

.warning {
  color: red;
}

.warning:hover {
  background-color: firebrick;
}

.tabs {
  display: flex;
  justify-content: center;
}

.tab {
  padding: 5px 15px;
  border-style: solid;
  border-width: 0;
  box-sizing: border-box;

  background-color: var(--tile-color);
  color: var(--text-color);

  cursor: pointer;
}

.tab:hover {
  background-color: var(--background-color);
}

.active-tab {
  background-color: var(--background-color);
}

.first-tab {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.last-tab {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

@media screen and (max-width: 768px) {
  .profile-management-section {
    padding: 10px 20px;
  }

  .form-group {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

```

# frontend\src\app\styles\search\search.scss

```scss
@use "@/app/styles/global.scss";

.userSearchResults,
.contentSearchResults {
  display: flex;
  flex-direction: row;
  cursor: pointer;

  &:hover {
    @include global.glassmorphic-background;
    transition: all 0.3s ease;
    border-radius: 10px;
  }
}

.userSearchResults {
  margin: 10px 0;
  padding: 0px;
}

.searchItem {
  list-style-type: none;
}

.search-content-thumbnail {
  width: 200px;
  height: 100px;
  margin: 10px 10px 10px 0;
  border-radius: 10px;
  object-fit: cover;
  background-color: var(--input-border-color);
}

.searchResults {
  @include global.glassmorphic-background;
  padding: 20px 40px;
  border-radius: 25px;
  margin-bottom: 30px;
  max-height: 70vh;
  overflow-y: auto;
}

.fetchMoreButton {
  width: 100%;

  margin: 1rem auto;
  padding: 15px;

  border-radius: 10px;
  border-style: solid;
  border-color: var(--input-border-color);
  border-width: 1px;
  box-sizing: border-box;

  background-color: var(--background-color);
  color: var(--text-color);

  cursor: pointer;
}

.fetchMoreButton:hover {
  background-color: var(--input-border-color);
  color: var(--text-color);
}

.fetchMoreButton:active {
  background-color: var(--input-border-color);
  color: var(--text-color);
  transform: scale(0.95);
}

```

# frontend\src\app\styles\subscribe.scss

```scss
// Subscribe page styles
// Using project CSS variables

.subscribe-page-container {
  max-width: 800px;
  margin: 5rem auto 0;
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.subscribe-card {
  background-color: var(--tile-color);
  border-radius: 10px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  text-align: center;

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  .subscribe-description {
    color: var(--text-color);
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
}

.subscription-details {
  margin-bottom: 2rem;
}

.subscription-plan {
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 1.5rem;
  border: 2px solid var(--left-bottom-rectangle);

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  .subscription-price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--left-bottom-rectangle);
    margin-bottom: 1.5rem;

    span {
      font-size: 1rem;
      font-weight: 400;
      opacity: 0.8;
    }
  }
}

.subscription-features {
  display: flex;
  flex-direction: column;
  align-items: center;
  list-style-type: none;
  padding: 0;
  margin-bottom: 1rem;
  text-align: left;

  li {
    padding: 0.5rem 0;
    position: relative;
    padding-left: 1.5rem;
    color: var(--text-color);

    &:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: var(--left-bottom-rectangle);
      font-weight: bold;
    }
  }
}

.subscribe-button {
  background-color: var(--left-bottom-rectangle);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-bottom: 1.5rem;

  &:hover {
    background-color: var(--left-top-rectangle);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
}

.payment-info {
  font-size: 0.9rem;
  color: var(--text-color);

  p {
    margin-bottom: 0.5rem;
  }

  .payment-disclaimer {
    font-size: 0.8rem;
    opacity: 0.8;
  }
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  padding: 0.8rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

// Responsive adjustments
@media (max-width: 768px) {
  .subscribe-card {
    padding: 1.5rem;
  }

  .subscribe-card h1 {
    font-size: 1.8rem;
  }

  .subscription-plan .subscription-price {
    font-size: 2rem;
  }
}

```

# frontend\src\app\styles\summarizzPro.scss

```scss
.summarizz-pro-tag {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0 auto;
  background-color: var(--background-color);
  position: relative;
  border-width: 1px;
  border-radius: 10px;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease-in-out;
  font-family: var(--font-body);
  font-weight: 800;
  width: 60px;
  top: -40;
  left: 130;
}

.summarizz-logo-pro {
  font-size: 3rem;
}

.summarizz-pro-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 1rem;
}

@media (max-width: 768px) {
  .summarizz-pro-tag {
    font-size: 13px;
    width: 50px;
    top: -30;
    left: 110;
  }
}

```

# frontend\src\components\authentication\OAuthButtons.tsx

```tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../hooks/AuthProvider';

export function OAuthButtons() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const auth = useAuth();
    const router = useRouter();

    const handleOAuthSignIn = async (provider: string) => {
        try {
            setError('');
            setIsLoading(true);

            // Check if we're on mobile - use redirect flow for better mobile experience
            const useRedirect = window.innerWidth < 768;

            // @ts-ignore
            const result = await AuthService[`signInWith${provider.charAt(0).toUpperCase() + provider.slice(1)}`](useRedirect);

            if (result) {
                // Set user session
                auth.login(result.token, result.userUID);

                // Redirect to home page
                router.push('/');
            }
        } catch (error: any) {
            console.error(`${provider} Sign In Error:`, error);
            setError(error.message || `Failed to sign in with ${provider}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-oauth-section'>
            <button
                className='auth-button auth-oauth-button'
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                aria-label="Sign in with Google"
            >
                <img src='/images/google.svg' alt='Google' className='logo' />
                Sign in with Google
            </button>
            <button
                className='auth-button auth-oauth-button'
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                aria-label="Sign in with GitHub"
            >
                <svg
                    className='logo'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                >
                    <path
                        fill='currentColor'
                        d='M20 10.25q0 3.351-1.908 6.027t-4.928 3.703q-.352.068-.514-.093a.54.54 0 0 1-.163-.4V16.67q0-1.295-.677-1.895a9 9 0 0 0 1.335-.24q.591-.16 1.223-.52a3.7 3.7 0 0 0 1.055-.888q.423-.528.69-1.402t.267-2.008q0-1.616-1.028-2.75q.48-1.214-.105-2.723q-.364-.12-1.054.147a7 7 0 0 0-1.198.587l-.495.32a9 9 0 0 0-2.5-.346a9 9 0 0 0-2.5.347a12 12 0 0 0-.553-.36q-.345-.214-1.088-.514q-.741-.3-1.12-.18q-.572 1.507-.09 2.722q-1.03 1.134-1.03 2.75q0 1.134.268 2.002q.267.867.683 1.401a3.5 3.5 0 0 0 1.048.894q.632.36 1.224.52q.593.162 1.335.241q-.52.48-.638 1.375a2.5 2.5 0 0 1-.586.2a3.6 3.6 0 0 1-.742.067q-.43 0-.853-.287q-.423-.288-.723-.834a2.1 2.1 0 0 0-.631-.694q-.384-.267-.645-.32l-.26-.04q-.273 0-.378.06t-.065.153a.7.7 0 0 0 .117.187a1 1 0 0 0 .17.16l.09.066q.287.135.567.508q.28.374.41.68l.13.307q.17.507.574.821q.404.315.872.4q.468.087.905.094q.436.006.723-.047l.299-.053q0 .507.007 1.188l.006.72q0 .24-.17.4q-.168.162-.52.094q-3.021-1.028-4.928-3.703Q0 13.6 0 10.25q0-2.79 1.341-5.145a10.1 10.1 0 0 1 3.64-3.73A9.6 9.6 0 0 1 10 0a9.6 9.6 0 0 1 5.02 1.375a10.1 10.1 0 0 1 3.639 3.73Q20 7.461 20 10.25'
                    />
                </svg>
                Sign in with GitHub
            </button>

            {error && <p className="auth-error">{error}</p>}
        </div>
    );
}
```

# frontend\src\components\Background.tsx

```tsx
import "@/app/styles/background.scss";

/**
 * Background() -> JSX.Element
 *
 * @description
 * Renders the background for the website, consisting of a series of designs that
 * make it popout and better to look at.
 *
 * @returns JSX.Element (Background)
 */
export default function Background() {
  return (
    <div className='background-shapes'>
      <div className='left-bottom-rectangle' />
      <div className='left-top-rectangle' />
      <div className='middle-bottom-circle' />
      <div className='right-top-circle' />
      <div className='smooth-filter' />
    </div>
  );
}

```

# frontend\src\components\content\CommentList.tsx

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { apiURL } from "@/app/scripts/api";
import { useAuth } from "@/hooks/AuthProvider";
import { Comment } from "@/models/Comment";
import { redirect, useParams } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";

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

```

# frontend\src\components\content\ContentTile.tsx

```tsx
"use client";

import { Content } from "@/models/Content";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BookmarkIcon as BookmarkIconOutline,
  EyeIcon as EyeIconOutline,
  HeartIcon as HeartIconOutline,
  ShareIcon as ShareIconOutline,
  TrashIcon as TrashIconOutline,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconFilled,
  ShareIcon as ShareIconFilled,
  BookmarkIcon as BookmarkIconFilled,
} from "@heroicons/react/24/solid";

import "@/app/styles/content/contentTile.scss";
import { useAuth } from "@/hooks/AuthProvider";

interface ContentTileProps {
  content: Content;
  index: number;
  hideStats?: boolean;
  deleteShareOption?: boolean;
  handleUnshare?: (contentId: string) => void;
}

export default function ContentTile({
  content,
  index,
  hideStats = false,
  deleteShareOption = false,
  handleUnshare = () => {},
}: ContentTileProps) {
  const router = useRouter();
  const { userUID } = useAuth();

  return (
    <div
      key={content.uid || index}
      className='content-list-item'
      onClick={() => router.push(`/content/${content.uid}`)}
    >
      <div className='content-tile-info'>
        <div className='content-tile-header'>
          <h3 className='content-item-title'>{content.title}</h3>
          {/* Unshare Button */}
          {deleteShareOption && (
            <button
              className='icon-button unshare'
              onClick={(e) => {
                e.stopPropagation();
                handleUnshare(content.uid);
              }}
              title='Unshare Content'
            >
              <TrashIconOutline className='icon delete' />
            </button>
          )}
        </div>

        <p className="content-item-date">
          {content.dateCreated
            ? `${new Date(content.dateCreated).toLocaleString("en-US", {
                month: "short",
              })} ${new Date(content.dateCreated).getDate()}${
                content.readtime ? ` - ${content.readtime} min read` : ""
              }`
            : ""}
        </p>
      </div>

      {content.thumbnail && (
        <div className='content-thumbnail-container'>
          <Image
            src={content.thumbnail}
            alt='Thumbnail'
            width={200}
            height={200}
            className='content-thumbnail'
          />
        </div>
      )}

      {!hideStats && (
        <div className='content-stats'>
          <span className='stat-item'>
            {userUID && content.peopleWhoLiked?.includes(userUID) ? (
              <HeartIconFilled className='stat-icon' />
            ) : (
              <HeartIconOutline className='stat-icon' />
            )}
            <p className='stat-number'>{content.likes || 0}</p>
          </span>
          <span className='stat-item'>
            <EyeIconOutline className='stat-icon' />
            <p className='stat-number'>{content.views || 0}</p>
          </span>
          <span className='stat-item'>
            {userUID && content.sharedBy?.includes(userUID) ? (
              <ShareIconFilled className='stat-icon' />
            ) : (
              <ShareIconOutline className='stat-icon' />
            )}
            <p className='stat-number'>{content.shares || 0}</p>
          </span>
          <span className='stat-item'>
            {userUID && content.bookmarkedBy?.includes(userUID) ? (
              <BookmarkIconFilled className='stat-icon' />
            ) : (
              <BookmarkIconOutline className='stat-icon' />
            )}
            <p className='stat-number'>{content.bookmarkedBy?.length || 0}</p>
          </span>
        </div>
      )}
    </div>
  );
}

```

# frontend\src\components\content\toolbar.tsx

```tsx
"use client";

// React & NextJs (Import)
import { useState, useEffect } from "react";
import Image from "next/image";

// TipTap (Import)
import { Level } from "@tiptap/extension-heading";
import { Editor } from "@tiptap/react";

// Stylesheets (Import)
import "@/app/styles/content/toolbar.scss";

// ToolbarProps for Toolbar
interface ToolbarProps {
  editor: Editor | null;
}

// Heading Levels for Toolbar (1-6)
const headingLevels = [
  { key: 0, value: "0", label: "Paragraph" },
  { key: 1, value: "1", label: "Header 1" },
  { key: 2, value: "2", label: "Header 2" },
  { key: 3, value: "3", label: "Header 3" },
  { key: 4, value: "4", label: "Header 4" },
  { key: 5, value: "5", label: "Header 5" },
  { key: 6, value: "6", label: "Header 6" },
];

/**
 * Toolbar() -> JSX.Element
 *
 * @description
 * This function renders the Toolbar component, allowing users to format their content or
 * add headings, lists, and other formatting options.
 *
 * @param editor - TipTap Editor (ToolbarProps)
 * @returns JSX.Element
 */
export default function Toolbar({ editor }: ToolbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  {
    /*ANCHOR - Fix this Code, Light Mode / Dark Mode is not Actively Working. */
  }

  // EFFECT: Handle Dark Mode Preference for Formatting Options
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const preferenceMode = localStorage.getItem("isDarkMode");

    if (preferenceMode === "true") {
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDarkMode(true);
    } else if (preferenceMode === "false") {
      document.documentElement.setAttribute("data-theme", "light");
      setIsDarkMode(false);
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");

      if (mq.matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        setIsDarkMode(false);
      }

      const handleChange = (evt: any) => {
        const isDark = evt.matches;
        document.documentElement.setAttribute(
          "data-theme",
          isDark ? "dark" : "light"
        );
        setIsDarkMode(isDark);
      };

      mq.addEventListener("change", handleChange);

      return () => mq.removeEventListener("change", handleChange);
    }
  }, []);

  // If the editor is not available, return.
  if (!editor) {
    return null;
  }

  /**
   * handelHeadingChange() -> void
   *
   * @description
   * Handles the change of the heading level, setting the heading level
   * based on user's selection. If the user selects "Paragraph", it will
   * set the paragraph style. If the user selects a heading level, it
   * will set the heading style, and so on.
   *
   * @param event - Change Event for HTMLSelectElement
   */
  const handleHeadingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "0") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value, 10) as Level;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  /**
   * activeHeadingLevel() -> number
   *
   * @description
   * Determines the current heading level that is active in the editor.
   * If no heading is active, it checks if a paragraph is active and
   * returns 0 in that case. If neither a heading nor a paragraph is active,
   * it returns an empty string.
   *
   * @returns {number} - The active heading level (1-6 for headings, 0 for paragraph),
   * or an empty string if neither is active.
   */
  const activeHeadingLevel = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) {
        return i;
      }
    }

    return editor.isActive("paragraph") ? 0 : "";
  };

  return (
    <div className='toolbar'>
      <select
        onChange={handleHeadingChange}
        className='toolbar-dropdown'
        value={activeHeadingLevel()}
      >
        {headingLevels.map(({ key, value, label }) => (
          <option key={key} value={value}>
            {label}
          </option>
        ))}
      </select>

      <hr />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`toolbar-button ${
          editor.isActive("bold") ? "active" : ""
        } small-button`}
      >
        <b>B</b>
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`toolbar-button ${
          editor.isActive("italic") ? "active" : ""
        } small-button`}
      >
        <i>I</i>
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`toolbar-button ${
          editor.isActive("underline") ? "active" : ""
        } small-button`}
      >
        <u>U</u>
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`toolbar-button ${
          editor.isActive("strike") ? "active" : ""
        } small-button`}
      >
        <s>S</s>
      </button>

      <hr />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        className={`toolbar-button ${
          editor.isActive("codeBlock") ? "active" : ""
        }`}
      >
        &lt;/&gt;
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={!editor.can().chain().focus().toggleBlockquote().run()}
        className={`toolbar-button ${
          editor.isActive("blockquote") ? "active" : ""
        }`}
      >
        Quote
      </button>

      <hr />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${
          editor.isActive("bulletList") ? "active" : ""
        }`}
      >
        <Image
          src={
            isDarkMode
              ? "/images/orderedListIcon-light.png"
              : "/images/orderedListIcon-dark.png"
          }
          width={20}
          height={20}
          alt='Unordered List'
        />
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${
          editor.isActive("orderedList") ? "active" : ""
        }`}
      >
        <Image
          src={
            isDarkMode
              ? "/images/numberedListIcon-light.png"
              : "/images/numberedListIcon-dark.png"
          }
          width={20}
          height={20}
          alt='Ordered List'
        />
      </button>
    </div>
  );
}

```

# frontend\src\components\Footer.tsx

```tsx
"use client";

import "@/app/styles/footer.scss";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

/**
 * Footer() -> JSX.Element
 *
 * @description
 * Renders the footer component, with the Summarizz Logo and copyright year.
 *
 * @returns JSX.Element (Footer Component)
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const showFooterLinks = !pathname.startsWith("/auth");

  const router = useRouter();

  return (
    <footer className='footer'>
      {showFooterLinks && (
        <div className='website-links'>
          <div className='website-links-list'>
            <h4>Legal</h4>

            <div className='link'>
              <a onClick={() => router.push("/legal/terms-of-service")}>
                Terms of Service
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/privacy-policy")}>
                Privacy Policy
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/cookie-policy")}>
                Cookie Policy
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/ai-disclaimer")}>
                AI Disclaimer
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/accessibility")}>
                Accessibility
              </a>
            </div>
          </div>

          <div className='website-links-list'>
            <h4>Social</h4>

            <div className='link'>
              <a onClick={() => router.push("/about")}>About</a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/contact")}>Contact</a>
            </div>
          </div>
        </div>
      )}
      <Image
        src='/images/summarizz-logo.png'
        alt='Summarizz Logo'
        className='footer-logo'
        width={100}
        height={100}
      />
      <p>Copyright © {year} Summarizz. All rights reserved.</p>
    </footer>
  );
}

```

# frontend\src\components\Navbar.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Local Files (Import)
import { useAuth } from "../hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { User } from "@/models/User";

// Stylesheets
import "@/app/styles/navbar.scss";
import SearchList from "./search/searchList";
import { Content } from "@/models/Content";

function Navbar() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>();
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [contentSearchResults, setContentSearchResults] = useState<Content[]>(
    []
  );

  const auth = useAuth();
  const router = useRouter();

  // ---------------------------------------
  // ------------ Event Handler ------------
  // ---------------------------------------

  // Dark Mode handling
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const preferenceMode = localStorage.getItem("isDarkMode");

    // Check if user has a saved preference in cookies
    if (preferenceMode) {
      if (preferenceMode === "true") {
        document.documentElement.setAttribute("data-theme", "dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        setIsDarkMode(false);
      }
    }

    // If notCheck system preference as default.
    if (!preferenceMode) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");

      if (mq.matches) {
        setIsDarkMode(true);
      }

      // This callback will fire if the perferred color scheme changes without a reload
      mq.addEventListener("change", (evt) => setIsDarkMode(evt.matches));
    }
  }, []);

  // Update user info
  useEffect(() => {
    setAuthenticated(auth.getUserUID() !== null && auth.getToken() !== null);
    getUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  const toggleTheme = () => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("isDarkMode", isDarkMode ? "false" : "true");
  };

  /**
   * handleSearch() -> void
   *
   * @description
   * Uses the Next.js router to push the user to the search results page,
   * with the user's input as a url query parameter.
   */
  const handleSearch = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (query) {
      // Redirect to the search results page, where the actual searching happens.
      // router.push(`/search?query=${encodeURIComponent(query)}`);
      // window.location.href = `/search?query=${encodeURIComponent(query)}`;

      const userSearchResults = await axios.get(`${apiURL}/search/users/`, {
        params: {
          searchText: query,
        },
      });

      const contentSearchResults = await axios.get(
        `${apiURL}/search/content/`,
        {
          params: {
            searchText: query,
          },
        }
      );

      setUserSearchResults(userSearchResults.data.documents);
      setContentSearchResults(contentSearchResults.data.documents);

      console.log(userSearchResults);
      console.log(contentSearchResults);

      setShowSearchResults(true);
      setShowMenu(false);
    } else {
      alert("You didn't search for anything.");
    }
  };

  const updateAuthenticated = () => {
    setAuthenticated(auth.getUserUID() !== null && auth.getToken() !== null);
  };

  function getUserInfo() {
    const userID = auth.getUserUID();
    if (!userID) return;

    axios.get(`${apiURL}/user/${userID}`).then((res) => {
      setUser(res.data);
    });
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("title");
    }
    auth.logout();
  };

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      {(showSearchResults || showMenu) && (
        <div
          className='navbar-page-overlay'
          onClick={() => {
            setShowSearchResults(false);
            setShowMenu(false);
          }}
        ></div>
      )}
      <div className='navbar-background'>
        {/* App Name */}
        <a
          onClick={() => {
            setShowMenu(false);
            router.push("/");
          }}
        >
          <h1 className='navbar-title summarizz-logo'>Summarizz</h1>
        </a>
        {/* Create New Content */}
        {authenticated ? (
          <>
            <form onSubmit={handleSearch} className='searchBarContainer'>
              <input
                type='text'
                className='searchBar'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search for something!'
              />
              <button className='searchButton'>
                <MagnifyingGlassIcon />
              </button>
              {showSearchResults && (
                <div className='nav-searchResults'>
                  <SearchList
                    userSearchResults={userSearchResults}
                    contentSearchResults={contentSearchResults}
                  />
                </div>
              )}
            </form>

            <button
              className='navbar-button'
              onClick={() => {
                router.push("/content/create");
                localStorage.removeItem("title");
                Cookies.remove("content");
              }}
            >
              Create Content
            </button>

            {/* Profile Picture */}
            <div
              className='profile-picture-container'
              onClick={() => {
                updateAuthenticated();
                setShowMenu(!showMenu);
                setShowSearchResults(false);
              }}
            >
              {user && user.profileImage ? (
                <Image
                  src={user.profileImage}
                  width={50}
                  height={50}
                  alt='Profile Picture'
                  className='profile-picture'
                />
              ) : (
                <div className='no-profile-picture-container'>
                  <h1 className='no-profile-picture'>
                    {user?.username[0].toUpperCase()}
                  </h1>
                </div>
              )}
            </div>

            {/* Theme Slider */}
            <label className='theme-toggle'>
              <input
                type='checkbox'
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className='slider'></span>
            </label>
          </>
        ) : (
          <div className='navbar-auth'>
            <a
              className='navbar-link'
              onClick={() => router.push("/authentication/login")}
            >
              Login
            </a>
            <a
              className='navbar-link padding-right'
              onClick={() => router.push("/authentication/register")}
            >
              Register
            </a>

            {/* Theme Slider */}
            <label className='theme-toggle-auth'>
              <input
                type='checkbox'
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className='slider-auth'></span>
            </label>
          </div>
        )}
      </div>

      {/* Profile Menu */}
      {showMenu && (
        <div className='menu'>
          {!authenticated ? (
            <>
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push("/authentication/login");
                }}
              >
                Login
              </a>
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push("/authentication/register");
                }}
              >
                Register
              </a>
            </>
          ) : (
            <>
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${auth.getUserUID()}`);
                }}
              >
                View Profile
              </a>
              <hr className='menu-divider' />
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${auth.getUserUID()}/manage`);
                }}
              >
                Manage Profile
              </a>
              <hr className='menu-divider' />
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push("/pro");
                }}
              >
                Summarizz Pro
              </a>
              <hr className='menu-divider' />
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
              >
                Logout
              </a>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;

```

# frontend\src\components\NavbarWrapper.tsx

```tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const showNavbar = !pathname.startsWith("/auth");

  if (!showNavbar) return null;

  return <Navbar />;
}

```

# frontend\src\components\search\contentResult.tsx

```tsx
"use client";

import { Content } from "@/models/Content";
import { useRouter } from "next/navigation";

const ContentResult = ({ content }: { content: Content }) => {
  const router = useRouter();

  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected content's page.
   *
   * @returns void
   */
  const handleClick = () => {
    router.push(`/content/${content.uid}`);
  };

  return (
    <div className='contentSearchResults' onClick={handleClick}>
      <img
        src={content.thumbnail}
        alt={``}
        className='search-content-thumbnail'
      />
      <h3>{content.title}</h3>
    </div>
  );
};

export default ContentResult;

```

# frontend\src\components\search\searchList.tsx

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { apiURL } from "@/app/scripts/api";

//models
import { User } from "@/models/User";
import { Content } from "@/models/Content";

//components
import UserResult from "@/components/search/userResult";
import ContentResult from "@/components/search/contentResult";
import Navbar from "@/components/Navbar";

//styles
import "@/app/styles/search/search.scss";
import Error from "next/error";

function SearchListContent({
  userSearchResults,
  contentSearchResults,
}: {
  userSearchResults?: User[];
  contentSearchResults?: Content[];
} = {}) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------

  // Retrieve the search text from the url.
  const param = useSearchParams().get("query");
  const [usersReturned, setUsersReturned] = useState<User[]>([]);
  const [userDisabled, setUserDisabled] = useState(true);
  const [contentReturned, setContentReturned] = useState<Content[]>([]);

  const [userStartingPoint, setUserStartingPoint] = useState<string | null>(
    null
  );
  // const [contentStartingPoint, setContentStartingPoint] = useState<
  //   string | null
  // >(null);

  const [numberOfContentsToDisplay, setNumberOfContentsToDisplay] = useState(5);

  const [fetching, setFetching] = useState(false);

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------

  // Fetch both user data and content data on first page load.
  useEffect(() => {
    if (userSearchResults) {
      setUsersReturned(userSearchResults);
    } else if (param) {
      fetchUserData();
    }

    if (contentSearchResults) {
      setContentReturned(contentSearchResults);
    } else if (param) {
      fetchContentData();
    }
  }, [userSearchResults, contentSearchResults, param]);

  /**
   * fetchUserData() -> void
   *
   * @description
   *Send a get request to the api endpoint for searching for users.
   *
   * @returns void
   */
  const fetchUserData = async () => {
    if (!param) {
      return;
    }

    if (fetching) {
      alert("Already Fetching!!!!");
      return;
    }
    setFetching(true);

    try {
      const response = await axios.get(`${apiURL}/search/users/`, {
        params: {
          searchText: param,
          userStartingPoint: userStartingPoint,
        },
      });

      const newDocuments = response.data.documents;
      // Create a set to easily check if the last query has duplicates
      const usersSet = new Set(usersReturned.map((doc: User) => doc.uid));
      // Create a get each user document id from the GET response, then check
      // for whether at least one is not in the stored user set.
      const uniqueDocuments = newDocuments.filter(
        (doc: { uid: string }) => !usersSet.has(doc.uid)
      );

      // If there are unique documents, update the state
      if (uniqueDocuments.length > 0 && !fetching) {
        setUsersReturned((prev) => [...prev, ...uniqueDocuments]);
        // Update the starting point for the next fetch
        setUserStartingPoint(
          uniqueDocuments[uniqueDocuments.length - 1].usernameLower
        );

        if (usersReturned.length < 5) {
          setUserDisabled(true);
        } else {
          setUserDisabled(false);
        }
      } else {
        // If there are no unique documents, disable the button
        setUserDisabled(true);
      }
    } catch (error: any) {
      alert(`USER FETCHING ERROR: ${error}`);
      console.error("User fetching error: ", error);
      throw new Error(error);
    } finally {
      setFetching(false);
    }
  };

  /**
   * fetchUserData() -> void
   *
   * @description
   *Send a get request to the api endpoint for searching for articles.
   *
   * @returns void
   */
  const fetchContentData = async () => {
    if (!param) {
      return;
    }

    if (fetching) {
      alert("Already Fetching!!!!");
      return;
    }
    setFetching(true);

    try {
      const response = await axios.get(`${apiURL}/search/content/`, {
        params: {
          searchText: param,
        },
      });

      // Obtain the documents from the response data.
      const newDocuments = response.data.documents;
      // Create a set to easily check if the last query has duplicates
      const contentSet = new Set(
        contentReturned.map((doc: Content) => doc.uid)
      );
      // Get each document id from the GET response, then check
      // for whether at least one is not in the stored content set.
      const uniqueDocuments = newDocuments.filter(
        (doc: { id: string }) => !contentSet.has(doc.id)
      );

      // If there are unique documents, update the state
      if (uniqueDocuments.length > 0 && !fetching) {
        // Append the new data to the list of stored articles.
        setContentReturned((prev) => [...prev, ...uniqueDocuments]);
        // Update the starting point for the next fetch.
        // setContentStartingPoint(
        //   uniqueDocuments[uniqueDocuments.length - 1].titleLower
        // );
      }
    } catch (error: any) {
      alert(`CONTENT ERROR ${error}`);
      console.error("Error fetching contents: ", error);
      throw new Error(error);
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      {/* <div className='main-content'> */}
      <div className='searchResults'>
        {param && <h1>Search Results for: {param}</h1>}
        <h2>Users</h2>
        {usersReturned?.length === 0 ? (
          <p>Nothing found...</p>
        ) : (
          usersReturned.map((user: User, index) => (
            <div key={index} className='searchItem'>
              <UserResult user={user} />
            </div>
          ))
        )}
        {!userDisabled && (
          <button className='fetchMoreButton' onClick={fetchUserData}>
            Fetch more items
          </button>
        )}

        <h2>Content</h2>

        {contentReturned?.length === 0 ? (
          <p>Nothing found...</p>
        ) : (
          contentReturned.map(
            (content: Content, index) =>
              index < numberOfContentsToDisplay && (
                <div key={index} className='searchItem'>
                  <ContentResult content={content} />
                </div>
              )
          )
        )}

        {contentSearchResults &&
          contentSearchResults.length > numberOfContentsToDisplay && (
            <button
              className='fetchMoreButton'
              onClick={() =>
                setNumberOfContentsToDisplay(numberOfContentsToDisplay + 5)
              }
            >
              Fetch more Content
            </button>
          )}
      </div>
      {/* </div> */}
    </>
  );
}

const SearchList = (props: {
  userSearchResults?: User[];
  contentSearchResults?: Content[];
}) => {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchListContent {...props} />
    </Suspense>
  );
};

export default SearchList;

```

# frontend\src\components\search\userResult.tsx

```tsx
"use client";

import { User } from "@/models/User";
import { useRouter } from "next/navigation";
import "@/app/styles/navbar.scss";

const UserResult = ({ user }: { user: User }) => {
  const router = useRouter();

  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected user's page.
   *
   * @returns void
   */
  const handleClick = () => {
    router.push(`/profile/${user.uid}`);
  };

  return (
    <div className='userSearchResults' onClick={handleClick}>
      <div className='profile-picture-container'>
        {user && user.profileImage ? (
          <img
            src={user.profileImage}
            width={50}
            height={50}
            alt='Profile Picture'
            className='profile-picture'
          />
        ) : (
          <div className='no-profile-picture-container'>
            <h1 className='no-profile-picture'>
              {user?.username?.[0].toUpperCase() || "U"}
            </h1>
          </div>
        )}
      </div>

      <h3>
        {user.firstName} {user.lastName}
      </h3>
    </div>
  );
};

export default UserResult;

```

# frontend\src\components\SummarizzPro.tsx

```tsx
import "@/app/styles/summarizzPro.scss";

export default function SummarizzPro() {
  return (
    <div className='summarizz-pro-container'>
      <h1 className='summarizz-logo summarizz-logo-pro'>Summarizz</h1>
      <h2 className='summarizz-pro-tag'>PRO</h2>
    </div>
  );
}

```

# frontend\src\config\postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# frontend\src\config\tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;

```

# frontend\src\hooks\AuthProvider.tsx

```tsx
"use client";

import { useContext, createContext } from "react";
import PropTypes from "prop-types";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
interface AuthContextType {
  userUID: string | null;
  setUserUID: (arg0: string) => void;
  getUserUID: () => string | null;
  token: string | null;
  setToken: (arg0: string) => void;
  getToken: () => string | null;
  login: (token: string, userUID: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>({
  userUID: null,
  setUserUID: () => {},
  getUserUID: () => null,
  token: null,
  setToken: () => {},
  getToken: () => null,
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  function setUserUID(userUID: string) {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    localStorage.setItem("userUID", userUID);
  }

  function getUserUID() {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return null;

    return localStorage.getItem("userUID");
  }

  function setToken(token: string) {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    localStorage.setItem("token", token);
  }

  function getToken() {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
  }

  function login(token: string, userUID: string) {
    setToken(token);
    setUserUID(userUID);
  }

  function logout() {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("userUID");
    router.push("/authentication/login");
  }

  return (
    <AuthContext.Provider
      value={{
        userUID: getUserUID(),
        token: getToken(),
        setUserUID,
        getUserUID,
        setToken,
        getToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};

```

# frontend\src\interfaces\types.d.ts

```ts
// export interface User {
//     username: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     uid: string;
//     bio?: string;
//     profileImage?: string;
//     content?: string[];
//     isPrivate?: boolean;
//     followedCreators?: string[];
//     followedBy?: string[];
//     followRequests?: string[];
// }

// export interface Content {
//     id: string;
//     creatorUID: string;
//     dateCreated: Date;
//     dateUpdated: Date;
//     title: string;
//     content: string;
//     thumbnail?: string;
//     readtime?: number;
//     likes?: number;
//     peopleWhoLiked?: string[];
//     bookmarkedBy?: string[];
// }

declare module '*.svg' {
    const content: Icon;
    export default content;
}

declare module '*.png' {
    const content: Icon;
    export default content;
}

declare module '*.jpg' {
    const content: Icon;
    export default content;
}

declare module "*.jpeg" {
    const content: Icon;
    export default content;
}

// ANCHOR - This is going to play a big role in the refactoring future!
// ANCHOR - Summarizz 2025
```

# frontend\src\models\Comment.ts

```ts
export interface Comment {
    post_id: string;
    comment_id: string;
    owner_id: string;
    username: string;
    text: string;
    timestamp: number;
    last_edited_timestamp: number;
    like_count: number;
}


```

# frontend\src\models\Content.ts

```ts
export interface Content {
  uid: string; // Firebase UID
  creatorUID: string; // Content Creator UID
  title: string; // Content Title
  content: string; // Content Body
  dateCreated: Date; // Date Created
  dateUpdated: Date; // Date Updated

  // Optional Fields
  thumbnail?: string; // Thumbnail Image
  summary?: string; // Content Summary
  readtime?: number; // Read Time
  likes?: number; // Likes Count
  peopleWhoLiked?: string[]; // List of user IDs who liked the post
  bookmarkedBy?: string[]; // List of user IDs who bookmarked the post
  views?: number; // Amount of times this page was viewed. This gets populated and updated with each GET request to the content id.
  shares?: number; // Amount of times shared. This gets populated after someone clicks the share icon button.
  titleLower?: string; // Lowercase title, used for sharing.
  sharedBy?: string[]; // List of user IDs who shared the post
  score?: number; // Score of the content
}

```

# frontend\src\models\User.ts

```ts
export interface User {
  uid: string; // Firebase UID
  firstName: string; // User’s first name
  lastName: string; // User’s last name
  email: string; // User’s email
  username: string; // Display name
  createdAt: Date; // Timestamp
  profileImage?: string; // Optional profile image
  bio?: string; // Optional bio
  phone?: string; // Optional phone number
  dateOfBirth?: string; // Optional date of birth
  location?: string; // Optional location
  website?: string; // Optional website
  content?: string[]; // Optional content
  likedContent?: string[]; // Optional liked content
  bookmarkedContent?: string[]; // Optional bookmarked content
  following?: string[]; // Optional followed creators
  followers?: string[]; // Optional followed by users
  sharedContent?: string[]; // Optional shared content
  isPrivate?: boolean; // Optional private account
  followRequests?: string[]; // Optional follow requests
}

```

# frontend\src\services\authService.ts

```ts
"use client";

import axios from "axios";
import { apiURL } from "../app/scripts/api";

export const AuthService = {
  // Existing email/password authentication
  async register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ) {
    try {
      const response = await axios.post(`${apiURL}/user/register`, {
        firstName,
        lastName,
        username,
        email,
        password,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to register user");
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${apiURL}/user/login`, {
        email,
        password,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to login user");
    }
  },

  // OAuth authentication methods
  async signInWithGoogle(useRedirect = false) {
    return this.signInWithProvider("google", useRedirect);
  },

  async signInWithGithub(useRedirect = false) {
    return this.signInWithProvider("github", useRedirect);
  },

  // async signInWithApple(useRedirect = false) {
  //     return this.signInWithProvider('apple', useRedirect);
  // },

  async signInWithProvider(provider: string, useRedirect = false) {
    try {
      // Only proceed if we're in the browser environment
      if (typeof window === "undefined") return null;

      if (useRedirect) {
        // Get the OAuth URL from the backend
        const response = await axios.post(`${apiURL}/oauth/url`, {
          provider,
          redirectUri: `${window.location.origin}/auth/callback`,
        });

        // Redirect to the OAuth provider
        window.location.href = response.data.authUrl;
        return null;
      } else {
        // For popup flow, we need to open a new window and handle the OAuth flow
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        // Get OAuth URL for the popup
        const urlResponse = await axios.post(`${apiURL}/oauth/url`, {
          provider,
          redirectUri: `${window.location.origin}/auth/popup-callback`,
        });

        const popup = window.open(
          urlResponse.data.authUrl,
          "OAuth",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }

        // Listen for the popup to send the authentication result
        return new Promise((resolve, reject) => {
          window.addEventListener(
            "message",
            async (event) => {
              // Verify the origin of the message
              if (event.origin !== window.location.origin) return;

              const { token, uid, error } = event.data;

              if (error) {
                reject(new Error(error));
              } else if (token && uid) {
                resolve({ token, userUID: uid });
              }
            },
            { once: true }
          );

          // Set a timeout to reject the promise if the popup is closed without completing auth
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              reject(new Error("Authentication was cancelled"));
            }
          }, 1000);
        });
      }
    } catch (error: any) {
      console.error("OAuth Error:", error);
      throw new Error(error.message || "Failed to authenticate with provider");
    }
  },

  async handleCallbackResult(token: string, uid: string) {
    try {
      // Verify the token with our backend
      const response = await axios.post(`${apiURL}/oauth/verify`, {
        idToken: token,
        provider: "callback", // Just indicating this came from a callback
      });

      return {
        userUID: response.data.userUID,
        token: response.data.token,
      };
    } catch (error: any) {
      console.error("Callback handling error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to process authentication"
      );
    }
  },

  async logout() {
    try {
      await axios.post(`${apiURL}/user/logout`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to logout");
    }
  },
};

```

# frontend\tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

# README.md

```md
<div align="center">
  <img src="docs/assets/turing-sandbox-logo-rbg.png" alt="Turing Sandbox Logo" width="150" height="150"/>
</div>

# Turing Sandbox Web - Official Application

[![Docker](https://img.shields.io/badge/-Docker-black?style=flat&logo=docker&logoColor)]()
[![Python](https://img.shields.io/badge/-Python-black?style=flat&logo=python&logoColor)]()
[![Flask](https://img.shields.io/badge/-Flask-black?style=flat&logo=flask&logoColor)]()
[![NextJs](https://img.shields.io/badge/-NextJs-black?style=flat&logo=next.js&logoColore)]()
[![NodeJs](https://img.shields.io/badge/-NodeJs-black?style=flat&logo=node.js&logoColor)]()
[![TypeScript](https://img.shields.io/badge/-TypeScript-black?style=flat&logo=typescript&logoColor)]()
[![Firebase](https://img.shields.io/badge/-Firebase-black?style=flat&logo=firebase&logoColor=orange)]()
[![Vercel](https://img.shields.io/badge/-Vercel-black?style=flat&logo=vercel&logoColor=white)]()
[![Digital Ocean](https://img.shields.io/badge/-Digital%20Ocean-black?style=flat&logo=digitalocean&logoColor)]()

> [!WARNING]
> This project is still currently under development and is not yet ready for production use. Given this we would recommend not to use this project in production environments unless its for testing purposes only.


## Table of Contents

- [Turing Sandbox Web - Official Application](#turing-sandbox-web---official-application)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Docker Configuration for Frontend and Backend](#docker-configuration-for-frontend-and-backend)
    - [Configuration](#configuration)
  - [Branching Strategy and Workflow](#branching-strategy-and-workflow)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

This project is a cutting-edge web application designed to empower users to create and share concise summaries of articles, videos, and other content types. Built with Next.js, Firebase, Flask, and AI-powered tools developed in Python, the application offers a seamless and user-friendly platform. Its primary goal is to streamline the summarization process, making it efficient and accessible for various content formats, fostering better understanding and collaboration among users.

## Getting Started

In order to get started with this project, you will need to have the following software installed (locally) on your machine:
1. [NodeJs](https://nodejs.org/en/) - Latest LTS Version
2. [Python](https://www.python.org/) - 3.x or Above (Recommended Version: 3.12)
3. [Docker](https://www.docker.com/) - Not Required (Optional)

### Installation

Getting started with this project is simple, however there may be a need to have multiple terminals open to run both backend APIs (AI backend and the core backend) alongside the frontend.

> [!NOTE]
> We will implement a `Makefile` or a series of `ps1` and `bat` files to make this process easier rather than having to manually enable each service for our backend APIs.

To get started with the project, follow the steps below:
1. Clone the repository to your local machine using the following command:
\`\`\`bash
git clone https://github.com/Turing-Sandbox/Turing-Sandbox-Web.git
\`\`\`

2. After cloning the repository, create 2 new terminals (side by side) navigating the to the `backend` and `frontend` directories respectively.
   
3. In the `backend` directory, run the following command to install the required dependencies:
\`\`\`bash
npm install
\`\`\`

4. In the `frontend` directory, run the following command to install the required dependencies:
\`\`\`bash
npm install
\`\`\`

5. In the `backend` directory, run the following command to start the backend server:
\`\`\`bash
npm run dev
\`\`\`

6. In the `frontend` directory, run the following command to start the frontend server:
\`\`\`bash
npm run dev
\`\`\`

7. You will now be able to access the frontend application at `http://localhost:3001` and the backend application at `http://localhost:3000`.

### Docker Configuration for Frontend and Backend

> [!NOTE]
> This is not a required step but we recommend it for those who are familiar with Docker and running multiple contains on the same machine, you will have 2 containers running on your machine (1 for the ai backend and 1 for the core backend) and you can access them at `http://localhost:3001` and `http://localhost:3000` or access the other ports (`5001` and `5000`) that are exposed by the containers.

> [!WARNING]
> This is still being worked on and might not work as expected, we will updated this section once we know the `Dockerfile`s for the AI backend and the core backend are working as expected and can be deployed both locally and on an EC2 instance alongside AWS Fargate for scaling purposes.

1. Building the Docker Images for Core Backend and AI Backend:
\`\`\`bash
docker build -t ts-core-backend .
docker build -t ts-ai-backend .
\`\`\`
1. Running the Docker Images for Core Backend and AI Backend:
\`\`\`bash
docker run -d -p 3000:3000 -p 5000:5000 ts-core-backend
docker run -d -p 3001:3001 -p 5001:5001 ts-ai-backend
\`\`\`

This should create 2 containers on your machine, one for the core backend and one for the AI backend, you can access them at `http://localhost:3000` and `http://localhost:3001` respectively or access the other ports that are exposed by the containers.

### Configuration

Most of the configuration for the project will be done through environment variables and a little bit of configuration in the `backend/shared/config.ts` file. The following environment variables **MUST** be set in order to the application to function properly:

Core Backend `.env.sample` file:
\`\`\`bash
# Server Configuration Variables
NODE_ENV=...
PORT=...

# Firebase Configuration Variables
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
\`\`\`
AI Backend `.env.sample` file:
\`\`\`bash
# AI Configuration Variables
OPENAI_API_KEY=...
LANGCHAIN_TRACING_V3=...
LANGCHAIN_API_KEY=...
OPENROUTER_API_KEY=...

# Flask .env Variables
FLASK_APP=app.py
FLASK_ENV=development
FLASK_RUN_PORT=5000
FLASK_RUN_HOST=0.0.0.0
\`\`\`

All of these variables can be set in the `.env` file in the root directory of the project, **NOTE** you will need to create this file yourself and set the values for each variable.

## Branching Strategy and Workflow

For our branching strategy, each branch should be named after a feature, bug fix, or improvement with its corresponding jira ticket identifier. For example, if you are working on a bug fix for issue 80, your branch name should be appropriately named `FIX/TS-80` where the `TS` prefix is our jira ticket identifier and also stands for "Turing Sandbox". Other examples include but are not limited to the following:
- `Feature/TS-80` - For branches that are related to a feature or improvement.
- `Bug/TS-80` - For branches that are related to a bug fix.
- `Refactor/TS-80` - For branches that are related to a refactoring or code cleanup.
- `Documentation/TS-80` - For branches that are related to documentation or documentation improvements.
- `Chore/TS-80` - For branches that are related to chores or maintenance tasks.
- The list goes on and on...

This branching strategy is crucial for our project's smooth development and is **ENCOURAGED** to be followed by all contributors, whether they are new to the project or part of our core team from the beginning of the project. This will ensure that the project remains organized and efficient, and that all contributions are properly integrated and tested, leading towards a better developer experience (hopefully).

## Contributing

We welcome all types of contributions to this project, if you would like to know more about contribution guidelines and how to contribute, please refer to our [CONTRIBUTING.md](docs/CONTRIBUTING.md) file.

<a href="https://github.com/Turing-Sandbox/Turing-Sandbox-Web/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Turing-Sandbox/Turing-Sandbox-Web" />
</a>

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
```

