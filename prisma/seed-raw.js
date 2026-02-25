const { Client } = require('pg')

const client = new Client({
    connectionString: 'postgresql://postgres.tixmiifsgofqvbdepjya:wUeqpOqnMLcYCHBx@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
})

const MEAT_PARTS = [
    // เนื้อแดง
    { name: 'สันนอก', category: 'เนื้อแดง', sortOrder: 1 },
    { name: 'สันมัน', category: 'เนื้อแดง', sortOrder: 2 },
    { name: 'ริบอาย', category: 'เนื้อแดง', sortOrder: 3 },
    { name: 'สันใน', category: 'เนื้อแดง', sortOrder: 4 },
    { name: 'สันคอ', category: 'เนื้อแดง', sortOrder: 5 },
    { name: 'ตะเข้', category: 'เนื้อแดง', sortOrder: 6 },
    { name: 'สะโพก', category: 'เนื้อแดง', sortOrder: 7 },
    { name: 'มะพร้าว', category: 'เนื้อแดง', sortOrder: 8 },
    { name: 'ลั้ม', category: 'เนื้อแดง', sortOrder: 9 },
    { name: 'ก้อนขาหน้า', category: 'เนื้อแดง', sortOrder: 10 },
    { name: 'ใบพาย', category: 'เนื้อแดง', sortOrder: 11 },
    { name: 'เสือร้องให้', category: 'เนื้อแดง', sortOrder: 12 },
    { name: 'ปลาช่อน', category: 'เนื้อแดง', sortOrder: 13 },
    { name: 'น่องลาย', category: 'เนื้อแดง', sortOrder: 14 },
    { name: 'น่องแก้ว', category: 'เนื้อแดง', sortOrder: 15 },
    { name: 'หนอก', category: 'เนื้อแดง', sortOrder: 16 },
    { name: 'ฮัม / สันไหล่', category: 'เนื้อแดง', sortOrder: 17 },
    { name: 'ชายโครง', category: 'เนื้อแดง', sortOrder: 18 },
    { name: 'สามชั้น', category: 'เนื้อแดง', sortOrder: 19 },
    { name: 'ใบบัว', category: 'เนื้อแดง', sortOrder: 20 },
    { name: 'ตับ', category: 'เนื้อแดง', sortOrder: 21 },
    { name: 'หางตะเข้', category: 'เนื้อแดง', sortOrder: 22 },
    { name: 'บางขาหน้า', category: 'เนื้อแดง', sortOrder: 23 },
    { name: 'เนื้อนุ่ม', category: 'เนื้อแดง', sortOrder: 24 },
    { name: 'ขอบสัน / หัวสัน', category: 'เนื้อแดง', sortOrder: 25 },
    { name: 'เศษเล็ก', category: 'เนื้อแดง', sortOrder: 26 },
    { name: 'ลิ้น', category: 'เนื้อแดง', sortOrder: 27 },
    { name: 'ยกตัว', category: 'เนื้อแดง', sortOrder: 28 },
    { name: 'ครึ่งตัว', category: 'เนื้อแดง', sortOrder: 29 },
    // เศษ
    { name: 'แก้ม', category: 'เศษ', sortOrder: 1 },
    { name: 'เศษเลาะ', category: 'เศษ', sortOrder: 2 },
    { name: 'เศษใหญ่', category: 'เศษ', sortOrder: 3 },
    { name: 'เศษหัว', category: 'เศษ', sortOrder: 4 },
    { name: 'ปากหนาม', category: 'เศษ', sortOrder: 5 },
    { name: 'เอ็นแก้ว', category: 'เศษ', sortOrder: 6 },
    { name: 'เศษก้อนแดงหั่นปอ', category: 'เศษ', sortOrder: 7 },
    { name: 'เนื้อนุ่มเขียว', category: 'เศษ', sortOrder: 8 },
    { name: 'เศษเสือ', category: 'เศษ', sortOrder: 9 },
    { name: 'เนื้อบด', category: 'เศษ', sortOrder: 10 },
    { name: 'เอ็นเหลือง', category: 'เศษ', sortOrder: 11 },
    // เครื่องใน
    { name: 'เครื่องในรวม', category: 'เครื่องใน', sortOrder: 1 },
    { name: 'ชุดดำ', category: 'เครื่องใน', sortOrder: 2 },
    { name: 'ผ้าขน', category: 'เครื่องใน', sortOrder: 3 },
    { name: 'หำ + เจี้ยว', category: 'เครื่องใน', sortOrder: 4 },
    { name: 'หัวใจ', category: 'เครื่องใน', sortOrder: 5 },
    { name: 'ไขหลัง', category: 'เครื่องใน', sortOrder: 6 },
    { name: 'ดีพก', category: 'เครื่องใน', sortOrder: 7 },
    { name: 'ม้าม', category: 'เครื่องใน', sortOrder: 8 },
    { name: 'ขั้วตับ', category: 'เครื่องใน', sortOrder: 9 },
    { name: 'สมอง', category: 'เครื่องใน', sortOrder: 10 },
    { name: 'ไส้', category: 'เครื่องใน', sortOrder: 11 },
    // อะไหล่
    { name: 'มันแต่ง', category: 'อะไหล่', sortOrder: 1 },
    { name: 'มันทิ้ง', category: 'อะไหล่', sortOrder: 2 },
    { name: 'กีบ', category: 'อะไหล่', sortOrder: 3 },
    { name: 'หางสด', category: 'อะไหล่', sortOrder: 4 },
    { name: 'หนัง', category: 'อะไหล่', sortOrder: 5 },
]

async function main() {
    await client.connect()
    console.log('🌱 Seeding MeatPart via raw SQL...')

    for (const part of MEAT_PARTS) {
        await client.query(
            `INSERT INTO "MeatPart" (id, name, category, "sortOrder", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category, "sortOrder" = EXCLUDED."sortOrder", "updatedAt" = NOW()`,
            [part.name, part.category, part.sortOrder]
        )
    }

    console.log(`✅ Seeded ${MEAT_PARTS.length} meat parts`)
    await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
