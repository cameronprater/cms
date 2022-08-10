import React from 'react'
import { useNavigate } from 'react-router-dom'

function Therapist() {

    let navigate = useNavigate()
    const routeToCases = () => {
        let path = 'cases'
        navigate(path)
    }

  return (
    <header className='container'>
    <h1 className='header'>Therapist Actions</h1>
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
    <button className='btn btn-primary' style={{width: 200}} onClick={routeToCases}>View Cases</button>
    </div>
    </header>
  )
}

export default Therapist