import React from 'react'
import { useNavigate } from 'react-router-dom'

function CustomerService() {

    let navigate = useNavigate()
    const routeToCases = () => {
        let path = 'cases'
        navigate(path)
    }
    const routeToCreate = () => {
        let path = 'create-case'
        navigate(path)
    }

  return (
    <header className='container'>
    <h1 className='header'>Customer Service Actions</h1>
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
    <button className='btn btn-primary' style={{width: 200}} onClick={routeToCases}>View Cases</button>
    <button className='btn btn-primary' style={{width: 200}} onClick={routeToCreate}>Create Case</button>
    </div>
    </header>
  )
}

export default CustomerService