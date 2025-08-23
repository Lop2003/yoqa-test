# Role-based Permissions for Image Setup Management

## การปรับปรุงระบบ Role Permission สำหรับหน้า Image Setup

### สิทธิ์การเข้าถึงตาม Role:

#### 🔴 SuperAdmin
- **สิทธิ์:** ทำได้ทุกอย่าง (Full Access)
- ✅ ดูรูปภาพและเนื้อหา (View)
- ✅ สร้างรูปภาพและเนื้อหาใหม่ (Create) 
- ✅ แก้ไขรูปภาพและเนื้อหา (Edit)
- ✅ ลบรูปภาพและเนื้อหา (Delete)

#### 🟡 Admin
- **สิทธิ์:** ดู, เพิ่ม, แก้ไข แต่ไม่สามารถลบได้
- ✅ ดูรูปภาพและเนื้อหา (View)
- ✅ สร้างรูปภาพและเนื้อหาใหม่ (Create)
- ✅ แก้ไขรูปภาพและเนื้อหา (Edit)
- ❌ ลบรูปภาพและเนื้อหา (Delete) - ปิดการใช้งาน

#### 🟢 Accounting
- **สิทธิ์:** ดู, เพิ่ม, แก้ไข แต่ไม่สามารถลบได้
- ✅ ดูรูปภาพและเนื้อหา (View)
- ✅ สร้างรูปภาพและเนื้อหาใหม่ (Create)
- ✅ แก้ไขรูปภาพและเนื้อหา (Edit)
- ❌ ลบรูปภาพและเนื้อหา (Delete) - ปิดการใช้งาน

### การเปลี่ยนแปลงที่ทำ:

#### 1. การควบคุมสิทธิ์ระดับ Component
```javascript
// Get user role from localStorage for permission control
const userRole = localStorage.getItem("role");

// Define permissions based on role
const canCreate = userRole === "SuperAdmin" || userRole === "Admin" || userRole === "Accounting";
const canEdit = userRole === "SuperAdmin" || userRole === "Admin" || userRole === "Accounting";
const canDelete = userRole === "SuperAdmin";
```

#### 2. ปุ่ม Create/Upload ในแต่ละ Tab
- **Hero Images:** แสดงปุ่ม Upload เฉพาะเมื่อ `canCreate = true`
- **Master Profiles:** แสดงปุ่ม "Add New Master" เฉพาะเมื่อ `canCreate = true`
- **QR Code Payment:** แสดงปุ่ม "Upload QR Code" เฉพาะเมื่อ `canCreate = true`
- **Class Catalogs:** แสดงปุ่ม "Add New Class" เฉพาะเมื่อ `canCreate = true`
- **Slider Images:** แสดงปุ่ม "Add New Slider Image" เฉพาะเมื่อ `canCreate = true`

#### 3. Action Columns ในตาราง
แต่ละตารางได้รับการปรับปรุง:
- **Edit/Update Button:** แสดงเฉพาะเมื่อ `canEdit = true`
- **Delete Button:** 
  - แสดงปุ่มปกติเมื่อ `canDelete = true` (SuperAdmin เท่านั้น)
  - แสดงปุ่ม disabled พร้อม tooltip "No permission to delete" สำหรับ role อื่น

#### 4. Function-level Permission Check
ทุก function ได้รับการเพิ่ม permission check:

**Create Functions:**
- `createSliderImage()`: ตรวจสอบ `canCreate`
- `createMaster()`: ตรวจสอบ `canCreate`
- `createClassCatalog()`: ตรวจสอบ `canCreate`

**Edit Functions:**
- `updateSliderImage()`: ตรวจสอบ `canEdit`
- `updateMaster()`: ตรวจสอบ `canEdit`
- `updateClassCatalog()`: ตรวจสอบ `canEdit`
- `updateHeroImage()`: ตรวจสอบ `canEdit`
- `updateQrcodeImage()`: ตรวจสอบ `canEdit`

**Delete Functions:**
- `deleteSliderImage()`: ตรวจสอบ `canDelete`
- `deleteMasterImage()`: ตรวจสอบ `canDelete`
- `deleteClassCatalog()`: ตรวจสอบ `canDelete`
- `deleteHeroImage()`: ตรวจสอบ `canDelete`
- `deleteQrcodeImage()`: ตรวจสอบ `canDelete`

#### 5. ข้อความแจ้งเตือน
- **Admin Role:** แสดงข้อความแจ้งเตือน (สีเหลือง) ว่าสามารถดู, สร้าง, แก้ไขได้ แต่ไม่สามารถลบได้
- **Accounting Role:** แสดงข้อความแจ้งเตือน (สีฟ้า) ว่าสามารถดู, สร้าง, แก้ไขได้ แต่ไม่สามารถลบได้

#### 6. Protected Image Types
ระบบนี้ครอบคลุมการจัดการรูปภาพทุกประเภท:
- 🖼️ **Hero Images** - รูปภาพหลักของเว็บไซต์
- 👥 **Master Profiles** - โปรไฟล์ครูโยคะ (รวมวิดีโอ YouTube)
- 💳 **QR Code Payment** - รูป QR Code สำหรับการชำระเงิน
- 📚 **Class Catalogs** - รูปภาพคลาสโยคะ
- 🎨 **Slider Images** - รูปภาพสไลด์เดอร์

### ผลลัพธ์:
- ✅ SuperAdmin: ใช้งานได้เต็มที่ (ทุกอย่าง)
- ✅ Admin: ดู + เพิ่ม + แก้ไข (ไม่สามารถลบได้)
- ✅ Accounting: ดู + เพิ่ม + แก้ไข (ไม่สามารถลบได้)
- ✅ มีการแสดงข้อความแจ้งเตือนชัดเจนสำหรับแต่ละ role
- ✅ UI elements ถูก disable/hide ตาม permission
- ✅ มีการตรวจสอบสิทธิ์ในทุก function ที่สำคัญ
- ✅ ปุ่ม Delete แสดงเป็น disabled พร้อม tooltip สำหรับ role ที่ไม่มีสิทธิ์

### Security Features:
- 🔒 **Function-level Security:** ทุก function ตรวจสอบสิทธิ์ก่อนทำงาน
- 🚫 **UI Disable:** ปุ่มที่ไม่มีสิทธิ์จะถูก disable หรือซ่อน
- ⚠️ **User Feedback:** แจ้งเตือนผู้ใช้เมื่อไม่มีสิทธิ์ทำงานนั้น ๆ
- 📝 **Clear Messaging:** ข้อความแจ้งเตือนชัดเจนสำหรับแต่ละ role

### Testing Recommendations:
1. **SuperAdmin Testing:** ตรวจสอบว่าทำได้ทุกอย่าง (Upload, Edit, Delete)
2. **Admin Testing:** ตรวจสอบว่าสามารถ Upload และ Edit ได้ แต่ปุ่ม Delete เป็น disabled
3. **Accounting Testing:** ตรวจสอบเหมือน Admin + ดูข้อความแจ้งเตือนที่แตกต่าง
4. **UI Consistency:** ตรวจสอบว่า tooltip และ disabled state แสดงผลถูกต้องในทุก Tab
