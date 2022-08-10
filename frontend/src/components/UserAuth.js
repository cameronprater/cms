import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect } from 'react'
import { Dropdown, Navbar, NavDropdown } from 'react-bootstrap'
import { useUser } from '../contexts/UserContext'
import { useNavigate } from 'react-router'

function UserAuth() {
    //everything in here is dumb
    const { logout } = useAuth0()
    const { currentUser, userLogout } = useUser()
    let username = localStorage.getItem('user')
    let navigate = useNavigate()

    const routeToProfile = () => {
        let path = '/profile'
        navigate(path)
    }

    function myLogout() {
        logout()
        userLogout()
        localStorage.removeItem('user')
        localStorage.removeItem('roles')
    }

    useEffect(() => {
        if(localStorage.getItem('user') !== undefined)
            username = localStorage.getItem('user')

    },[currentUser])

    const UserGreeting = () => {
        if(username !== null) {
            return (
                <div style={{display:'flex', flexDirection:'row'}}>
                <Navbar.Text className='ms-auto'>Signed in as:</Navbar.Text> 
                <NavDropdown title={username} id='user-dropdown' menuVariant='light'>
                <NavDropdown.Item onClick={routeToProfile}>Profile</NavDropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => myLogout()}>Sign out</Dropdown.Item>
                </NavDropdown>
                </div>
                )
            }

            return (
                <></>
            )
        }

    
        return <UserGreeting/>

    
}

export default UserAuth;