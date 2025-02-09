export type GenericResponse<T, Y> = {
  payload: T;
  meta: Y;
  error: string;
  success: boolean;
};
