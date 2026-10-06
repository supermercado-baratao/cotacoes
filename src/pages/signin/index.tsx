import {
  Box,
  Button,
  Link as MuiLink,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { Link as RouterLink } from 'react-router'

import { Loader } from '@/components/ui/loader'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

export const Signin = () => {
  const { register, onSubmit, isSubmitting, errors } = useFormHandler()

  return (
    <Box sx={S.Wrapper}>
      <Paper sx={S.Card}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', textAlign: 'center' }}
        >
          Entrar
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={S.Form}>
          <TextField
            label="E-mail"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />
          <Button type="submit" variant="contained">
            Entrar
          </Button>
        </Box>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Não tem uma conta?{' '}
          <MuiLink
            component={RouterLink}
            to="/signup"
            variant="body2"
            sx={{ fontWeight: 'bold' }}
          >
            Criar conta
          </MuiLink>
        </Typography>
      </Paper>
      <Loader open={isSubmitting} />
    </Box>
  )
}
