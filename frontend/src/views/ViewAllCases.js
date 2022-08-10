import React, { useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import { Spinner } from 'react-bootstrap'
import Table from '../components/Table'
import axios from 'axios'
import { useNavigate } from 'react-router'
import searchIcon from '../components/search.svg'
import { useError } from '../contexts/ErrorContext'

function ViewAllCases() {

    const api = process.env.REACT_APP_API

    const { setError } = useError()

    const { getAccessTokenSilently } = useAuth0()
    const [ loading, setLoading ] = useState(true)
    const [ myCase, setCase ] = useState()
    const [ filteredCase, setFilteredCase ] = useState()
    const [ tableCase, setTableCase ] = useState()
    const [ disabled, setDisabled ] = useState(true)
    let navigate = useNavigate()

    const routeToCase = () => {
        let path = '' + tableCase['child.id']
        navigate(path)
        console.log(path)
    }
    
    const handleChange = () => {
        const toFilter = document.getElementById('childFilter').value.toLowerCase()

        const filtered = myCase.filter(item => item.child.name.toLowerCase().includes(toFilter))
        console.log(filtered)

        setFilteredCase(filtered)
        setTableCase()
        setDisabled(true)
    }

    const columns = React.useMemo(
        () => [
            {
            Header: 'Names',
            columns: [
                {
                    Header: 'Child\'s Name',
                    accessor: 'child.name'
                },
                {
                    Header: 'Parent\'s Name',
                    accessor: 'child.parent.name'
                },
            ],
        },
        {
            Header: 'Case Info',
            columns: [
                {
                    Header: 'Status',
                    accessor:'state'
                },
                {
                    Header: 'Case #',
                    accessor:'child.id'
                }
            ]
        }
        ],
        []
    )  

    useEffect(() => {
        getAccessTokenSilently()
        .then(token => {
            axios.get(api + '/cases/', {
                headers: {
                'Authorization': 'Bearer ' + token 
            }
        })
            .then(res => {
                setCase(res.data)
                setFilteredCase(res.data)
                setLoading(false)
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

    useEffect(() => {
        if(tableCase) {
            setDisabled(false)
            document.getElementById('caseButton').disabled = false
            console.log(tableCase)
        }
    },[tableCase])

  return (
    <>
    {loading ? (
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
            <Spinner animation='border' role='status' style={{margin:'5em'}}></Spinner>
        </div>
    ) : (
        <header className='container'>
        <h1 className='header'>Cases</h1>
        <div className='form-group'
        style={{
            display: 'flex',  
            justifyContent:'center', 
            alignItems:'center',
            }}>
        <div>
            <label 
            htmlFor='childFilter'
            style={{
                margin:'0em',
                marginLeft:'0.2em'
            }}
            >Filter by Child Name</label>
            <input 
            className='form-control' 
            id='childFilter' 
            placeholder="Child's name"
            onKeyPress={event => {
                if(event.key === 'Enter') {
                    handleChange()
                }
            }}
            style={{
                margin:'0em',
                marginBottom:'0.5em'
            }}
            >
            </input>
        </div>
        <button 
        className='btn btn-info'
        onClick={handleChange}
        style={{
            marginTop:'1.25em',
            height:'38px'
        }}
        ><img src={searchIcon} style={{
            marginTop:'-0.2em'
        }}></img></button>
        </div>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
            <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                <Table columns={columns} data={filteredCase} setTableCase={setTableCase}/>
            </div>
        </div>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
            <button 
            id='caseButton'
            className='btn btn-primary'
            disabled={disabled}
            onClick={routeToCase}>View Case</button>
        </div>
    </header>
    )}
    </>
  )
}

export default withAuthenticationRequired(ViewAllCases, {
    onRedirecting: () => <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', paddingTop:'100px'}}><Spinner animation='border' role='status'></Spinner></div>,
  });