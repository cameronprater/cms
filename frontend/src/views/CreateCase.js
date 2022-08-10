import {React, useEffect, useState} from 'react'
import axios from 'axios'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import Modal from '../components/Modal'
import { useNavigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useUser } from '../contexts/UserContext'
import { useError } from '../contexts/ErrorContext'

function CreateCase() {

    const api = process.env.REACT_APP_API

    let navigate = useNavigate()

    const [checked, setChecked] = useState([])

    const checkList = {
        'Customer Service': 'CUSTOMER_SERVICE',
        'Accounting': 'ACCOUNTING',
        'Clinical Director': 'CLINICAL_DIRECTOR',
        'Reporting Assistant': 'REPORTING_ASSISTANT',
        'Therapist': 'THERAPIST'
      }

    const renderCheck = []
  
    const handleCheck = (e) => {
      var updatedList = [...checked]
      if(e.target.checked) {
        updatedList = [...checked, e.target.value]
      } else {
        updatedList.splice(checked.indexOf(e.target.value), 1)
      }
      setChecked(updatedList)
      console.log(checked)
    }
  
    Object.entries(checkList).forEach(([key, value]) => {
      renderCheck.push(
        <>
      <input key={key} value={value} type='checkbox' onChange={handleCheck}
        style={{
            marginLeft:'0.5em'
        }} />
      <span>{key}</span>
      </>
      )
    })

    const { setError } = useError()

    const { getAccessTokenSilently } = useAuth0()
    const [token, setToken] = useState()
    const [ modalOpen, setModalOpen ] = useState(false)
    const [ fileErrorText, setFileErrorText ] = useState('')
    const [ commentErrorText, setCommentErrorText ] = useState('')
    const [ myCase, setCase ] = useState()
    const [ spinner, setSpinner ] = useState(false)
    const [ fileDescription, setFileDescription ] = useState()

    getAccessTokenSilently().then(function(result) {
        setToken(result)
    })

    const onModalClose = () => {
        setModalOpen(false)
        navigate('../')
    }

    const [state, setState] = useState({
        parentName: '',
        childName: '',
        comments: ''
    })

    const [fileState, setFileState] = useState({
        selectedFile: null,
        filename: null
    })

    const [isDisabled, setDisabled] = useState(false)

    const [buttonDisabled, setButtonDisabled ] = useState(true)

    const handleChange = () => {
        
        setState({
            parentName: document.getElementById('parentName').value,
            childName: document.getElementById('childName').value,
            comments: document.getElementById('comments').value
        })
        if(document?.getElementById('fileDescription')?.value != null) {
            setFileDescription(document.getElementById('fileDescription').value)
        }
    }

    useEffect(() => {
        if(state.parentName.length > 1 && state.childName.length > 1) {
            setButtonDisabled(false)
        }
        else {
            setButtonDisabled(true)
        }
    },[state])

    const fileSelectedHandler = (e) => {
        setFileState({
            selectedFile: e.target.files[0],
            filename: document.getElementById('file').value
        })

    }

    const fileUploadHandler = (e) => {
        e.preventDefault()

        setDisabled(true)
        setSpinner(true)

        const jsonObj = {
            child: {
                name: state.childName,
                parent: {
                    name: state.parentName
                }
            }
        }

        const json = JSON.stringify(jsonObj)

        let resultCase = null

        axios.post(api + '/cases', json, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        })
            .then (res => {
                console.log(res.data.child)
                setCase(res.data)
                if(fileState.selectedFile != null) {
                    let formData = new FormData()
                    formData.append('data', fileState.selectedFile)
                    formData.append('metadata', new Blob([JSON.stringify({
                        description: fileDescription,
                        permissions: checked
                    })], { type: 'application/json' }))

                    console.log(formData)
                    axios.post(api + '/cases/'
                        + res.data.child.id + '/files', formData, {
                            headers: {
                                'Authorization': 'Bearer ' + token,
                                'Content-Type': 'multipart/form-data'
                            }
                        })
                        .then(fileRes => {
                            console.log(fileRes)
                        })
                        .catch(fileErr => {
                            console.log('File error ' + fileErr)
                            setFileErrorText('ERROR: Could not create file.')
                        })
                }

                if(state.comments.length > 0) {
                    let commentJson = {
                        'content': state.comments,
                        'permissions': checked
                    }
                    
                    axios.post(api + '/cases/'
                        + res.data.child.id + '/comments', commentJson, {
                            headers: {
                                'Authorization': 'Bearer ' + token,
                            }
                        })
                        .then(commRes => {
                            console.log(commRes)
                        })
                        .catch(commErr => {
                            console.log('Comment error ' + commErr)
                            setCommentErrorText('ERROR: Could not create comment.')
                        })
                }
                

                setSpinner(false)
                setModalOpen(true)
            })
            .catch(err => {
                setError('' + err)
                navigate('../')
            })
    }

  return (
    <>
    <Modal isOpen={modalOpen} onClose={onModalClose} btnText="Main Menu"
        btnClassName='btn btn-primary'>
        <div style={{
            top:'0',
            width:'80%',
            display:'flex',
            flexDirection:'column',
            position:'relative'
        }}>
            <h4>Case created.</h4>
            <hr />
            <div style={{
                color:'red',
                marginbottom:'0.5em'
            }}>
                {fileErrorText}
                <br/>
                {commentErrorText}
            </div>
            <h5 style={{
                justifyContent:'center',
                alignItems:'center',
                display:'flex',
                marginBottom:'1em'
            }}>Case {myCase?.child.id}:</h5>
            Child's name: {myCase?.child.name}
            <br />
            Parent's Name: {myCase?.child.parent.name}
            <div style={{
            bottom:'0%',
            alignItems:'center',
            justifyContent:'center',
            display:'flex',
            position:'absolute',
            bottom:'8%',
            right:'33%'
        }}><button className='btn btn-outline-primary' onClick={() => navigate('../cases/'
            + myCase.child.id)}>View Case</button>

        </div>
        </div>
    </Modal>
    <fieldset disabled={isDisabled ? true : false}>
    <header className='container'>
        <h1 className='header' style={{marginTop:'-0.5em'}}>Create Case</h1>
        <form encType='multipart/form'>
        <div style={{
            display: 'flex',  
            alignItems:'center', 
            justifyContent:'center',
            marginTop:'-0.5em',
            }}>
            <div style={{
                float:'left'
            }}>
            <label style={{
                marginLeft:'0.2em'
            }}>Parent's Name</label>
            <input
                type='text'
                name='parentName'
                id='parentName'
                placeholder="Parent's Name"
                className='form-control'
                style={{
                    margin:'0em',
                }}
                onChange={handleChange}
            />
            </div>
            <div style={{
                float:'right',
                marginLeft:'0.5em'
            }}>
            <label
            style={{
                marginLeft:'0.2em'
            }}>Child's Name</label>
            <input
                type='text'
                name='childName'
                id='childName'
                placeholder="Child's Name"
                onChange={handleChange}
                className='form-control'
                style={{
                    margin:'0em',
                }}
            />
            </div>
            </div>
            
          <div>
        <div style={{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
        }}>
          <div style={{
            margin:'0.2em',
            alignItems:'center',
            border:'1px solid #0275d8',
            borderRadius:'5px',
            backgroundColor:'white',
            justifyContent:'center'
          }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            marginTop:'0.5em',
          }}>Select permissions for File/Comment</div>
          {renderCheck}
          </div>
          </div>
          </div>
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
                }}>Comments</label>
            </div>

            <div style={{
                display:'flex',
                justifyContent:'center',
                alignItems:'center'
            }}>
            <textarea
                type='textBox'
                name='comments'
                id='comments'
                placeholder='Comments'
                className='form-control'
                cols='40'
                rows='5'
                onChange={handleChange}
                style={{
                    margin:'0em',
                    width:'50%',
                    resize:'none'
                }}
                />
                </div>

            <div style={{
                display: 'flex',  
                alignItems:'center', 
                justifyContent:'center',
            }}>
            <div style={{
                bottom:'0',
            }}>
            <input
                type='file'
                accept='.pdf'
                name='file'
                id='file'
                placeholder="Upload your PDF"
                style={{
                    margin:'0.5em'}}
                className='form-control-file'
                onChange={fileSelectedHandler}
            />
            </div>
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
                type='textBox'
                name='fileDescription'
                id='fileDescription'
                placeholder='File Description'
                className='form-control'
                cols='20'
                rows='3'
                onChange={handleChange}
                style={{
                    margin:'0em',
                    width:'50%',
                    resize:'none'
                }}
                />
                </div>
                </>
            ) : (
            <>
            </>

            )}
        </form>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop:'0.5em'}}>
            {/** Add PDF preview soon with animation, too bulky to display in main component */}
        </div>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop:'0.5em',}}>
            <button 
            className='btn btn-primary' 
            style={{width: '200px'}} 
            onClick={fileUploadHandler}
            disabled={buttonDisabled}
            >{spinner ?
                <Spinner animation='border' role='status' size='sm'></Spinner>
                :
                'Submit'}</button>
        </div>
    </header>
    </fieldset>
    </>
  )
}

export default withAuthenticationRequired(CreateCase, {
    onRedirecting: () => <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', paddingTop:'100px'}}><Spinner animation='border' role='status'></Spinner></div>,
  });