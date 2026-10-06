import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material'
import { signOut } from 'firebase/auth'

import { auth } from '@/infra/firebase-config'

import { getFetchErrorMessage } from './messages'
import * as S from './style'

type TFetchErrorProps = {
  code: string
  handleRetryClick: () => void
}

export const FetchError = ({ code, handleRetryClick }: TFetchErrorProps) => {
  const { title, description, recommendations } = getFetchErrorMessage(code)

  const handleSignOutClick = () => signOut(auth)

  return (
    <Alert severity="error" variant="outlined" sx={S.Wrapper}>
      <AlertTitle>{title}</AlertTitle>
      <Typography variant="body2">{description}</Typography>
      <Box component="ul" sx={S.Recommendations}>
        {recommendations.map((recommendation) => (
          <Typography key={recommendation} component="li" variant="body2">
            {recommendation}
          </Typography>
        ))}
      </Box>
      <Box sx={S.Actions}>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleRetryClick}
        >
          Tentar novamente
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleSignOutClick}
        >
          Sair
        </Button>
      </Box>
    </Alert>
  )
}
