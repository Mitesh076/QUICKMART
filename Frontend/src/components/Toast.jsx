import React, { useEffect } from 'react'

const Toast = ({ message, type = 'info', show, onClose, duration = 1000, persistent = false }) => {
  useEffect(() => {
    if (show && onClose && !persistent) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, onClose, duration, persistent])

  if (!show) return null

  const toastClass = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info'
  }

  return (
    <div 
      className="position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1050 }}
    >
      <div className={`toast show ${toastClass[type]} text-white`} role="alert">
        <div className="toast-header">
          <strong className="me-auto">
            {type === 'success' && '✓ Success'}
            {type === 'error' && '✗ Error'}
            {type === 'warning' && '⚠ Warning'}
            {type === 'info' && 'ℹ Info'}
          </strong>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body">
          {message}
        </div>
      </div>
    </div>
  )
}

export default Toast