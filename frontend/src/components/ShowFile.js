import React, { useEffect, useState } from 'react'
import {useSpring, animated} from 'react-spring'
import useMeasure from 'react-use-measure'
import styled from 'styled-components'
import download from '../components/download.svg'
import edit from '../components/pencil-square.svg'
import trash from '../components/trash-fill.svg'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'
import ModalButtonless from './ModalButtonless'
import { useError } from '../contexts/ErrorContext'
import { useNavigate } from 'react-router-dom'

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

function ShowFile( caseFile ) {
  const api = process.env.REACT_APP_API

  const { setError } = useError()
  let navigate = useNavigate()

  const { getAccessTokenSilently } = useAuth0()
  const [token, setToken ] = useState()

  const caseNumber = window.location.href.split('cases/')[1]

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

  const [ deleteModal, setDeleteModal ] = useState(false)
  const [ editModal, setEditModal ] = useState(false)

  const [isCollapsed, setIsCollapsed] = useState(true)

  const [ref, bounds] = useMeasure()

  const [disabled, isDisabled] = useState(true)

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

  const [fileState, setFileState] = useState({
    selectedFile: null,
    filename: null
  })
  const [fileDes, setFileDes] = useState()

  const handleFileDes = (e) => {
    if(document?.getElementById('fileDescription')?.value != null) {
      setFileDes(document.getElementById('fileDescription').value)
    }
  }

  const fileSelectedHandler = (e) => {
    setFileState({
        selectedFile: e.target.files[0],
        filename: document.getElementById('file').value
    })

  }

  const fileDownloadHandler = () => {
    axios.get(api + '/cases/' + caseNumber +
      '/files/' + caseFile.caseFile.id, {
        responseType: 'blob',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', caseFile.caseFile.name + '.pdf')
        document.body.appendChild(link)
        link.click()
        console.log(res)
      })
      .catch(err => {
        setError('' + err)
        navigate('../')
      })
  }

  const fileDeleteHandler = () => {
    isDisabled(false)
    axios.delete(api + '/cases/' + caseNumber +
      '/files/' + caseFile.caseFile.id, {
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

  const fileEditHandler = () => {
    isDisabled(false)
    let formData = new FormData()
    formData.append('data', fileState.selectedFile)
    formData.append('metadata', new Blob([JSON.stringify({
      description: fileDes,
      permissions: []
    })], { type: 'application/json' }))

    axios.put(api + '/cases/' + caseNumber +
      '/files/' + caseFile.caseFile.id, formData, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(res => {
        window.location.reload()
      })
      .catch(err => {
        setError('' + err)
        navigate('../')
      })
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
      Author: {caseFile.caseFile.author.name}
      </div>
      <div style={{
        position:'absolute',
        top:'0',
        right:'0%',
        marginRight:'1em'
      }}>
        File name: {caseFile.caseFile.name.substring(0,20)}{caseFile.caseFile.name.length >= 20 && '...pdf'}
      </div>
      </div>
      <PanelContent style={panelContentAnimatedStyle}>
        <PanelContentInner ref={ref}>
        <div style={{
          color:'black',
        }}>Viewable by: {caseFile.caseFile.permissions.map((permission, i) =>
          <>
            {i==0 ? humanize(permission) : ', ' + humanize(permission)} 
          </>)}
          </div>
          <div style={{
            color:'black',
          }}>
          File description: {caseFile.caseFile.description}
        </div>
        <div style={{
          color:'black',
        }}>
          File ID: {caseFile.caseFile.id}
        </div>
        <div style={{
          color:'black',
        }}>
          Created on: {caseFile.caseFile.timestamp.substring(0,10) /** Fix at some point */}
        </div>
        <div style={{
          position:'absolute',
          bottom:'20%',
          right:'6%',
          cursor:'pointer',
        }}>
          <img src={download} width='40px' height='40px' onClick={fileDownloadHandler}></img>
        </div>
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
        </PanelContentInner>
      </PanelContent>
    </animated.div>

    {/** Modal to delete file */}

    <ModalButtonless isOpen={deleteModal}>
      <div className='body'>
        <h4>Are you sure you want to delete the file?</h4>
        <br />
        <h5 style={{
          marginTop:'-1em',
          justifyContent:'center',
          alignItems:'center',
          display:'flex'
        }}>Only the file creator can delete it.</h5>
        <div className='footer' style={{
          marginTop:'2em'
        }}>
        <button className='btn btn-outline-primary' onClick={() => setDeleteModal(false)}>No</button>
        <button className='btn btn-danger' onClick={fileDeleteHandler}>Yes</button>
        </div>
      </div>
    </ModalButtonless>

    {/** Modal to edit file */}

    <ModalButtonless isOpen={editModal}>
    <div className='body'>
        <h4 style={{
          display:'flex',
          justifyContent:'center',
          alignItems:'center'
        }}>Edit File</h4>
        <br />
        <div style={{
          marginTop:'-1.5em',
          justifyContent:'center',
          alignItems:'center',
          display:'flex'
        }}>Only the file creator can edit it.</div>
          <fieldset disabled={disabled ? false : true}>
          <div style={{
          justifyContent:'center',
          alignItems:'center',
          display:'flex',
          border:'1px solid #0275d8',
          borderRadius:'5px'
        }}>
          <input
                type='file'
                accept='.pdf'
                name='file'
                id='file'
                style={{
                    margin:'0.5em'}}
                className='form-control-file'
                onChange={fileSelectedHandler}
            />
            </div>

            {fileState.selectedFile ? (
            <>
            <div style={{
                display:'flex',
                justifyContent:'center',
                alignItems:'center'
            }}>
                <label
                style={{
                    margin:'0.5em',
                    marginBottom:'0em',
                    float:'left'
                }}>File Description</label>
            </div>

            <div style={{
                display:'flex',
                justifyContent:'center',
                alignItems:'center'
            }}>
            <textarea
                defaultValue={caseFile.caseFile.description}
                type='textBox'
                name='fileDescription'
                id='fileDescription'
                placeholder='File Description'
                className='form-control'
                cols='20'
                rows='3'
                onChange={handleFileDes}
                style={{
                    margin:'0em',
                    resize:'none'
                }}
                />
                </div>
                </>
            ) : (
            <>
            </>

            )}
          </fieldset>
        <div className='footer' style={{
          marginTop:'2em'
        }}>
        <button className='btn btn-outline-primary' onClick={() => setEditModal(false)}
          disabled={disabled ? false : true}>Cancel</button>
        <button className='btn btn-primary' onClick={fileEditHandler}
          disabled={disabled ? false : true}>Finish Edit</button>
        </div>
      </div>
    </ModalButtonless>
    </div>
  )
}

export default ShowFile