"use client"
import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}




export default function DemoPage({ data }: { data: Payment[] }) {
  return (
    <div className="p-4">
      <DataTable columns={columns} data={data} />
    </div>
  )
}