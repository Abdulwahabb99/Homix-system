export interface BaseRepository<TEntity, TCreateInput, TUpdateInput = Partial<TCreateInput>> {
  create<TResult = TEntity>(payload: TCreateInput): Promise<TResult>;
  findAll<TResult = TEntity>(filters?: Readonly<Record<string, unknown>>): Promise<TResult[]>;
  update<TResult = number>(filters: Readonly<Record<string, unknown>>, payload: TUpdateInput): Promise<TResult>;
  delete<TResult = number>(filters: Readonly<Record<string, unknown>>): Promise<TResult>;
}
