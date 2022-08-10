import { React, useEffect } from 'react'
import NavBar from './components/NavBar'
import Main from './views/Main'
import Profile from './components/Profile'
import { UserProvider } from './contexts/UserContext'
import { ErrorProvider, useError } from './contexts/ErrorContext'
import { Auth0Provider } from '@auth0/auth0-react'
import ViewCase from './views/ViewCase'
import ViewAllCases from './views/ViewAllCases'
import CreateCase from './views/CreateCase'
import ErrorInlet from './components/ErrorInlet'

import {
  Routes,
  Route,
  Link,
  BrowserRouter,
} from "react-router-dom"

import 'bootstrap/dist/css/bootstrap.css'
import NotFound from './views/NotFound'
import About from './views/About'
import Therapy from './views/Therapy'
import Help from './views/Help'

const domain = process.env.REACT_APP_AUTH0_DOMAIN
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
const audience = process.env.REACT_APP_AUDIENCE

function App() {

  const username = localStorage.getItem('user')
  const roles = localStorage.getItem('roles')
  let auth = false

  if(username !== null) {
    auth = true
  }

  return (
    <div>
    <ErrorProvider>
    <UserProvider value={{username, auth, roles}}>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      audience={audience}
      redirectUri={window.location.origin}>
        <BrowserRouter>
        <ErrorInlet/>
        <NavBar/>
        <Routes>
          <Route path ='*' element={<NotFound />}/>
          <Route path='/' element={<Main />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/cases' element={<ViewAllCases />}/>
          <Route path='cases/:caseNumber' element={<ViewCase />}/>
          <Route path='/about' element={<About />}/>
          <Route path='/therapy' element={<Therapy />}/>
          <Route path='/help' element={<Help />}/>
          <Route path='/create-case' element={<CreateCase />}/>
          {/**<Route path='/api-test' element={<ApiTest />}/>
           * Uncomment to enable api-test component **/}
          </Routes>
          </BrowserRouter> 

      </Auth0Provider>
      </UserProvider>
      </ErrorProvider>
      </div>
  );
}

export default App;
