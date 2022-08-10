import React from 'react'
import { Spinner } from 'react-bootstrap'

import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'

const Profile = () => {
  const { user } = useAuth0();
  const { name, picture, email } = user;
  const role = localStorage.getItem('roles')

  function humanize(str) {
    if(str != null) {
    const arr = str.toLowerCase().split('-')
    const result = []
    for(const word of arr)
      result.push(word.charAt(0).toUpperCase() + word.slice(1))
    return result.join(' ')
  }
  return ''
}

  return (
    <div className='container'>
      <div style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        marginTop:'2em'
      }}>
          <img
            src={picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture"
          />
          <div style={{
            marginTop:'1.2em'
          }}>
          <h2>{name}</h2>
          <p className="lead text-muted" style={{
            justifyContent:'center',
            alignItems:'center',
            display:'flex'
          }}>{email}</p>
          <p className='lead text-muted'  style={{
            justifyContent:'center',
            alignItems:'center',
            display:'flex',
            marginTop:'-1em'}}>
            Role: {humanize(role)}
          </p>
          </div>
      </div>
    </div>
  );
};

export default withAuthenticationRequired(Profile, {
  onRedirecting: () => <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', paddingTop:'100px'}}><Spinner animation='border' role='status'></Spinner></div>,
});