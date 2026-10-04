type TFetchErrorMessage = {
  title: string
  description: string
  recommendations: string[]
}

const SESSION_MESSAGE: TFetchErrorMessage = {
  title: 'Sem permissão para acessar seus dados',
  description: 'O servidor recusou a busca dos dados desta conta.',
  recommendations: [
    'Saia e entre novamente para renovar sua sessão',
    'Se o problema continuar, avise o responsável pelo sistema'
  ]
}

const CONNECTION_MESSAGE: TFetchErrorMessage = {
  title: 'Não foi possível conectar ao servidor',
  description: 'A conexão com o banco de dados falhou.',
  recommendations: [
    'Verifique sua conexão com a internet',
    'Tente novamente em alguns instantes'
  ]
}

const DEFAULT_MESSAGE: TFetchErrorMessage = {
  title: 'Erro ao buscar os dados',
  description: 'Ocorreu um erro inesperado ao carregar as informações.',
  recommendations: [
    'Tente novamente',
    'Se o problema continuar, saia e entre novamente'
  ]
}

const MESSAGES: Record<string, TFetchErrorMessage> = {
  'permission-denied': SESSION_MESSAGE,
  unauthenticated: SESSION_MESSAGE,
  unavailable: CONNECTION_MESSAGE,
  'deadline-exceeded': CONNECTION_MESSAGE
}

export const getFetchErrorMessage = (code: string) =>
  MESSAGES[code] ?? DEFAULT_MESSAGE
