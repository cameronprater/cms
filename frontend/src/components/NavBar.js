import React, { useCallback } from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import logo from './logo.png'
import 'bootstrap/dist/css/bootstrap.css'
import './NavBar.css'
import UserAuth from './UserAuth'
import { useNavigate } from 'react-router-dom'

function NavBar() {

    let navigate = useNavigate()
    const routeToMain = (nav) => {
        let path = nav
        navigate(path)
    }

    //Warning: trash below.
    const NavBar = useCallback(() => {
    return (
        <Navbar bg='light' variant='light' expand='light'>
            <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
            <Navbar.Brand>
                <img alt='logo' className='logo' src={logo} style={{width:'227px', height:'70px', marginTop:'-0.5em'}}/>
                </Navbar.Brand>
                <div style={{display:'flex', justifyContent:'center', alignSelf:'center', position:'absolute', width:'100%'}}>
                <div style={{paddingRight:'1.5%', marginTop:'-0.6em'}}>
                    <Nav>
                    <Nav.Link onClick={() => routeToMain('/')}>Home</Nav.Link>
                    </Nav>
                </div>
                <div  style={{paddingRight:'1.5%', marginTop:'-0.6em'}}>
                    <Nav>
                    <Nav.Link onClick={() => routeToMain('../about')}>About</Nav.Link>
                    </Nav>
                </div>
                <div  style={{paddingRight:'1.5%', marginTop:'-0.6em'}}>
                    <Nav>
                    <Nav.Link onClick={() => routeToMain('../therapy')}>Therapy</Nav.Link>
                    </Nav>
                </div>
                <div style={{marginTop:'-0.6em'}}>
                <Nav>
                <Nav.Link onClick={() => routeToMain('../help')}>Help</Nav.Link>
                </Nav>
                </div>
                 </div>
                <div style={{paddingTop:'0.6em'}}>
                    <UserAuth />
                </div>
                </div>
            </Navbar>
        )
    }
    )

    return <NavBar />
}

export default NavBar