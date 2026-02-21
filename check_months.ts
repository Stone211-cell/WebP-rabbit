import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const visits = await prisma.visit.findMany({ select: { sales: true, date: true } });

    const stats = {};
    visits.forEach(v => {
        const month = `${v.date.getFullYear()}-${v.date.getMonth() + 1}`;
        if (!stats[v.sales]) stats[v.sales] = {};
        if (!stats[v.sales][month]) stats[v.sales][month] = 0;
        stats[v.sales][month]++;
    });

    console.log(stats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
