import { CloudUpload } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { useRef } from 'react'

import * as S from './style'

type TDropZoneProps = {
  onFileSelect: (file: File) => void
}

export const DropZone = ({ onFileSelect }: TDropZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const openFileDialog = () => inputRef.current?.click()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFileSelect(file)
  }

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    openFileDialog()
  }

  return (
    <Box sx={S.Wrapper} onClick={openFileDialog}>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={handleChange}
      />
      <CloudUpload sx={S.Icon} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Arraste e solte seu arquivo aqui
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Somente arquivos <strong>.xlsx</strong> são aceitos
        </Typography>
      </Box>
      <Button variant="outlined" onClick={handleButtonClick}>
        Selecionar arquivo
      </Button>
    </Box>
  )
}
