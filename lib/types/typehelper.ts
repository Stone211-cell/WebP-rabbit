// lib/types/typehelper.ts

export type RouteParams<T = { id: string }> = {
  params: Promise<T>;
};