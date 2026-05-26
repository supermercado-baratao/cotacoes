import { useState } from 'react'

export const useFormState = <T>() => {
  const [formItem, setFormItem] = useState<T | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleFormOpen = () => {
    setFormItem(null)
    setIsFormOpen(true)
  }

  const handleFormEdit = (item: T) => {
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
    handleFormEdit,
    handleFormClose
  }
}
