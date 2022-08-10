import React, { useEffect } from 'react'
import { useTable, useRowSelect, usePagination } from 'react-table'
import BTable from 'react-bootstrap/Table'

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        )
    }
)

function Table({ columns, data, setTableCase }) {
    //TODO: pagination
    const { 
        getTableProps, 
        getTableBodyProps,
        headerGroups, 
        rows, 
        prepareRow,
        selectedFlatRows,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { selectedRowIds, pageIndex, pageSize } 
    } = useTable({
        columns,
        data,
        stateReducer: (newState, action) => {
            if(action.type === "toggleRowSelected") {
                newState.selectedRowIds = {
                    [action.id]: true
                }
            }   
            return newState
        },
    },
    useRowSelect,
    hooks => {
        hooks.visibleColumns.push(columns => [
            {
                id: 'selection',
                Cell: ({ row }) => (
                    <div>
                        <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                    </div>
                ),
            },
            ...columns,
        ])
        }
    )

    useEffect(() => {
        setTableCase(selectedFlatRows[0]?.values)
    },[selectedFlatRows])

  return (
    <>
    <BTable striped bordered hover size='sm' {...getTableProps()}>
        <thead>
            {headerGroups.map(headerGroups => (
                <tr {...headerGroups.getHeaderGroupProps()}>
                    {headerGroups.headers.map(column => (
                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                </tr>
            ))}
        </thead>
        <tbody {...getTableBodyProps()}>
            {rows.slice(0, 20).map((row,i) => {
                prepareRow(row)
                return (
                    <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                        })}
                    </tr>
                )
            })}
        </tbody>
    </BTable>
    <div style={{
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    }}>

        {/**
      <button className='btn btn-primary' onClick={() => previousPage()}
        disabled={!canPreviousPage}>{'<'}</button>
      <button className='btn btn-primary' onClick={() => nextPage()}
        disabled={!canNextPage}>{'>'}</button>  
     */}
    </div>
    </>
  )
}

export default Table