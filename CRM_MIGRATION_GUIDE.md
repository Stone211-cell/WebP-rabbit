# 🚀 Cowphet CRM - Migration Guide

## ✅ ที่ทำเสร็จแล้ว

### 1️⃣ **Prisma Schema** 
- ✅ สร้าง Models: `Store`, `Visit`, `Plan`, `Forecast`
- ✅ ตั้งค่า Relations ระหว่าง Models

### 2️⃣ **API Routes** 
- ✅ `/api/stores` - CRUD ร้านค้า
- ✅ `/api/visits` - CRUD การเข้าพบ
- ✅ `/api/plans` - CRUD แผนสัปดาห์
- ✅ `/api/forecasts` - CRUD คาดการณ์

### 3️⃣ **useCRM Hook**
- ✅ อัพเดท Hook ให้ใช้ API แทน localStorage
- ✅ ฟังก์ชัน CRUD ทั้งหมด

### 4️⃣ **UI/CSS**
- ✅ คัดลอก CSS ต้นฉบับ 100%
- ✅ Dark Mode Support

---

## 🛠️ ขั้นตอน Setup

### Step 1: Install Dependencies
```bash
npm install @prisma/client
```

### Step 2: ตั้งค่า `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cowphet_crm"
DIRECT_URL="postgresql://user:password@localhost:5432/cowphet_crm"
```

### Step 3: Prisma Migrate
```bash
npx prisma migrate dev --name init
```

### Step 4: Generate Prisma Client
```bash
npx prisma generate
```

### Step 5: (Optional) Seed Database
สร้างไฟล์ `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // สร้างข้อมูลตัวอย่างร้านค้า
  const stores = await prisma.store.createMany({
    data: [
      {
        code: 'KHN-C0001',
        name: 'ร้านเจ๊แดง',
        owner: 'เจ๊แดง',
        type: 'ร้านอาหารอีสาน',
        grade: 'A',
        phone: '081-111-1111',
        location: 'กทม.',
        status: 'เปิดการขาย',
      },
      {
        code: 'KHN-C0002',
        name: 'ครัวลุงรงค์',
        owner: 'ลุงรงค์',
        type: 'ร้านอาหารตามสั่ง',
        grade: 'B',
        phone: '089-999-9999',
        location: 'ราชบุรี',
        status: 'เปิดการขาย',
      },
    ],
  });

  console.log('✅ Seeded stores:', stores);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

จากนั้นรัน:
```bash
npx prisma db seed
```

---

## 📁 โครงสร้างไฟล์ใหม่

```
app/
├── api/
│   ├── stores/         # CRUD ร้านค้า
│   ├── visits/         # CRUD การเข้าพบ
│   ├── plans/          # CRUD แผน
│   └── forecasts/      # CRUD คาดการณ์
├── crm/
│   ├── page.tsx        # Main CRM Page
│   └── crm.css         # Styles
└── ...

components/
├── hooks/
│   └── useCRM.ts       # ✅ อัพเดทแล้ว
└── ...

lib/
├── prisma.ts           # ✅ Prisma Client
├── types/
│   └── crm.ts          # ✅ Types
└── ...

prisma/
├── schema.prisma       # ✅ Database Schema
└── ...
```

---

## 🎯 Features เสร็จแล้ว

### Dashboard
- 📊 สถิติร้านค้าและการเข้าพบ
- 📈 Chart ผลงานรายเซลล์
- 📅 Calendar + บันทึกการเข้าพบ

### Master DB
- 🏪 จัดการข้อมูลร้านค้า
- 🔍 ค้นหา + Filter
- ✏️ แก้ไข/ลบ/เพิ่ม

### Visit Management
- 📝 บันทึกการเข้าพบ
- 🎯 Autocomplete ร้านค้า
- 📋 ประวัติการเข้าพบรายร้าน

### Plan & Forecast
- 📅 แผนสัปดาห์
- 📈 คาดการณ์รายเดือน
- 🎴 Job Card

### Alerts
- 🔔 แจ้งเตือนนัดหมายที่ยังไม่เข้าพบ
- 🎯 ติดตามเป้าหมายรายเดือน

---

## 🚀 Run Application

```bash
npm run dev
```

เปิด `http://localhost:3000/crm`

---

## 🔄 Migration จาก localStorage

ข้อมูลเก่าใน localStorage สามารถนำเข้าได้โดย:

1. Export จากแอปเก่า (ปุ่ม "💾 สำรองข้อมูล")
2. ใช้ API POST เพื่อเพิ่มเข้าฐานข้อมูลใหม่

```javascript
// ตัวอย่าง
const oldData = JSON.parse(localStorage.getItem('cpt_master'));
oldData.forEach(store => {
  fetch('/api/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store)
  });
});
```

---

## 📦 Database Backup & Export

### Export to Excel
```bash
npx prisma db execute --file backup.sql
```

### Backup PostgreSQL
```bash
pg_dump cowphet_crm > backup.sql
```

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cowphet_crm"
DIRECT_URL="postgresql://user:password@localhost:5432/cowphet_crm"

# NextJS
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 🎨 UI/Design

✅ **สีสันเดิม 100%** - ทุกสี, Font, Layout คงเดิม
✅ **Dark Mode** - สนับสนุน
✅ **Responsive** - Mobile Friendly
✅ **Canvas Charts** - ผลงานรายเซลล์

---

## 📞 Support & Troubleshooting

### Prisma Issues
```bash
# Reset database (Development only!)
npx prisma migrate reset

# View database
npx prisma studio
```

### API Errors
- ดู Console (F12) สำหรับรายละเอียด
- Check Network tab สำหรับ API calls

### Data Not Showing
- ตรวจสอบ `.env` ได้ตั้งค่าถูกต้องหรือไม่
- รัน `npx prisma db push` เพื่อ sync schema

---

## ✨ Next Steps

1. ✅ Migrate ข้อมูลเก่า (ถ้ามี)
2. ✅ ทดสอบ CRUD operations
3. ✅ ปรับแต่ง Business Logic (ถ้าจำเป็น)
4. ✅ Deploy ไป Production

---

**Made with ❤️ from Cowphet CRM 2029**
