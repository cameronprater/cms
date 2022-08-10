import React, { useEffect, useState } from 'react'
import { CloseButton } from 'react-bootstrap'
import {useSpring, animated} from 'react-spring'
import styled from 'styled-components'
import useMeasure from 'react-use-measure'
import { useError } from '../contexts/ErrorContext'
import './Modal.css'

const ErrorContent = styled(animated.div)`
background-color: red;
overflow: hidden;
position: relative;
display: flex;
justify-content: center;
align-items: center;
color: white;
`

const ErrorContentInner = styled.div`
  padding: 10px 0;
`

function ErrorModal({ children }) {

    const { error, setError } = useError()
    const [isClosed, setIsClosed] = useState(false)

    const [ ref, bounds ] = useMeasure()

    useEffect(() => {
      if(error != null) {
        setIsClosed(true)
      }
    },[error])

    const closeError = () => {
      setError(null)
      setIsClosed(false)
    }

    const errorAnimation = useSpring({
      height: isClosed ? bounds.height : 0
    })

  return (
      <ErrorContent style={errorAnimation}>
        <ErrorContentInner ref={ref}>
        {error}
        { children }
        <div style={{
          position:'absolute',
          right:'1%',
          top:'25%'
        }}>
        <CloseButton variant="white" onClick={closeError}/>
        </div>
        </ErrorContentInner>
        </ErrorContent>
  )
}

export default ErrorModal