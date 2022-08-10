import React, { useContext, useMemo, useState } from 'react'

const ErrorContext = React.createContext()

export function useError() {
    return useContext(ErrorContext)
}

export const ErrorProvider = ({ children }) =>  {

    const [error, setError] = useState(null)
    const ctx = useMemo(() => ({ error, setError}), [error])

    return (
        <ErrorContext.Provider value={ctx}>
            {children}
        </ErrorContext.Provider>
    )

}

export default ErrorContext