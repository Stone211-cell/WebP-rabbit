const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const visits = await prisma.visit.findMany({ select: { sales: true, dealStatus: true, date: true } });
    const profiles = await prisma.profile.findMany({ select: { name: true } });

    console.log("Profiles:");
    profiles.forEach(p => console.log(`- '${p.name}'`));

    console.log("\nUnique Sales Names in Visits:");
    const uniqueSales = new Map();
    visits.forEach(v => {
        const name = v.sales;
        if (!uniqueSales.has(name)) uniqueSales.set(name, { count: 0, closed: 0, latest: v.date });
        const stats = uniqueSales.get(name);
        stats.count++;
        if (v.dealStatus === 'ปิดการขาย' || v.dealStatus === 'closed') stats.closed++;
        if (new Date(v.date) > new Date(stats.latest)) stats.latest = v.date;
    });

    for (const [name, stats] of uniqueSales.entries()) {
        console.log(`- '${name}' : ${stats.count} visits, ${stats.closed} closed. Latest: ${stats.latest}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
