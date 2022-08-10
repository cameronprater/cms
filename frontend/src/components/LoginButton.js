import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

function LoginButton() {
    const { loginWithRedirect } = useAuth0()

  return (
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
    <button onClick={loginWithRedirect} className='btn btn-primary' style={{ width: 250 }}>
            Sign in
            </button>
    </div>
  )
}

export default LoginButton