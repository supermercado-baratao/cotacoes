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

export const Signup = () => {
  const { register, onSubmit, errors, isSubmitting } = useFormHandler()

  return (
    <Box sx={S.Wrapper}>
      <Paper elevation={3} sx={S.Card}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', textAlign: 'center' }}
        >
          Criar conta
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={S.Form}>
          <TextField
            label="Nome"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />
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
          <TextField
            label="Confirmar senha"
            type="password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth>
            Criar conta
          </Button>
        </Box>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <MuiLink
            component={RouterLink}
            to="/signin"
            variant="body2"
            sx={{ fontWeight: 'bold' }}
          >
            Entrar
          </MuiLink>
        </Typography>
      </Paper>
      <Loader open={isSubmitting} />
    </Box>
  )
}
