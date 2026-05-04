import { useState } from 'react'

const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info',
    persistent: false
  })

  const showToast = (message, type = 'info', persistent = false) => {
    setToast({
      show: true,
      message,
      type,
      persistent
    })
  }

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      show: false
    }))
  }

  return {
    toast,
    showToast,
    hideToast
  }
}

export default useToast