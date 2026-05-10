type TErrorReturn = {
  name: string
  action: string
  status_code: number
}

export class InternalServerError extends Error {
  public action: string
  public statusCode: number

  constructor({ cause, statusCode }: ErrorOptions & { statusCode?: number }) {
    super('Um erro interno não esperado aconteceu', {
      cause
    })
    this.name = 'InternalServerError'
    this.action = 'Entre em contato com o suporte.'
    this.statusCode = statusCode || 500
  }

  toJSON(): TErrorReturn {
    return {
      name: this.name,
      action: this.action,
      status_code: this.statusCode
    }
  }
}
