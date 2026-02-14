// import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const search = searchParams.get("search") || ""
//   const status = searchParams.get("status") || ""

//   const data = await prisma.purchase.findMany({
//     where: {
//       AND: [
//         {
//           OR: [
//             { storeName: { contains: search, mode: "insensitive" } },
//             { round: { contains: search, mode: "insensitive" } },
//           ],
//         },
//         status && status !== "all"
//           ? { status }
//           : {},
//       ],
//     },
//     orderBy: { createdAt: "desc" },
//   })

//   return NextResponse.json(data)
// }

// export async function POST(req: Request) {
//   const body = await req.json()

//   const created = await prisma.purchase.create({
//     data: {
//       round: body.round,
//       date: new Date(body.date),
//       storeId: body.storeId,
//       storeName: body.storeName,
//       amount: Number(body.amount),
//       status: body.status,
//     },
//   })

//   return NextResponse.json(created)
// }