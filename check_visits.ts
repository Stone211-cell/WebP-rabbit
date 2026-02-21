import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const visits = await prisma.visit.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        select: { sales: true, dealStatus: true, date: true, visitCat: true, storeRef: true }
    });
    console.log(visits);
}

main().catch(console.error).finally(() => prisma.$disconnect());
