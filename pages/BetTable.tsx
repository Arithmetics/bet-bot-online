import { Table,  } from '@geist-ui/react'

type TableColumnRender<T extends Record> = (
    value: T[keyof T],
    rowData: T,
    rowIndex: number,
  ) => JSX.Element | void

type User = {
    name: string
    role: string
    records: Array<{ date: string }>
  }

  const renderHandler: TableColumnRender<User> = (value, rowData, index) => {
    return <div>{rowData.name}</div>
  }
  
  const data: Array<User> = [
    { name: 'witt', role: 'admin', records: [{ date: '2021-05-01' }] },
  ]
  
const MyComponent = () => (
    <Table<User> data={data}>
      <Table.Column<User> prop="name" label="username" />
      <Table.Column<User> prop="role" label="role" />
      <Table.Column<User> prop="records" label="records" render={renderHandler} />
    </Table>
  )

export default MyComponent;