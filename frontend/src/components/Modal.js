import React from 'react'
import ReactDom from 'react-dom'
import {useSpring, animated} from 'react-spring'
import './Modal.css'

function Modal({ children, isOpen, onClose, btnText, btnClassName }) {

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
    <div className='modalstyle'>
        { children }
        <button className={btnClassName} onClick={onClose} style={{
            minWidth:'10vh',
            position:'absolute',
            bottom:'5%'
        }}>{btnText}</button>
    </div>
    </animated.div>
    </>,
    document.getElementById('portal')
  )
}

export default Modal