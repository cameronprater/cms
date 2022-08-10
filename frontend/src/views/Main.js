import React from 'react'
import LoginButton from '../components/LoginButton'
import { useUser } from '../contexts/UserContext'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import CustomerService from './CustomerService'
import ClinicalDirector from './ClinicalDirector'
import Therapist from './Therapist'
import Accounting from './Accounting'
import ReportingAssistant from './ReportingAssistant'
import Therapy from './therapy.jpg'
import Yoga from './yoga.jpeg'
import Banner from './banner-about.jpg'
import { useNavigate } from 'react-router-dom'

function Login() {

  const { isAuthenticated, user, isLoading } = useAuth0()
  const { currentUser, userLogin } = useUser()
  const namespace = 'http://localhost:8080/api/roles' //very dumb
  const role = localStorage.getItem('roles')

  useEffect(() => {
      if(currentUser.auth === false && isAuthenticated) {
        userLogin(user.name, user[namespace]) 
        localStorage.setItem('user', user.name)
        localStorage.setItem('roles', user[namespace])
        
      }
  }, [isAuthenticated])

  let navigate = useNavigate()

  const routeToAbout = () => {
    navigate('./about')
  }


  if(isLoading || currentUser.name !== undefined) {
    switch(role) {
      case 'customer-service':
        return (
          <CustomerService />
          )
      case 'clinical-director':
          return (
            <ClinicalDirector />
          )
      case 'therapist':
        return (
          <Therapist />
        )
      case 'accounting':
        return (
          <Accounting />
        )
      case 'reporting-assistant':
        return (
          <ReportingAssistant />
        )
    }
  }

  return (
    isAuthenticated|| (
      <>
    <header className='container'>
    <h1 className='header'>Check my Child Learning Tree</h1>
    <h2 className='header' style={{marginTop:'-0.6em'}}>Client Management System</h2>
    <h4 className='header'>You must login to proceed.</h4>
    <LoginButton />
    </header>
    <div className='container' style={{width:'55%', minWidth:'700px'}}>
            <h1 className='header'>Tentag Kami</h1>
            <div style={{display:'flex'}}>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center', flexDirection:'column'}}>
              <p>
              CMC Learning Tree adalah institusi tumbuh kembang anak yang memiliki visi peduli dan membantu agar anak mampu mencapai tumbuh kembang secara optimal.
  Kami menyediakan layanan secara holistik dan interdisiplin, dimana klien kami akan diobservasi dan mendapat intervensi dari berbagai aspek. Kami juga melibatkan orangtua (caregivers)sebagai partner kami dalam menerapkan program latihan untuk anak di rumah. Jadi terapi dapat diberikan secara berkelanjutan
              </p>
              <div>
                <button className='btn btn-warning' onClick={routeToAbout}>See more</button>
              </div>
            </div>
            <div>
              <img src={Banner} style={{borderRadius:'50%', width:'300px'}}/>
            </div>
            </div>
          </div>
    <h1 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>Terapi & Layanan Pendukung</h1>
    <div style={{display:'flex', justifyContent:'center'}}>
      <div className='container' style={{width:'25%',  margin:'1em', minWidth:'400px'}}>
        <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
        <img src={Therapy} style={{borderRadius:'30%', width:'150px'}}/>
            <h4>Terapi Perilaku & Edukasi</h4>
              <p>Terapi perilaku yang bertujuan untuk meningkatkan kemampuan kognitif, bahasa, imitasi, dan sosial-komunikasi anak dalam hidup sehari-hari</p>
              <p style={{margin:'0.1em'}}>Usia 2 - 10 Tahun : Terapi Infividu</p>
              <p>Usia 2 - 14 Tahun : Terapi Kelompok</p>
        </div>
      </div>
      <div className='container' style={{width:'25%',  margin:'1em', minWidth:'400px'}}>
      <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:'2em'}}>
        <div>
          <h4>Yoga Untuk Anak</h4>
        <p>
      Kami juga membuka kelas yoga untuk anak usia mulai dari 5 tahun hingga remaja, dimana latihan yoga initial
      </p>
      <p>
      dapat membantu anak merasa lebih tenang, relaks dan percaya diri.
      </p>
      <p style={{marginBottom:'0em'}}>
      Usia 5 Tahun - Remaja
      </p>
      <p>
      Setiap Sabtu Pk. 08.00 - 13.00 WIB
      </p>
        </div>
        <div style={{flexGrow:'2'}}>
          <img src={Yoga} style={{borderRadius:'10%', width:'150px'}}/>
        </div>
        </div>
      </div>
    </div>
    </>
    )
  )

}

export default Login