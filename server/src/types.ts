export type RequireOnlyOptional<T> = {
  [K in keyof T as {} extends Pick<T, K> ? K : never]-?: T[K];
};

export type Override<T, R> = Omit<T, keyof R> & R;