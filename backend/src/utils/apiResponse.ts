export interface ApiMeta {
  nextCursor?: string | null;
  message?: string;
}

export function apiSuccess<T>(data: T, meta?: ApiMeta) {
  if (meta && Object.keys(meta).length > 0) {
    return { data, meta };
  }
  return { data };
}
