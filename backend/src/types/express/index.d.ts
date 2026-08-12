import { JwtPayload } from "../jwt";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
