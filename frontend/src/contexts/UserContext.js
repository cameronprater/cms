import React, { useContext, useState } from 'react'

const UserContext = React.createContext()

export function useUser() {
    return useContext(UserContext)
}

export const UserProvider = ({ children }) => {

    const [currentUser, setCurrentUser] = useState({name: undefined, auth: false, roles: undefined})

    const userLogin = (name, role) => {
        setCurrentUser(() => ({
            name: name,
            auth: true,
            roles: role
        }))
    }

    const userLogout = () => {
        setCurrentUser(() => ({
            name: undefined,
            auth: false,
            roles: undefined
        }))
    }

    return (
        <UserContext.Provider value={{ currentUser, userLogin, userLogout }}>
            {children}
        </UserContext.Provider>
    )
}