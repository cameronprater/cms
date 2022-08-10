import { React, useState, useEffect } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import './ViewCase.css'
import ShowFile from '../components/ShowFile'
import Comment from '../components/Comment'
import ModalButtonless from '../components/ModalButtonless'
import { useError } from '../contexts/ErrorContext'

function ViewCase() {

  const api = process.env.REACT_APP_API

  const role = localStorage.getItem('roles')

  const checkList = {
    'Customer Service': 'CUSTOMER_SERVICE',
    'Accounting': 'ACCOUNTING',
    'Clinical Director': 'CLINICAL_DIRECTOR',
    'Reporting Assistant': 'REPORTING_ASSISTANT',
    'Therapist': 'THERAPIST'
  }

  const [checked, setChecked] = useState([])

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

  const clearCheck = () => {
    setChecked([])
    setModalEditClose(false)
    setFileModal(false)
    setModalTrans(false)
    setCommentModal(false)
  }

  Object.entries(checkList).forEach(([key, value]) => {
    renderCheck.push(
      <div key={key}>
    <input key={key} value={value} type='checkbox' onChange={handleCheck} />
    <span>{key}</span>
    </div>
    )
  })


  const navigate = useNavigate()
  const { setError } = useError()

  const [ token, setToken ] = useState()

  const { getAccessTokenSilently, user } = useAuth0()
  const namespace = 'http://localhost:8080/api/roles'
  const { caseNumber } = useParams()

  const [state, setState] = useState({
    parentName: '',
    childName: '',
  })
  const [fileModal, setFileModal] = useState(false)
  const [commentModal, setCommentModal] = useState(false)
  const [ myCase, setCase ] = useState()
  const [ modalClose, setModalClose ] = useState(false)
  const [ modalEditClose, setModalEditClose ] = useState(false)
  const [ modalTrans, setModalTrans ] = useState(false)
  const [loading, setLoading] = useState(true)
  const [disabled, isDisabled ] = useState(false)
  const [commentState, setCommentState] = useState(false)

  const [fileState, setFileState] = useState({
    selectedFile: null,
    filename: null
  })
  const [fileDes, setFileDes] = useState()

  const fileSelectedHandler = (e) => {
    setFileState({
        selectedFile: e.target.files[0],
        filename: document.getElementById('file').value
    })

  }

  const handleFileDes = () => {
    setFileDes(document.getElementById('fileDescription').value)
  }


  useEffect(() => {
    getAccessTokenSilently()
    .then(token => {
      setToken(token)
      axios.get(api + '/cases/' + caseNumber, {
      headers: {
        'Authorization': 'Bearer ' + token 
      }
    })
      .then(res => {
        setCase(res.data)
        setLoading(false)
        console.log(res.data)
      })
      .catch(err => {
        setError('' + err)
        navigate('../')
      })
    })
    .catch(err => {
      setError('' + err)
      navigate('../')
    })

  },[])

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

function deHumanize(str) {
  if(str != null) {
  const arr = str.toLowerCase().split(' ')
  const result = []
  for(const word of arr)
    result.push(word.toUpperCase())
  return result.join('_')
}
return ''
}


const [trans, setTrans] = useState(null)

const handleTransChange = () => {
  setTrans(document.getElementById('transitions').value)
  console.log(trans)
}


  const caseStates = {
    RECOMMENDATION_PENDING: {
      transition: {
        PARENT_OUTREACH: 'clinical-director'
      }
    },
    PARENT_OUTREACH: {
      transition: {
        RECOMMENDATION_PENDING: 'clinical-director',
        PAYMENT_PENDING: 'customer-service'
      }
    },
    PAYMENT_PENDING: {
      transition: {
        PARENT_OUTREACH: 'customer-service',
        REPORT_PENDING: 'accounting',
        LOGBOOK_PENDING: 'accounting'
      }
    },
    REPORT_PENDING: {
      transition: {
        PAYMENT_PENDING: 'accounting',
        PARENT_OUTREACH: 'reporting-assistant'
      }
    },
    LOGBOOK_PENDING: {
      transition: {
        PARENT_OUTREACH: 'therapist'
      }
    }
  }
  
  const handleCommentChange = () => {
    setCommentState(document.getElementById('comments').value)
  }

  const availableTransitions = []

  if(myCase?.child?.id != null) {
    Object.entries(caseStates[myCase.state].transition).forEach(([key, value]) => {
      if(role == value) (
      availableTransitions.push(<option key={key} value={key}  onChange={handleTransChange}>{humanize(key)}</option>)
      )
    })
  }

  const closeCase = () => {
    isDisabled(true)
    axios.post(api + '/cases/' + caseNumber +'/close', '', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => {
      console.log(res)
      window.location.reload()
      setModalClose(false)
    })
    .catch(err => {
      setError('' + err)
      navigate('../')
    })
  }

  const caseEdit = (e) => {
    e.preventDefault()
    isDisabled(true)

    const jsonObj = {
      child: {
        name: state.childName,
        parent: {
          name: state.parentName
          }
      }
    }

    const json = JSON.stringify(jsonObj)

    axios.put(api + '/cases/' +
      myCase.child.id + '', json, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
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
  
  const handleChange = () => {
        
    setState({
        parentName: document.getElementById('parentName').value,
        childName: document.getElementById('childName').value,
    })
    console.log(state)
}

const handleCaseTransition = () => {
  console.log(trans)
  axios.post(api + '/cases/'
    + myCase.child.id + '/state/' + deHumanize(trans), '', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => {
      if(fileState.selectedFile != null) {
        let formData = new FormData()
                    formData.append('data', fileState.selectedFile)
                    formData.append('metadata', new Blob([JSON.stringify({
                        description: fileDes,
                        permissions: checked
                    })], { type: 'application/json' }))

                    console.log(formData)
                    axios.post(api + '/cases/'
                        + myCase.child.id + '/files', formData, {
                            headers: {
                                'Authorization': 'Bearer ' + token,
                                'Content-Type': 'multipart/form-data'
                            }
                        })
                        .then(fileRes => {
                            console.log(fileRes)
                            if(commentState.length == 0) {
                              window.location.reload()
                            }
                        })
                        .catch(fileErr => {
                            setError('' + fileErr)
                        })
                      }
      if(commentState.length > 0) {
        let commentJson = {
          'content': commentState,
          'permissions': checked
      }
      
      axios.post(api + '/cases/'
          + myCase.child.id + '/comments', commentJson, {
              headers: {
                  'Authorization': 'Bearer ' + token,
              }
          })
          .then(commRes => {
              console.log(commRes)
              window.location.reload()
          })
          .catch(commErr => {
              setError('' + commErr)
          })
      }
    })
    .catch(err => {
      setError('' + err)
      navigate('../')
    })
}

const fileUploadHandler = (e) => {
  e.preventDefault()
  isDisabled(true)
  let formData = new FormData()
                    formData.append('data', fileState.selectedFile)
                    formData.append('metadata', new Blob([JSON.stringify({
                        description: fileDes,
                        permissions: checked
                    })], { type: 'application/json' }))

                    console.log(formData)
                    axios.post(api + '/cases/'
                        + myCase.child.id + '/files', formData, {
                            headers: {
                                'Authorization': 'Bearer ' + token,
                                'Content-Type': 'multipart/form-data'
                            }
                        })
                        .then(fileRes => {
                            console.log(fileRes)
                            window.location.reload()
                        })
                        .catch(fileErr => {
                            setError('' + fileErr)
                        })
                }
                const commentCreateHandler = (e) => {
                  e.preventDefault()
                  isDisabled(false)
                  let commentJson = {
                    'content': commentState,
                    'permissions': checked
                  }
                  axios.post(api + '/cases/' + caseNumber
                    + '/comments', commentJson, {
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
  return (
    <>
    {loading ? (
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
        <Spinner animation='border' role='status' style={{margin:'5em'}}></Spinner>
      </div>
    ) : (
      <div className='content'>
        <div className='left'>
        <div className='caseContainer' style={{
          position:'relative',
          alignItems:'center',
          justifyContent:'center'
        }}>
          {user[namespace] =='customer-service' ? (
            <div style={{
              position:'absolute',
              bottom:'0',
              right:'0',
              margin:'0.5em'
            }}>
              <button className= 'btn btn-outline-primary' onClick={() => setModalEditClose(true)}>Edit Case Details</button>
              <button className='btn btn-danger' onClick={() => setModalClose(true)}>Close Case</button>
            </div>
          ) : (<></>)}
          <div style={{
            position:'absolute',
            top:'0',
            right:'0',
            margin:'0.5em',
          }}>
            <button className='btn btn-success'
            onClick={() => setModalTrans(true)}>Transition Case</button>
          </div>
          <div style={{
            position:'absolute',
            top:'10%'
          }}>
          <ul>
            <h1 className='header'>
            Case {myCase.child.id}</h1>
            <li>Child's name: {myCase.child.name}</li>
            <li>Parent's name: {myCase.child.parent.name}</li>
            <li>Current status: {humanize(myCase?.state)}</li>
            <li>Closed: {myCase.closed ? 'Yes' : 'No'}</li>
          </ul>
        </div>
        </div>

        <div className='fileContainer' style={{
          position:'relative'
        }}>
          <div style={{
              display:'flex',
              justifyContent:'center',
          }}>
            <div style={{
              position:'absolute',
              top:'0',
              right:'0',
              margin:'0.5em'
            }}>
              <button className='btn btn-outline-success' onClick={() => setFileModal(true)}>
                New File
              </button>
            </div>
            <h1 style={{
              margin:'1em',
              justifyContent:'center'
            }}>Files</h1>
            </div>
            {myCase.files.map((file, i) => <ShowFile caseFile={file} key={i}/>)}
        </div>
        </div>

        <div className='right'>  
        <div className='commentContainer'>
        <div style={{
              display:'flex',
              justifyContent:'center',
              position:'relative'
          }}>
            <h1 style={{
              margin:'1em',
              justifyContent:'center'
            }}>Comments</h1>
              <div style={{
              position:'absolute',
              top:'0',
              right:'0',
              margin:'0.5em'
            }}>
              <button className='btn btn-outline-success' onClick={() => setCommentModal(true)}>New Comment</button>
            </div>
            </div>
            {myCase.comments.map((comment, i) => <Comment comment={comment} key={i}/>)}
          </div>  
        </div>  
      </div>
  )}

    {/** Modal for closing case */}

    <ModalButtonless isOpen={modalClose}>
      <div className='body'>
        <h4>Are you sure you want to close the case?</h4>
        <div className='footer' style={{
          marginTop:'2em'
        }}>
        <button className='btn btn-outline-primary'
         onClick={() => setModalClose(false)}
         disabled={disabled ? true : false}>No</button>
        <button className='btn btn-danger'
         onClick={closeCase}
         disabled={disabled ? true : false}>Yes</button>
        </div>
      </div>
    </ModalButtonless>

    {/** Modal for editing case details */}

      <ModalButtonless isOpen={modalEditClose}>
      <div className='body'>
        <h4 style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center'
        }}>Edit case details</h4>
        <div className='footer' style={{
          marginTop:'2em'
        }}>
          <fieldset disabled={disabled ? true : false}>
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
                defaultValue={myCase?.child.parent.name}
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
              defaultValue={myCase?.child.name}
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
            <div style={{
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              marginTop:'0.5em'
            }}>
        <button className='btn btn-outline-primary' onClick={clearCheck}>Cancel</button>
        <button className='btn btn-primary' onClick={caseEdit}>Confirm</button>
            </div>

        </fieldset>
        </div>
      </div>
      </ModalButtonless>

      {/** Modal for changing case state */}
      <ModalButtonless isOpen={modalTrans}>
      <div className='body'>
        <h4 style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center'
        }}>Case {myCase?.child.id}</h4>
        <div style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center'
        }}>
          Current status: {humanize(myCase?.state)}
        </div>
        <div style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          marginTop:'1em',
        }}>
          <label style={{
            float:'left'
          }}>Available transitions</label>
          </div>
          <div style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
        }}>
          {availableTransitions[0] ? (
          <select id='transitions' onClick={handleTransChange}>
          {availableTransitions}
          </select>
          ) : (
            <div style={{
              marginTop:'0.2em',
              color:'red'
            }}>
              You cannot make changes.
            </div>
          )}
        </div>
        <div>
          <div style={{
            margin:'0.2em',
            alignItems:'start',
            border:'1px solid #0275d8',
            borderRadius:'5px',
          }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center'
          }}>Select permissions</div>
          {renderCheck}
          </div>
              <textarea
                type='textBox'
                name='comments'
                id='comments'
                placeholder='Comment'
                className='form-control'
                cols='40'
                rows='5'
                onChange={handleCommentChange}
                style={{
                    margin:'0em',
                    marginTop:'0.5em',
                    resize:'none'
                }}
                />
      </div>

      <fieldset disabled={disabled ? true : false}>
          <div style={{
          justifyContent:'center',
          alignItems:'center',
          display:'flex',
          border:'1px solid #0275d8',
          borderRadius:'5px',
          marginTop:'0.5em'
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

        <button className='btn btn-outline-primary'
         onClick={clearCheck}
         disabled={disabled ? true : false}>Cancel</button>
        <button className='btn btn-primary'
         disabled={(trans != null) ? false : true} onClick={handleCaseTransition}>Confirm changes</button>
        </div>
      </div>
      </ModalButtonless>

        {/** Modal for new file */}
        <ModalButtonless isOpen={fileModal}>
        <div className='body'>
        <h4 style={{
          display:'flex',
          justifyContent:'center',
          alignItems:'center'
        }}>Create New File</h4>
          <fieldset disabled={disabled ? true : false}>
          <div>
          <div style={{
            margin:'0.2em',
            alignItems:'start',
            border:'1px solid #0275d8',
            borderRadius:'5px',
          }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center'
          }}>Select permissions</div>
          {renderCheck}
          </div>
          </div>
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
        <button className='btn btn-outline-primary' onClick={clearCheck}
          disabled={disabled ? true : false}>Cancel</button>
        <button className='btn btn-primary' onClick={fileUploadHandler}
          disabled={disabled ? true : false}>Create File</button>
        </div>
      </div>
        </ModalButtonless>
        
        {/** Modal for new Comment */}
        <ModalButtonless isOpen={commentModal}>
        <div className='body'>
        <h4 style={{
          display:'flex',
          justifyContent:'center',
          alignItems:'center'
        }}>Create Comment</h4>
          <fieldset disabled={disabled ? true : false}>
            
          <div>
          <div style={{
            margin:'0.2em',
            alignItems:'start',
            border:'1px solid #0275d8',
            borderRadius:'5px',
          }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center'
          }}>Select permissions</div>
          {renderCheck}
          </div>
          </div>

          <div style={{
          justifyContent:'center',
          alignItems:'center',
          display:'flex',
        }}>
          <textarea
                type='textBox'
                name='comments'
                id='comments'
                placeholder='Comment'
                className='form-control'
                cols='40'
                rows='5'
                onChange={handleCommentChange}
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
        <button className='btn btn-outline-primary' onClick={clearCheck}
          disabled={disabled ? true : false}>Cancel</button>
        <button className='btn btn-primary' onClick={commentCreateHandler}
          disabled={disabled ? true : false}>Create Comment</button>
        </div>
        </div>
        </ModalButtonless>
    </>
  )
}

export default withAuthenticationRequired(ViewCase, {
  onRedirecting: () => <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', paddingTop:'100px'}}><Spinner animation='border' role='status'></Spinner></div>,
})