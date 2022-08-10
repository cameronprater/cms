import React from 'react'
import ReactDom from 'react-dom'
import {useSpring, animated} from 'react-spring'

function ModalButtonless({ children, isOpen, onClose }) {

    const animation = useSpring({
        config: {
            duration: 250
        },
        opacity: isOpen ? 1 : 0,
    })

    if (!isOpen) return null

  return ReactDom.createPortal(
    <>
    <div className='modaloverlay' />
    <animated.div style={animation}>
    <div className='modalbuttonlessstyle'>
        { children }
    </div>
    </animated.div>
    </>,
    document.getElementById('portal')
  )
}

export default ModalButtonless