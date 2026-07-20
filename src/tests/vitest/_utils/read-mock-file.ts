import { readFile } from 'node:fs/promises'

export const readMockFile = (filename: string): Promise<Buffer> =>
  readFile(`${process.cwd()}/src/tests/vitest/_mocks/${filename}`)
