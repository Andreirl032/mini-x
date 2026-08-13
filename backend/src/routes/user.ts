import { Router } from "express";
import authenticateToken from "../middlewares/auth.middleware";
import {
  createUser,
  deleteUser,
  editUser,
  follow,
  unfollow,
  uploadProfilePicture,
  viewFollowers,
  viewFollowing,
  viewUser,
  viewUserLikes,
  viewUserPosts,
  viewUserReplies,
} from "../controllers/user.controller";
import { requireAccountOwner } from "../middlewares/accountOwner.middleware";
import optionalAuth from "../middlewares/optionalAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema, editUserSchema } from "../validation/user.schema";
import {
  userIdParamsSchema,
  paginationQuerySchema,
} from "../validation/common.schema";
import { upload } from "../middlewares/upload.middleware";

const userRouter = Router();

userRouter.post("/users", validate({ body: createUserSchema }), createUser);

userRouter.get(
  "/users/:id",
  optionalAuth,
  validate({ params: userIdParamsSchema }),
  viewUser,
);

userRouter.get(
  "/users/:id/posts",
  optionalAuth,
  validate({ params: userIdParamsSchema, query: paginationQuerySchema }),
  viewUserPosts,
);

userRouter.use(authenticateToken);

userRouter.get(
  "/users/:id/replies",
  validate({ params: userIdParamsSchema, query: paginationQuerySchema }),
  viewUserReplies,
);

userRouter.post(
  "/users/:id/follow",
  validate({ params: userIdParamsSchema }),
  follow,
);

userRouter.delete(
  "/users/:id/follow",
  validate({ params: userIdParamsSchema }),
  unfollow,
);

userRouter.get(
  "/users/:id/followers",
  validate({ params: userIdParamsSchema, query: paginationQuerySchema }),
  viewFollowers,
);

userRouter.get(
  "/users/:id/following",
  validate({ params: userIdParamsSchema, query: paginationQuerySchema }),
  viewFollowing,
);

userRouter.get(
  "/users/:id/likes",
  requireAccountOwner,
  validate({ params: userIdParamsSchema, query: paginationQuerySchema }),
  viewUserLikes,
);

userRouter.patch(
  "/users/:id",
  requireAccountOwner,
  validate({ params: userIdParamsSchema, body: editUserSchema }),
  editUser,
);

userRouter.delete(
  "/users/:id",
  requireAccountOwner,
  validate({ params: userIdParamsSchema }),
  deleteUser,
);

userRouter.patch(
  "/users/:id/avatar",
  requireAccountOwner,
  validate({ params: userIdParamsSchema }),
  upload.single("image"),
  uploadProfilePicture,
);

export default userRouter;
