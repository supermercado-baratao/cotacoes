import { useState } from 'react'

export const useFormState = <T>() => {
  const [formItem, setFormItem] = useState<T | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleFormOpen = (item: T | null = null) => {
    setFormItem(item)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
  }

  return {
    formItem,
    setFormItem,
    isFormOpen,
    handleFormOpen,
    handleFormClose
  }
}
