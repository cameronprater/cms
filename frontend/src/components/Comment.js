import React, { useEffect, useState } from 'react'
import { useSpring, animated } from 'react-spring'
import useMeasure from 'react-use-measure'
import styled from 'styled-components'
import edit from '../components/pencil-square.svg'
import trash from '../components/trash-fill.svg'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'
import ModalButtonless from './ModalButtonless'
import { useError } from '../contexts/ErrorContext'
import { useNavigate } from 'react-router-dom'
import '../views/ViewCase.css'

const PanelContent = styled(animated.div)`
border-top: none;
padding: 0 20px;
background-color: gainsboro;
overflow: hidden;
position: relative;
`

const PanelContentInner = styled.div`
  padding: 20px 0;
`
function Comment(comment) {
  const api = process.env.REACT_APP_API

  const caseNumber = window.location.href.split('cases/')[1]

  const [state, setState] = useState({
    comments: comment.comment.content
  })

  let navigate = useNavigate()
  const { setError } = useError()
  const { getAccessTokenSilently } = useAuth0()
  const [token, setToken ] = useState()

  const [disabled, isDisabled] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    getAccessTokenSilently()
    .then(res => {
      setToken(res)
    })
    .catch(err => {
      setError('' + err)
      navigate('../')
    })

  })

  const [isCollapsed, setIsCollapsed ] = useState(true)

  const [ref, bounds] = useMeasure()
  
  const toggleWrapperAnimatedStyle = useSpring({
    backgroundColor: isCollapsed ? 'gainsboro' : '#1266F1',
    color: isCollapsed ? 'black' : 'white'
  })
  
  const panelContentAnimatedStyle = useSpring({
    height: isCollapsed ? 0 : bounds.height
  })
  
  const togglePanel = () => {
    setIsCollapsed(prevState => !prevState)
  }


  const handleChange = () => {
    setState({
      comments: document.getElementById('comments').value
    })
  }

  const commentEditHandler = (e) => {
    e.preventDefault()
    isDisabled(false)
    let commentJson = {
      'content': state.comments,
      'permissions': []
    }
    axios.put(api + '/cases/' + caseNumber
      + '/comments/' + comment.comment.id, commentJson, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => {
        console.log('worked')
        window.location.reload()
      })
      .catch(err => {
        setError('' + err)
        navigate('../') 
      })

  }

  const commentDeleteHandler = () => {
    isDisabled(false)
    axios.delete(api + '/cases/' + caseNumber
      + '/comments/' + comment.comment.id, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => {
        console.log('worked')
        window.location.reload()
      })
      .catch(err => {
        setError('' + err)
        navigate('../')
      })

  } 

  function humanize(str) {
    if(str != null) {
    const arr = str.toLowerCase().split('_')
    const result = []
    for(const word of arr)
      result.push(word.charAt(0).toUpperCase() + word.slice(1))
    return result.join(' ')
  }
  return ''
}

  return (
    <div className='comment'>
      <animated.div className='headerdiv' style={toggleWrapperAnimatedStyle}>
      <div style={{
        cursor:'pointer'
      }}
      onClick={togglePanel}>
        <div style={{
          marginLeft:'1em'
        }}>
        Author: {comment.comment.author.name}
        </div>

        <div style={{
          position:'absolute',
          right:'0',
          top:'0',
          marginRight:'1em'
        }}>
          Email: {comment.comment.author.email}
        </div>
        </div>
      <PanelContent style={panelContentAnimatedStyle}>
        <PanelContentInner ref={ref}>
          <div style={{
            color:'black'
          }}>
          Viewable by: {comment.comment.permissions.map((permission, i) =>
          <>
            {i==0 ? humanize(permission) : ', ' + humanize(permission)} 
          </>)}
          </div>
          <div style={{
            color:'black'
          }}>
          Comment: {comment.comment.content}
          </div>
          <div style={{
            color:'black'
          }}>
          Comment ID: {comment.comment.id}
          </div>
          <div style={{
            color:'black'
          }}>
          Created on: {comment.comment.timestamp.substring(0,10)}
          <div style={{
          position:'absolute',
          top:'5%',
          right:'1.5%',
          cursor:'pointer'
        }}>
          <img src={edit} style={{
            marginRight:'0.2em'
          }} onClick={() => setEditModal(true)} />
          <img src={trash} onClick={() => setDeleteModal(true)} />
        </div>
          </div>
          
      </PanelContentInner>
        </PanelContent>
      </animated.div>

      {/** Modal to edit comment */}
      <ModalButtonless isOpen={editModal}>
      <div className='body'>
        <h4 style={{
          display:'flex',
          justifyContent:'center',
          alignItems:'center'
        }}>Edit Comment</h4>
        <br />
        <div style={{
          marginTop:'-1.5em',
          justifyContent:'center',
          alignItems:'center',
          display:'flex'
        }}>Only the comment creator can edit it.</div>
          <fieldset disabled={disabled ? false : true}>
          <div style={{
          justifyContent:'center',
          alignItems:'center',
          display:'flex',
        }}>

          <textarea
                defaultValue={comment.comment.content}
                type='textBox'
                name='comments'
                id='comments'
                placeholder='Comment'
                className='form-control'
                cols='40'
                rows='5'
                onChange={handleChange}
                style={{
                    margin:'0em',
                    marginTop:'0.2em',
                    resize:'none'
                }}
                />

          </div>
          </fieldset>
          <div className='footer' style={{
          marginTop:'2em'
        }}>
        <button className='btn btn-outline-primary' onClick={() => setEditModal(false)}
          disabled={disabled ? false : true}>Cancel</button>
        <button className='btn btn-primary' onClick={commentEditHandler}
          disabled={disabled ? false : true}>Finish Edit</button>
        </div>
        </div>
      </ModalButtonless>

          {/** Modal to delete comment */}

    <ModalButtonless isOpen={deleteModal}>
      <div className='body'>
        <h4>Are you sure you want to delete the comment?</h4>
        <br />
        <h5 style={{
          marginTop:'-1em',
          justifyContent:'center',
          alignItems:'center',
          display:'flex'
        }}>Only the comment creator can delete it.</h5>
        <div className='footer' style={{
          marginTop:'2em'
        }}>
        <button className='btn btn-outline-primary' onClick={() => setDeleteModal(false)}>No</button>
        <button className='btn btn-danger' onClick={commentDeleteHandler}>Yes</button>
        </div>
      </div>
    </ModalButtonless>

      </div>
  )
}

export default Comment