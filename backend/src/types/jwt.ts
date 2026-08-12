export interface JwtPayload {
  user_id: string;
  iat?: number;
  exp?: number;
}
