type TErrorReturn = {
  name: string
  message: string
  action: string
  statusCode: number
}

export class InternalServerError extends Error {
  public action: string
  public statusCode: number

  constructor({
    cause,
    statusCode = 500
  }: ErrorOptions & { statusCode?: number }) {
    super('Um erro interno não esperado aconteceu', {
      cause
    })
    this.name = 'InternalServerError'
    this.action = 'Entre em contato com o suporte.'
    this.statusCode = statusCode
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

export class ConflictError extends Error {
  public action: string
  public statusCode: number

  constructor({
    cause,
    message = 'Este recurso já existe no sistema.',
    action = 'Verifique se o recurso já não foi cadastrado.'
  }: ErrorOptions & { message?: string; action?: string }) {
    super(message, { cause })
    this.name = 'ConflictError'
    this.action = action
    this.statusCode = 409
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
    message = 'Não foi possível encontrar este recurso no sistema.',
    action = 'Verifique se os parâmetros enviados na consulta estão certos.'
  }: ErrorOptions & { message?: string; action?: string }) {
    super(message, { cause })
    this.name = 'NotFoundError'
    this.action = action
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
