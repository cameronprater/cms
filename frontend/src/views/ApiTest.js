import { React, useState } from 'react'
import axios from 'axios'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import { Spinner } from 'react-bootstrap'

function ApiTest() {

    const { getAccessTokenSilently } = useAuth0()
    const [token, setToken] = useState()

    getAccessTokenSilently().then(function(result) {
        setToken(result)
    })

    const [state, setState] = useState({
        htmlMethods: '',
        toReturn: '',
        apiUrl: process.env.REACT_APP_API
    })

    const [returnMessage, setReturn] = useState("this is where the return message goes")

    const [fileState, setFileState] = useState({
        selectedFile: null
    })

    const [isFileOrComment, setFileOrComment] = useState()
    //true: file, false: comment

    const handleChange = () => {
        setState({
            htmlMethods: document.getElementById('htmlMethods').value,
            toReturn: document.getElementById('toReturn').value,
            apiUrl: process.env.REACT_APP_API+document.getElementById('apiUrl').value,
        })
        console.log(state)
    }

    const fileSelectedHandler = (e) => {
        setFileState({
            selectedFile: e.target.files[0]
        })

    }

    const fileUploadHandler = (e) => {
        e.preventDefault()
        /**axios.put and post requests should serialize javascript objects
        into JSONs and put the appropriate header in
        **/
        switch (state.htmlMethods) {
            case 'PUT':
                if(isFileOrComment) {
                    //is file
                    let formData = new FormData()
                    formData.append('data', fileState.selectedFile)
                    formData.append('metadata', new Blob([JSON.stringify({
                        description: 'blah',
                        permissions: []
                    })], { type: "application/json" }))

                    axios.put(state.apiUrl, formData, {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    })
                    .then(res => {
                        setReturn(String('return successful: \n' + res))
                    })
                    .catch(err => {
                        setReturn(String('return unsuccessful: \n' + err))
                    })
                }

                else {
                    //is comment
                    let commentJson = {
                        'content': state.toReturn,
                        'permissions': []
                    }
                    console.log(commentJson)
                    axios.post(state.apiUrl, commentJson, {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    })
                    .then(res => {
                        setReturn(String('return successful: \n' + res))
                    })
                    .catch(err => {
                        setReturn(String('return unsuccessful: \n' + err))
                    })
                }

                break

            case 'POST':
                if(isFileOrComment) {
                    //is file
                    let formData = new FormData()
                    formData.append('data', fileState.selectedFile)
                    formData.append('metadata', new Blob([JSON.stringify({
                        description: 'blah',
                        permissions: []
                    })], { type: "application/json" }))

                    axios.post(state.apiUrl, formData, {
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    .then(res => {
                        setReturn(String('return successful: \n' + res))
                    })
                    .catch(err => {
                        setReturn(String('return unsuccessful: \n' + err))
                    })
                }

                else {
                    //is comment
                    let commentJson = {
                        'content': state.toReturn,
                        'permissions': []
                    }
                    console.log(commentJson)
                    axios.post(state.apiUrl, commentJson, {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    })
                    .then(res => {
                        setReturn(String('return successful: \n' + res))
                    })
                    .catch(err => {
                        setReturn(String('return unsuccessful: \n' + err))
                    })
                }

                break

            case 'GET':
                axios.get(state.apiUrl, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                })
                .then(res => {

                    setReturn(String('return successful: \n' + JSON.stringify(res)))
                })
                .catch(err => {
                    setReturn(String('return unsuccessful: \n' + err))
                })

                break

            case 'DELETE':
                axios.delete(state.apiUrl, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                })
                .then(res => {
                    setReturn(String('return successful: \n' + res))
                })
                .catch(err => {
                    setReturn(String('return unsuccessful: \n' + err))
                })
                break

            default:
                setReturn("didnt put html method or put incorrectly")
        }
    }

  return (
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
        <form>
            HTML Methods: POST, PUT, GET, DELETE (all caps)
            <div>
                <input
                type='text'
                name='htmlMethods'
                id='htmlMethods'
                placeholder="HTML Methods"
                onChange={handleChange}
                />
            </div>
            <br/>
            API url (e.g., api/cases):
            <div>
                <input
                type='text'
                name='apiUrl'
                id='apiUrl'
                placeholder="API Url"
                size='40'
                onChange={handleChange}
                />
            </div>
            <br/>
            To post:
            <div>
                <textarea
                name='toReturn'
                id='toReturn'
                placeholder='data to post'
                rows='4'
                cols='50'
                onChange={handleChange}
                />
            </div>
            File to upload:
            <div>
                <input
                type='file'
                accept='.pdf'
                name='file'
                id='file'
                placeholder="Upload your PDF"
                onChange={fileSelectedHandler}
                />
            </div>
            IF POSTING/PUTTING: FILE OR COMMENT
            <div>
                <input type="radio" id="isFile" name="fileOrComment" value="File"
                onChange={() => setFileOrComment(true)} />
                <label for="File">File</label><br/>
                <input type="radio" id="isComment" name="fileOrComment" value="Comment"
                onChange={() => setFileOrComment(false)}  />
                <label for="Comment">Comment</label>

            </div>
        </form>
        <div>
            <button className='btn btn-primary' style={{width: '200px', clear:'both'}} onClick={fileUploadHandler}>Submit</button>
        </div>
        < br/>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginLeft: '1em'}}>
        <pre className="col-12 text-light bg-dark p-4" style={{maxWidth: '800px'}}>
          {returnMessage}
        </pre>
        </div>
      </div>
      
      
  )
}

export default withAuthenticationRequired(ApiTest, {
    onRedirecting: () => <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', paddingTop:'100px'}}><Spinner animation='border' role='status'></Spinner></div>,
  });