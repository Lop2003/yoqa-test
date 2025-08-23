# Role-based Permissions for Order Management

## การปรับปรุงระบบ Role Permission สำหรับหน้า Order

### สิทธิ์การเข้าถึงตาม Role:

#### 🔴 SuperAdmin
- **สิทธิ์:** ทำได้ทุกอย่าง (Full Access)
- ✅ ดูข้อมูลคำสั่งซื้อ (View)
- ✅ สร้างคำสั่งซื้อใหม่ (Create) 
- ✅ แก้ไขสถานะคำสั่งซื้อ (Edit)
- ✅ ลบคำสั่งซื้อ (Delete)

#### 🟡 Admin
- **สิทธิ์:** ดู และ เพิ่ม เท่านั้น
- ✅ ดูข้อมูลคำสั่งซื้อ (View)
- ✅ สร้างคำสั่งซื้อใหม่ (Create)
- ❌ แก้ไขสถานะคำสั่งซื้อ (Edit) - ปิดการใช้งาน
- ❌ ลบคำสั่งซื้อ (Delete) - ปิดการใช้งาน

#### 🟢 Accounting
- **สิทธิ์:** ดู และ เพิ่ม เท่านั้น
- ✅ ดูข้อมูลคำสั่งซื้อ (View)
- ✅ สร้างคำสั่งซื้อใหม่ (Create)
- ❌ แก้ไขสถานะคำสั่งซื้อ (Edit) - ปิดการใช้งาน
- ❌ ลบคำสั่งซื้อ (Delete) - ปิดการใช้งาน

### การเปลี่ยนแปลงที่ทำ:

#### 1. การควบคุมสิทธิ์ระดับ Component
```javascript
// Get user role from localStorage for permission control
const userRole = localStorage.getItem("role");

// Define permissions based on role
const canCreate = userRole === "SuperAdmin" || userRole === "Admin" || userRole === "Accounting";
const canEdit = userRole === "SuperAdmin";
const canDelete = userRole === "SuperAdmin";
const canView = userRole === "SuperAdmin" || userRole === "Admin" || userRole === "Accounting";
```

#### 2. ปุ่ม Create Order
- แสดงเฉพาะเมื่อ `canCreate = true` (SuperAdmin, Admin, Accounting)
- ซ่อนสำหรับ role อื่น ๆ

#### 3. Action Column ในตาราง
- แสดงปุ่ม Edit เฉพาะเมื่อ `canView = true`
- แสดงปุ่ม disabled พร้อม tooltip "No permission" สำหรับ role ที่ไม่มีสิทธิ์

#### 4. Modal การแก้ไข/ลบ
- **Footer Buttons:**
  - Delete Button: แสดงเฉพาะเมื่อ `canDelete = true` (SuperAdmin เท่านั้น)
  - Update Button: แสดงเฉพาะเมื่อ `canEdit = true` (SuperAdmin เท่านั้น)
  - Cancel Button: แสดงเสมอ

- **Input Fields:**
  - Status Select: disabled เมื่อ `!canEdit`
  - Invoice Input: disabled เมื่อ `!canEdit`

#### 5. Function-level Permission Check
- `showModal()`: ตรวจสอบ `canView` ก่อนเปิด Modal
- `handleUpdateStatus()`: ตรวจสอบ `canEdit` ก่อนดำเนินการ
- `handleDeleteOrder()`: ตรวจสอบ `canDelete` ก่อนดำเนินการ
- `showCreateOrderModal()`: ตรวจสอบ `canCreate` ก่อนเปิด Modal

#### 6. ข้อความแจ้งเตือน
- **Admin Role:** แสดงข้อความแจ้งเตือน (สีเหลือง) ว่าสามารถดูและสร้างได้เท่านั้น
- **Accounting Role:** แสดงข้อความแจ้งเตือน (สีฟ้า) ว่าสามารถดูและสร้างได้เท่านั้น

### ผลลัพธ์:
- ✅ SuperAdmin: ใช้งานได้เต็มที่
- ✅ Admin: ดู + เพิ่ม (ไม่สามารถแก้ไข/ลบได้)
- ✅ Accounting: ดู + เพิ่ม (ไม่สามารถแก้ไข/ลบได้)
- ✅ มีการแสดงข้อความแจ้งเตือนชัดเจนสำหรับแต่ละ role
- ✅ UI elements ถูก disable/hide ตาม permission
- ✅ มีการตรวจสอบสิทธิ์ในทุก function ที่สำคัญ

### Testing:
ทดสอบด้วย role ต่าง ๆ:
1. Login เป็น SuperAdmin → ควรใช้งานได้ทุกอย่าง
2. Login เป็น Admin → ควรเห็นข้อความแจ้งเตือน, สร้างได้, แต่แก้ไข/ลบไม่ได้
3. Login เป็น Accounting → ควรเห็นข้อความแจ้งเตือน, สร้างได้, แต่แก้ไข/ลบไม่ได้
