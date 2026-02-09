import { Payment } from "../pagecomponents/Dashboard/Table/columns"
import DemoPage from "../pagecomponents/Dashboard/Table/gettable"

async function getData(): Promise<Payment[]> {
  return [
    {
      id: "1",
      amount: 100,
      status: "pending",
      email: "test@mail.com",
    },
  ]
}

export default async function Page() {
  const data = await getData()
  return <DemoPage data={data} />
}