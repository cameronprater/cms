import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useError } from '../contexts/ErrorContext'

function NotFound() {
    const { setError } = useError()
    const navigate = useNavigate()

useEffect(() => {
    setError('Error: 404 Not Found')
    navigate('../')
})

  return (
  <></>
  )
}

export default NotFound