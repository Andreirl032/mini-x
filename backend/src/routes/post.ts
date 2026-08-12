import { Router } from "express";
import {
  deletePost,
  unlikePost,
  editPost,
  getPostFromId,
  getPosts,
  getFeedFollowing,
  getPostReplies,
  likePost,
  postPost,
} from "../controllers/post.controller";
import authenticateToken from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createPostBodySchema, editPostBodySchema } from "../validation/post.schema";
import {
  postIdParamsSchema,
  paginationQuerySchema,
} from "../validation/common.schema";
import { upload } from "../middlewares/upload.middleware";

const postRouter = Router();

// Feed de quem você segue — registrado antes de /posts/:postId
postRouter.get(
  "/posts/feedFollowing",
  authenticateToken,
  validate({ query: paginationQuerySchema }),
  getFeedFollowing,
);

postRouter.get(
  "/posts/:postId",
  validate({ params: postIdParamsSchema }),
  getPostFromId,
);
postRouter.get(
  "/posts/:postId/replies",
  validate({ params: postIdParamsSchema, query: paginationQuerySchema }),
  getPostReplies,
);

postRouter.use(authenticateToken);

postRouter.get("/posts", validate({ query: paginationQuerySchema }), getPosts);

postRouter.post(
  "/posts",
  upload.single("image"),
  validate({ body: createPostBodySchema }),
  postPost,
);

postRouter.patch(
  "/posts/:postId",
  upload.single("image"),
  validate({ params: postIdParamsSchema, body: editPostBodySchema }),
  editPost,
);

postRouter.delete(
  "/posts/:postId",
  validate({ params: postIdParamsSchema }),
  deletePost,
);

postRouter.post(
  "/posts/:postId/likes",
  validate({ params: postIdParamsSchema }),
  likePost,
);

postRouter.delete(
  "/posts/:postId/likes",
  validate({ params: postIdParamsSchema }),
  unlikePost,
);

export default postRouter;
