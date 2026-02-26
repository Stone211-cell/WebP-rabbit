import { exportToExcel } from "./export";

// Rating label helper
export const getRatingLabel = (score: string | number) => {
    switch (String(score)) {
        case '5': return 'ดีมาก';
        case '4': return 'ดี';
        case '3': return 'ปานกลาง';
        case '2': return 'แย่';
        case '1': return 'แย่มาก';
        default: return String(score || '');
    }
}

// 1. ส่งออกข้อมูลบันทึกเข้าพบ (VisitRecords)
export const getVisitsExportData = (visits: any[]) => {
    const sortedVisits = [...visits].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sortedVisits.map((v: any) => {
        let visitNotes = "";
        if (v.notes) {
            if (typeof v.notes === 'object') {
                visitNotes = Object.entries(v.notes)
                    .map(([key, value]) => `ครั้งที่${key}: ${value}`)
                    .join(' \n');
            } else {
                visitNotes = v.notes;
            }
        }
        return {
            "วันที่": v.date ? new Date(v.date).toLocaleDateString('th-TH') : "",
            "เซลล์": v.sales || "",
            "รหัสลูกค้า": v.store?.code || v.storeRef || "",
            "ชื่อร้าน": v.store?.name || "",
            "ประเภทลูกค้า": v.store?.customerType || "",
            "เจ้าของ": v.store?.owner || "",
            "เบอร์โทร": v.store?.phone || "",
            "ประเภทร้าน": v.store?.type || "",
            "ที่อยู่": v.store?.address || "",
            "สินค้า": v.store?.productUsed || "",
            "ปริมาณ": v.store?.quantity || "",
            "ระยะเวลาสั่ง": v.store?.orderPeriod || "",
            "รับของจาก": v.store?.supplier || "",
            "เงื่อนไขชำระ": v.store?.payment || "",
            "หัวข้อเข้าพบ": v.visitCat || "",
            "ประเภทเข้าพบ": v.visitType || "",
            "สถานะ": v.dealStatus || "",
            "เหตุผลปิดการขาย": v.closeReason || "",
            "บันทึกเข้าพบ": visitNotes
        };
    });
};

export const exportVisitsToExcel = (visits: any[]) => {
    exportToExcel(getVisitsExportData(visits), "VisitHistory", "บันทึกเข้าพบ");
};

// 2. ส่งออกแผนสัปดาห์ (WeeklyPlans)
export const getPlansExportData = (plans: any[]) => {
    const sortedPlans = [...(plans || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sortedPlans.map((p: any) => ({
        "วันที่": p.date ? new Date(p.date).toLocaleDateString('th-TH') : "",
        "เซลล์": p.sales || "",
        "รหัส": p.store?.code || p.storeRef || "",
        "ชื่อร้าน": p.store?.name || p.storeName || "",
        "ประเภทลูกค้า": p.store?.customerType || "",
        "หัวข้อเข้าพบ": p.visitCat || "",
        "บันทึก": p.notes || ""
    }));
};

export const exportPlansToExcel = (plans: any[]) => {
    exportToExcel(getPlansExportData(plans), "WeeklyPlans", "แผนงานสัปดาห์");
};

// 3. ส่งออกฐานข้อมูลลูกค้า (StoreInformation)
export const getStoresExportData = (stores: any[]) => {
    const sortedStores = [...stores].sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : (a.id ? parseInt(a.id, 36) : 0);
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : (b.id ? parseInt(b.id, 36) : 0);
        return dateA - dateB;
    });

    return sortedStores.map((s: any, index: number) => ({
        "ลำดับ": index + 1,
        "รหัส": s.code || "",
        "ชื่อร้าน": s.name || "",
        "เจ้าของ": s.owner || "",
        "ประเภท": s.type || "",
        "ประเภทลูกค้า": s.customerType || "",
        "เบอร์โทร": s.phone || "",
        "ที่อยู่": s.address || "",
        "สินค้า": s.productUsed || "",
        "ปริมาณ": s.quantity || "",
        "ระยะเวลาสั่ง": s.orderPeriod || "",
        "รับของจาก": s.supplier || "",
        "เงื่อนไขชำระ": s.payment || "",
        "คะแนนการชำระเงิน": s.paymentScore ? getRatingLabel(s.paymentScore) : "",
        "สถานะ": s.status || "",
        "เหตุผลปิดการขาย": s.closeReason || ""
    }));
};

export const exportStoresToExcel = (stores: any[]) => {
    exportToExcel(getStoresExportData(stores), "StoreInformation", "ฐานข้อมูลลูกค้า");
};
