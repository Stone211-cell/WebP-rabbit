export interface MenuItem {
  href: string
  label: string
}



export const StoreTypes = [
  "ร้านอาหารอีสาน",
  "ร้านอาหารฟิวชั่น",
  "ร้านก๋วยเตี๋ยว",
  "ร้านชาบู/หมูกระทะ",
  "ร้านอาหารตามสั่ง",
  "โรงแรม",
  "งานพิธี",
  "โรงงานแปรรูป",
  "ห้องเย็น",
  "ค้าส่ง",
  "ห้างท้องถิ่นประจำจังหวัด",
  "ครัวกลาง DC",
  "อื่นๆ"
] as const

export const CreditRatings = [
  { label: "ดีมาก", value: "5", stars: 5 },
  { label: "ดี", value: "4", stars: 4 },
  { label: "ปานกลาง", value: "3", stars: 3 },
  { label: "แย่", value: "2", stars: 2 },
  { label: "แย่มาก", value: "1", stars: 1 }
] as const

export const OrderPeriods = [
  "ทุกวัน",
  "2 วันครั้ง",
  "3 วันครั้ง",
  "สัปดาห์ครั้ง",
  "2 สัปดาห์ครั้ง",
  "เดือนละครั้ง",
] as const

export const CustomerGroups = [
  "ร้านเดิม A",
  "ร้านเดิม B",
  "ร้านใหม่ N",
  "พัฒนาออเดอร์ T",
  "ตัวแทนจำหน่าย D",
  "ทั่วไป"
] as const

export const VisitTopics = [
  "ตรวจเยี่ยมประจำเดือน",
  "เข้าพบร้านค้าใหม่",
  "ติดตามผล",
  "เข้าพบเสนอราคา",
  "ติดตามยอดชำระ",
  "นำเสนอสินค้าตัวอย่าง",
  "อื่นๆ"
] as const

export const VisitTypes = [
  { value: "new", label: "ร้านใหม่" },
  { value: "continuous", label: "ร้านติดต่อต่อเนื่อง" },
  { value: "follow", label: "ร้านเดิม" },
  { value: "database", label: "ร้านฐานข้อมูลเดิม" }
] as const

export const DealStatuses = [
  "เปิดการขาย",
  "ปิดการขาย"
] as const