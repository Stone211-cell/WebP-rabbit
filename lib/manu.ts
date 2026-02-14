import { MenuItem } from "./types/manu"


export const MainMenu: MenuItem[] = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/viewpoint", label: "มุมมองของเรา" },
  { href: "/webone", label: "สินค้าเว็บ1" },
  { href: "/webtwo", label: "สินค้าเว็บ2" },
  { href: "/cart", label: "ตระกร้าสินค้า" },
  { href: "/policy", label: "นโยบายของเรา" },
]

export const AdminMenu: MenuItem[] = [
  { href: "/admin/dashboard", label: "แดชบอร์ด" },
  { href: "/admin/store", label: "จัดการร้านค้า" },
  { href: "/admin/faq", label: "จัดการ FAQ" },
  // { href: "/admin/createproduct", label: "เพิ่มสินค้า" },
]