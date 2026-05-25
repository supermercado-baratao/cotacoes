type TErrorReturn = {
  name: string
  message: string
  action: string
  statusCode: number
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
      message: this.message,
      action: this.action,
      statusCode: this.statusCode
    }
  }
}

export class NotFoundError extends Error {
  public action: string
  public statusCode: number

  constructor({
    cause,
    message,
    action
  }: ErrorOptions & { message?: string; action?: string }) {
    super(message || 'Não foi possível encontrar este recurso no sistema.', {
      cause
    })
    this.name = 'NotFoundError'
    this.action =
      action || 'Verifique se os parâmetros enviados na consulta estão certos.'
    this.statusCode = 404
  }

  toJSON(): TErrorReturn {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode
    }
  }
}
