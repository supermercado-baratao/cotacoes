import { where } from 'firebase/firestore'

import { database } from '@/infra'
import { NotFoundError } from '@/infra/errors'
import type { TCreateData, TUpdateData } from '@/types'

import { path } from './constants'
import {
  type TProduct,
  type TProductHistory,
  type TProductHistoryType
} from './types'
import { createHistory, getHistoryPath, processProductUpdate } from './utils'

const create = async (data: TCreateData<TProduct>): Promise<TProduct> => {
  return database.create({ path, data })
}

const findMany = async (): Promise<TProduct[]> => {
  return database.findMany<TProduct>({ path })
}

const findManyPriceHistory = async (
  productId: string,
  type: TProductHistoryType
): Promise<TProductHistory[]> => {
  return database.findMany<TProductHistory>({
    path: getHistoryPath(productId),
    queryConstraints: [where('type', '==', type)]
  })
}

const update = async (data: TUpdateData<TProduct>): Promise<TProduct> => {
  const foundProduct = await database.findUniqueById<TProduct>({
    path,
    id: data.id
  })
  if (!foundProduct) {
    throw new NotFoundError({ message: 'Produto não encontrado' })
  }
  const result = processProductUpdate(foundProduct, data)
  if (!result) return foundProduct

  const product = await database.update({ path, data: result.updated })
  await Promise.all(
    result.histories.map((history) =>
      createHistory({ id: data.id, ...history })
    )
  )
  return product
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path, id })
}

export const productModel = {
  create,
  findMany,
  findManyPriceHistory,
  update,
  deleteUniqueById
}
