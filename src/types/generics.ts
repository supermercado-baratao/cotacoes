type TAutomaticFields = 'id' | 'createdAt' | 'updatedAt'

export type TCreateData<T> = T extends readonly (infer U)[]
  ? Omit<U, TAutomaticFields>[]
  : Omit<T, TAutomaticFields>

type TUpdateRequiredFields<T> = Omit<
  T extends { id: string } ? T : never,
  Extract<TAutomaticFields, 'updatedAt'>
>

export type TUpdateData<T> = T extends readonly (infer U)[]
  ? TUpdateRequiredFields<U>[]
  : TUpdateRequiredFields<T>
