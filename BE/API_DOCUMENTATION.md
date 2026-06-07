# EduRAG - API Documentation cho Frontend

> **Base URL:** `http://localhost:{PORT}/api`
>
> **Xác thực:** JWT Bearer Token — gửi header `Authorization: Bearer <accessToken>`
>
> **Roles:** `student` | `lecturer` | `manager` | `admin`

---

## Mục lục

1. [Authentication](#1-authentication-apiauth)
2. [Admin & Import](#2-admin--import-apiadmin)
3. [Users](#3-users-apiusers)
4. [Courses (Lớp học phần)](#4-courses-lớp-học-phần-apicourses)
5. [Projects (Đồ án / Đề tài)](#5-projects-đồ-án--đề-tài-apiprojects)
6. [Reports (Báo cáo)](#6-reports-báo-cáo-apireports)
7. [Research Papers (NCKH)](#7-research-papers-nckh-apiresearch-papers)
8. [Milestones (Tiến độ)](#8-milestones-tiến-độ-apimilestones)
9. [Mentorships (Hướng dẫn)](#9-mentorships-hướng-dẫn-apimentorships)
10. [Notifications (Thông báo)](#10-notifications-thông-báo-apinotifications)
11. [RAG (Tìm kiếm ngữ nghĩa)](#11-rag-tìm-kiếm-ngữ-nghĩa-apirag)
12. [Stats (Thống kê)](#12-stats-thống-kê-apistats)

---

## Quy ước chung

| Ký hiệu | Ý nghĩa |
|----------|----------|
| **Public** | Không cần token |
| **Auth** | Cần Bearer token |
| **Role: X** | Yêu cầu role cụ thể |
| `?field` | Query parameter |
| `:id` | Path parameter |

### Phân trang (áp dụng cho các endpoint danh sách)

| Query param | Mặc định | Mô tả |
|-------------|----------|-------|
| `page` | `1` | Trang hiện tại |
| `limit` | `20` | Số bản ghi / trang (max 100) |

**Response phân trang chuẩn:**
```json
{
  "items": [...],
  "page": 1,
  "limit": 20,
  "total": 150
}
```

### Error response chuẩn
```json
{ "message": "Mô tả lỗi" }
```

---

## 1. Authentication (`/api/auth`)

### 1.1 Đăng nhập
```
POST /api/auth/login
```
**Public**

**Request body:**
```json
{
  "email": "string (bắt buộc)",
  "password": "string (bắt buộc)"
}
```

**Response 200:**
```json
{
  "accessToken": "jwt_string",
  "refreshToken": "random_hex_string",
  "user": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "a@edu.vn",
    "major": "CNTT",
    "role": "student",
    "account_status": "active",
    "is_active": true
  }
}
```

**Errors:** `400` thiếu field | `401` sai email/password | `403` tài khoản chưa kích hoạt/bị đình chỉ | `423` tài khoản tạm khóa do sai quá nhiều lần

---

### 1.2 Refresh Token
```
POST /api/auth/refresh
```
**Public**

**Request body:**
```json
{
  "refreshToken": "string (bắt buộc)"
}
```

**Response 200:** Giống response login (accessToken mới + refreshToken mới — token rotation)

**Errors:** `400` | `401` token không hợp lệ/hết hạn/bị thu hồi | `403` tài khoản bị khóa

---

### 1.3 Đăng xuất
```
POST /api/auth/logout
```
**Public**

**Request body:**
```json
{
  "refreshToken": "string (tùy chọn)"
}
```

**Response 200:**
```json
{ "message": "Đã đăng xuất" }
```

---

### 1.4 Đăng xuất tất cả thiết bị
```
POST /api/auth/logout-all
```
**Auth**

**Response 200:**
```json
{ "message": "Đã đăng xuất tất cả thiết bị", "revokedCount": 3 }
```

---

### 1.5 Lấy thông tin user hiện tại
```
GET /api/auth/me
```
**Auth**

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "a@edu.vn",
    "major": "CNTT",
    "role": "student",
    "account_status": "active",
    "is_active": true,
    "department": "Khoa CNTT",
    "student_code": "20110001",
    "class_name": "20TCLC_DT1",
    "phone": "0123456789",
    "avatar_url": null,
    "academic_title": null,
    "specialization": null
  }
}
```

---

### 1.6 Kích hoạt tài khoản
```
POST /api/auth/activate
```
**Public**

**Request body:**
```json
{
  "token": "string (bắt buộc — từ link email)",
  "password": "string (bắt buộc, >= 8 ký tự)"
}
```

**Response 200:** Giống response login (tự động đăng nhập sau kích hoạt)

**Errors:** `400` token không hợp lệ/đã kích hoạt | `410` token hết hạn

---

### 1.7 Yêu cầu gửi lại email kích hoạt
```
POST /api/auth/request-activation
```
**Public**

**Request body:**
```json
{
  "email": "string (bắt buộc)"
}
```

**Response 200:**
```json
{ "message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email kích hoạt." }
```

---

### 1.8 Quên mật khẩu
```
POST /api/auth/forgot-password
```
**Public**

**Request body:**
```json
{
  "email": "string (bắt buộc)"
}
```

**Response 200:**
```json
{ "message": "Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu." }
```

---

### 1.9 Đặt lại mật khẩu
```
POST /api/auth/reset-password
```
**Public**

**Request body:**
```json
{
  "token": "string (bắt buộc — từ link email)",
  "password": "string (bắt buộc, >= 8 ký tự)"
}
```

**Response 200:**
```json
{ "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập." }
```

**Errors:** `400` | `410` token hết hạn

---

### 1.10 Đổi mật khẩu
```
POST /api/auth/change-password
```
**Auth**

**Request body:**
```json
{
  "currentPassword": "string (bắt buộc)",
  "newPassword": "string (bắt buộc, >= 8 ký tự)"
}
```

**Response 200:**
```json
{ "message": "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." }
```

> Sau đổi mật khẩu, tất cả refresh token bị thu hồi — FE cần chuyển về trang login.

---

## 2. Admin & Import (`/api/admin`)

> **Tất cả endpoint yêu cầu: Auth + Role: `admin` hoặc `manager`**

### 2.1 Danh sách users
```
GET /api/admin/users
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `role` | string | Filter theo role: `student`, `lecturer`, `manager`, `admin` |
| `status` | string | Filter theo account_status |
| `department` | string | Filter theo khoa |
| `search` | string | Tìm theo full_name, email, student_code |
| `page` | number | Trang (mặc định 1) |
| `limit` | number | Số bản ghi (mặc định 20, max 100) |

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "a@edu.vn",
      "role": "student",
      "student_code": "20110001",
      "class_name": "20TCLC_DT1",
      "major": "CNTT",
      "department": "Khoa CNTT",
      "account_status": "active",
      "is_active": true,
      "last_login_at": "2026-03-25T10:00:00Z",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 150
}
```

---

### 2.2 Chi tiết user
```
GET /api/admin/users/:id
```

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "a@edu.vn",
    "phone": "0123456789",
    "avatar_url": null,
    "date_of_birth": null,
    "gender": null,
    "role": "student",
    "student_code": "20110001",
    "class_name": "20TCLC_DT1",
    "intake_year": 2020,
    "expected_graduation_year": null,
    "major": "CNTT",
    "department": "Khoa CNTT",
    "academic_title": null,
    "specialization": null,
    "account_status": "active",
    "is_active": true,
    "is_verified": true,
    "source": "import",
    "last_login_at": "2026-03-25T10:00:00Z",
    "last_login_ip": "192.168.1.1",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 2.3 Tạo user
```
POST /api/admin/users
```

**Request body:**
```json
{
  "email": "string (bắt buộc)",
  "fullName": "string (bắt buộc)",
  "role": "student | lecturer | manager | admin (bắt buộc)",
  "major": "string (tùy chọn)",
  "department": "string (tùy chọn)",
  "phone": "string (tùy chọn)",
  "academicTitle": "string (tùy chọn)",
  "specialization": "string (tùy chọn)",
  "password": "string (tùy chọn, >= 8 ký tự — nếu không có sẽ gửi email kích hoạt)",
  "sendActivation": "boolean (mặc định true)"
}
```

> Chỉ `admin` mới tạo được role `admin`.

**Response 201:**
```json
{
  "user": {
    "id": 5,
    "full_name": "Trần Văn B",
    "email": "b@edu.vn",
    "role": "student",
    "account_status": "pending_activation",
    "is_active": false
  }
}
```

**Errors:** `400` | `403` không có quyền tạo admin | `409` email đã tồn tại

---

### 2.4 Cập nhật trạng thái user
```
PATCH /api/admin/users/:id/status
```

**Request body:**
```json
{
  "accountStatus": "pending_activation | active | locked | suspended | graduated"
}
```

> Không thể thay đổi trạng thái chính mình. Manager không thể thay đổi admin.

**Response 200:**
```json
{
  "message": "Đã cập nhật trạng thái → active",
  "user": { "id": 1, "full_name": "...", "email": "...", "role": "...", "account_status": "active", "is_active": true }
}
```

---

### 2.5 Xóa user (soft delete)
```
DELETE /api/admin/users/:id
```

**Response 200:**
```json
{ "message": "Đã xóa tài khoản (soft delete)" }
```

---

### 2.6 Import sinh viên từ CSV
```
POST /api/admin/import-students
```

**Content-Type:** `multipart/form-data`

| Field | Type | Mô tả |
|-------|------|-------|
| `file` | file (.csv) | File CSV, max 5MB. Cột bắt buộc: `email`, `full_name`. Cột tùy chọn: `student_code`, `class_name`, `major`, `department`, `intake_year` |
| `semester` | string | Học kỳ (tùy chọn) |

**Response 201:**
```json
{
  "batchId": 1,
  "batchType": "student",
  "totalRows": 50,
  "success": 45,
  "failed": 2,
  "skipped": 3,
  "emailsSent": 45,
  "errors": [
    { "row": 5, "email": "dup@edu.vn", "reason": "Email đã tồn tại — bỏ qua" }
  ]
}
```

---

### 2.7 Import giảng viên từ CSV
```
POST /api/admin/import-lecturers
```

**Content-Type:** `multipart/form-data`

Giống import sinh viên, nhưng CSV có thêm cột tùy chọn: `academic_title`, `specialization`, `department`.

---

### 2.8 Lịch sử import
```
GET /api/admin/import-batches
```

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "imported_by": 1,
      "imported_by_name": "Admin",
      "file_name": "students.csv",
      "batch_type": "student",
      "semester": "HK1 2025-2026",
      "total_rows": 50,
      "success_rows": 45,
      "failed_rows": 2,
      "skipped_rows": 3,
      "status": "completed",
      "imported_at": "2026-03-25T10:00:00Z"
    }
  ]
}
```

---

### 2.9 Chi tiết import batch
```
GET /api/admin/import-batches/:id
```

**Response 200:** Thông tin batch + danh sách users đã import
```json
{
  "id": 1,
  "imported_by_name": "Admin",
  "...batch_fields": "...",
  "users": [
    { "id": 10, "email": "sv@edu.vn", "full_name": "SV A", "student_code": "20110001", "role": "student", "account_status": "pending_activation" }
  ]
}
```

---

### 2.10 Gửi lại email kích hoạt
```
POST /api/admin/resend-activation
```

**Request body:**
```json
{
  "email": "string (bắt buộc)"
}
```

**Response 200:**
```json
{ "message": "Đã gửi lại email kích hoạt" }
```

**Errors:** `400` tài khoản không ở trạng thái pending_activation | `404` user không tồn tại

---

## 3. Users (`/api/users`)

### 3.1 Lấy danh sách báo cáo yêu thích
```
GET /api/users/me/favorites
```
**Auth**

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Báo cáo đồ án",
      "description": "...",
      "project_id": 5,
      "file_url": "reports/2026/03/abc.pdf",
      "visibility": "course",
      "view_count": 10,
      "created_at": "2026-03-25T10:00:00Z"
    }
  ]
}
```

---

## 4. Courses (Lớp học phần) (`/api/courses`)

### 4.1 Danh sách lớp học phần
```
GET /api/courses
```
**Auth**

> Kết quả filter theo role: Admin/Manager thấy tất cả, Lecturer thấy lớp mình, Student thấy lớp đã enroll.

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Đồ án 1",
      "code": "DA1_2025",
      "description": "...",
      "semester": "HK1",
      "academic_year": "2025-2026",
      "course_type": "project",
      "lecturer_id": 5,
      "lecturer_name": "GV A",
      "lecturer_email": "gva@edu.vn",
      "student_count": 30,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### 4.2 Lớp tôi đã tham gia (Student)
```
GET /api/courses/my/enrollments
```
**Auth**

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Đồ án 1",
      "code": "DA1_2025",
      "description": "...",
      "semester": "HK1",
      "lecturer_name": "GV A",
      "lecturer_email": "gva@edu.vn",
      "enrolled_at": "2026-02-01T00:00:00Z",
      "student_count": 30
    }
  ]
}
```

---

### 4.3 Chi tiết lớp
```
GET /api/courses/:id
```
**Auth** — Admin thấy tất cả, Lecturer thấy lớp mình, Student thấy lớp đã enroll.

**Response 200:**
```json
{
  "id": 1,
  "name": "Đồ án 1",
  "code": "DA1_2025",
  "description": "...",
  "semester": "HK1",
  "academic_year": "2025-2026",
  "course_type": "project",
  "lecturer_id": 5,
  "lecturer_name": "GV A",
  "lecturer_email": "gva@edu.vn",
  "student_count": 30,
  "students": [
    { "id": 10, "full_name": "SV A", "email": "sva@edu.vn", "major": "CNTT", "enrolled_at": "2026-02-01T00:00:00Z" }
  ],
  "report_count": 15
}
```

---

### 4.4 Tạo lớp
```
POST /api/courses
```
**Auth + Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "name": "string (bắt buộc)",
  "code": "string (bắt buộc — mã lớp duy nhất)",
  "description": "string (tùy chọn)",
  "semester": "string (bắt buộc, vd: HK1)",
  "academicYear": "string (bắt buộc, vd: 2025-2026)",
  "courseType": "project | thesis | research | internship (mặc định: project)"
}
```

> Loại `thesis` chỉ `manager` hoặc `admin` được tạo.

**Response 201:** Object course đã tạo

**Errors:** `400` | `403` không có quyền tạo thesis | `409` mã lớp đã tồn tại

---

### 4.5 Sửa lớp
```
PUT /api/courses/:id
```
**Auth + Role: `lecturer`, `manager`, `admin`** — Lecturer phải là owner.

**Request body:**
```json
{
  "name": "string (tùy chọn)",
  "description": "string (tùy chọn)",
  "semester": "string (tùy chọn)"
}
```

**Response 200:** Object course sau cập nhật

---

### 4.6 Xóa lớp (soft delete)
```
DELETE /api/courses/:id
```
**Auth + Role: `lecturer`, `manager`, `admin`** — Lecturer phải là owner.

**Response 200:**
```json
{ "message": "Course archived (soft delete)" }
```

---

### 4.7 Thêm sinh viên vào lớp
```
POST /api/courses/:id/enroll
```
**Auth + Role: `lecturer`, `manager`, `admin`** — Lecturer phải là owner.

**Request body (1 trong 2):**
```json
{
  "studentId": 10
}
```
hoặc
```json
{
  "email": "sv@edu.vn"
}
```

**Response 201:**
```json
{
  "id": 1,
  "course_id": 1,
  "student_id": 10,
  "enrolled_at": "2026-03-25T10:00:00Z",
  "student_name": "SV A",
  "student_email": "sva@edu.vn"
}
```

**Errors:** `400` thiếu cả studentId lẫn email / chỉ thêm được student | `404` không tìm thấy

---

### 4.8 Xóa sinh viên khỏi lớp
```
DELETE /api/courses/:id/unenroll/:studentId
```
**Auth + Role: `lecturer`, `manager`, `admin`** — Lecturer phải là owner.

**Response 200:**
```json
{ "message": "Đã xóa sinh viên khỏi lớp" }
```

---

## 5. Projects (Đồ án / Đề tài) (`/api/projects`)

> **Tất cả endpoint yêu cầu Auth**

### 5.1 Danh sách đồ án
```
GET /api/projects
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `courseId` | number | Filter theo lớp |
| `status` | string | Filter theo trạng thái |
| `search` | string | Tìm theo title/description |
| `page` | number | Trang |
| `limit` | number | Số bản ghi |

> Student chỉ thấy project mình hoặc project trong lớp đã enroll. Lecturer thấy project mình hướng dẫn hoặc trong lớp mình dạy.

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Xây dựng hệ thống quản lý",
      "description": "...",
      "status": "in_progress",
      "student_id": 10,
      "student_name": "SV A",
      "student_email": "sva@edu.vn",
      "supervisor_id": 5,
      "supervisor_name": "GV A",
      "supervisor_email": "gva@edu.vn",
      "course_id": 1,
      "course_name": "Đồ án 1",
      "course_code": "DA1_2025",
      "start_date": "2026-03-01",
      "end_date": "2026-06-01",
      "tags": ["web", "react"],
      "created_at": "2026-03-01T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 50
}
```

---

### 5.2 Chi tiết đồ án
```
GET /api/projects/:id
```

**Response 200:** Bao gồm milestones, mentors, reports
```json
{
  "id": 1,
  "title": "...",
  "description": "...",
  "status": "in_progress",
  "student_name": "SV A",
  "supervisor_name": "GV A",
  "course_name": "Đồ án 1",
  "start_date": "2026-03-01",
  "end_date": "2026-06-01",
  "tags": ["web"],
  "milestones": [
    { "id": 1, "milestone": "Phân tích yêu cầu", "status": "completed", "order_index": 0, "due_date": "2026-03-15" }
  ],
  "mentors": [
    { "id": 1, "mentor_id": 5, "mentor_name": "GV A", "status": "active" }
  ],
  "reports": [
    { "id": 1, "title": "Báo cáo tuần 1", "status": "approved", "created_at": "..." }
  ]
}
```

---

### 5.3 Tạo đồ án
```
POST /api/projects
```

**Request body:**
```json
{
  "title": "string (bắt buộc)",
  "description": "string (tùy chọn)",
  "courseId": "number (tùy chọn)",
  "studentId": "number (bắt buộc nếu role không phải student)",
  "startDate": "string YYYY-MM-DD (bắt buộc)",
  "endDate": "string YYYY-MM-DD (tùy chọn)",
  "tags": ["string array (tùy chọn)"]
}
```

> Student tạo thì `studentId` tự lấy từ token. Staff tạo hộ cần truyền `studentId`.

**Response 201:** Object project đã tạo

---

### 5.4 Sửa đồ án
```
PUT /api/projects/:id
```

**Request body:**
```json
{
  "title": "string (tùy chọn)",
  "description": "string (tùy chọn)",
  "endDate": "string (tùy chọn)",
  "tags": ["string array (tùy chọn)"]
}
```

**Response 200:** Object project sau cập nhật

---

### 5.5 Duyệt / Đổi trạng thái đồ án
```
PATCH /api/projects/:id/status
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "status": "pending | approved | in_progress | submitted | defending | completed | cancelled"
}
```

> Khi `approved` hoặc `cancelled`, hệ thống gửi notification cho sinh viên.

**Response 200:** Object project sau cập nhật

---

### 5.6 Gán GV hướng dẫn
```
PATCH /api/projects/:id/supervisor
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "supervisorId": "number (bắt buộc)"
}
```

**Response 200:** Object project sau cập nhật

---

### 5.7 Xóa đồ án (soft delete)
```
DELETE /api/projects/:id
```

**Response 200:**
```json
{ "message": "Đã xóa đồ án (soft delete)" }
```

---

## 6. Reports (Báo cáo) (`/api/reports`)

> **Tất cả endpoint yêu cầu Auth**

### 6.1 Danh sách báo cáo
```
GET /api/reports
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `status` | string | `pending`, `under_review`, `revision_needed`, `approved`, `rejected` |
| `courseId` | number | Filter theo lớp |
| `authorId` | number | Filter theo tác giả |
| `projectId` | number | Filter theo đồ án |
| `dateFrom` | string | Từ ngày (ISO) |
| `dateTo` | string | Đến ngày (ISO) |
| `search` | string | Tìm theo title/description |
| `sort` | string | `recent` (mặc định) \| `popular` \| `rated` |
| `page` | number | Trang |
| `limit` | number | Số bản ghi |

> Visibility filter tự động theo role: Student thấy báo cáo mình + public + cùng lớp. Lecturer thấy của lớp mình dạy. Admin/Manager thấy tất cả.

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Báo cáo đồ án tuần 1",
      "description": "...",
      "file_type": "pdf",
      "file_name": "report.pdf",
      "status": "approved",
      "visibility": "course",
      "view_count": 20,
      "download_count": 5,
      "author_id": 10,
      "author_name": "SV A",
      "author_email": "sva@edu.vn",
      "course_id": 1,
      "course_name": "Đồ án 1",
      "project_id": 1,
      "avg_rating": 4.5,
      "rating_count": 3,
      "created_at": "2026-03-25T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 100
}
```

---

### 6.2 Chi tiết báo cáo
```
GET /api/reports/:id
```

> Tự động tăng `view_count`. Kiểm tra quyền xem theo visibility.

**Response 200:** Toàn bộ thông tin report bao gồm `author_name`, `course_name`, `course_code`, `reviewer_name`, `avg_rating`, `rating_count`, `version_count`.

---

### 6.3 Tạo báo cáo
```
POST /api/reports
```

**Content-Type:** `multipart/form-data`

| Field | Type | Mô tả |
|-------|------|-------|
| `file` | file | PDF, DOCX, hoặc ZIP (max 50MB — cấu hình qua env) |
| `title` | string | **Bắt buộc** |
| `description` | string | Tùy chọn |
| `visibility` | string | `private` \| `course` \| `department` \| `public` (mặc định: `course`) |
| `projectId` | number | Tùy chọn |
| `courseId` | number | Tùy chọn (Student phải đã enroll) |
| `researchPaperId` | number | Tùy chọn |

> Hệ thống kiểm tra file trùng lặp bằng SHA-256 hash. File PDF/DOCX được xử lý background (trích xuất nội dung).

**Response 201:** Object report đã tạo

**Errors:** `400` file không hợp lệ/quá lớn | `403` chưa enroll | `409` file trùng

---

### 6.4 Sửa báo cáo (metadata)
```
PATCH /api/reports/:id
```

**Request body:**
```json
{
  "title": "string (tùy chọn)",
  "description": "string (tùy chọn)",
  "visibility": "string (tùy chọn)",
  "projectId": "number (tùy chọn)",
  "courseId": "number (tùy chọn)",
  "researchPaperId": "number (tùy chọn)"
}
```

> Student chỉ sửa được báo cáo của mình. Staff sửa được tất cả.

**Response 200:** Object report sau cập nhật

---

### 6.5 Xóa báo cáo (soft delete)
```
DELETE /api/reports/:id
```

**Response 200:**
```json
{ "message": "Đã xóa báo cáo (soft delete)" }
```

---

### 6.6 Duyệt báo cáo (Staff)
```
PATCH /api/reports/:id/status
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "status": "under_review | revision_needed | approved | rejected",
  "reviewNote": "string (tùy chọn — ghi chú cho tác giả)"
}
```

> Hệ thống gửi notification cho tác giả khi approved/rejected/revision_needed.

**Response 200:** Object report sau cập nhật

---

### 6.7 Nộp lại báo cáo (Resubmit)
```
POST /api/reports/:id/resubmit
```

**Content-Type:** `multipart/form-data`

| Field | Type | Mô tả |
|-------|------|-------|
| `file` | file | **Bắt buộc** — file mới |
| `changeSummary` | string | Tóm tắt thay đổi (tùy chọn) |

> Chỉ tác giả, chỉ khi trạng thái `revision_needed` hoặc `rejected`. Tạo version mới, reset status → `pending`.

**Response 200:** Object report + `version_number`

---

### 6.8 Download báo cáo
```
GET /api/reports/:id/download
```

> Trả presigned URL (MinIO). Kiểm tra quyền xem. Tăng `download_count`.

**Response 200:**
```json
{
  "url": "https://minio.example.com/presigned-url...",
  "fileName": "report.pdf"
}
```

---

### 6.9 Danh sách versions
```
GET /api/reports/:id/versions
```

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "report_id": 1,
      "version_number": 1,
      "file_url": "reports/2026/03/abc.pdf",
      "file_size": 1048576,
      "file_hash": "sha256...",
      "change_summary": "Bản nộp đầu tiên",
      "created_by": 10,
      "created_by_name": "SV A",
      "created_at": "2026-03-25T10:00:00Z"
    }
  ]
}
```

---

### 6.10 Download version cụ thể
```
GET /api/reports/:id/versions/:versionId/download
```

**Response 200:**
```json
{ "url": "https://minio.example.com/presigned-url..." }
```

---

### 6.11 Đánh giá báo cáo (Upsert rating)
```
POST /api/reports/:id/rating
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "rating": "number 1-5 (bắt buộc)",
  "comment": "string (tùy chọn)"
}
```

**Response 201:** Object rating (nếu đã có thì cập nhật)

---

### 6.12 Lấy danh sách đánh giá
```
GET /api/reports/:id/ratings
```

**Response 200:**
```json
{
  "avgRating": 4.5,
  "count": 3,
  "items": [
    {
      "id": 1,
      "user_id": 5,
      "user_name": "GV A",
      "report_id": 1,
      "rating": 5,
      "comment": "Tốt lắm!",
      "created_at": "2026-03-25T10:00:00Z"
    }
  ]
}
```

---

### 6.13 Thêm vào yêu thích
```
POST /api/reports/:id/favorite
```
**Auth**

**Response 201:**
```json
{ "id": 1, "user_id": 10, "report_id": 1 }
```

hoặc `200` nếu đã favorite:
```json
{ "message": "Already favorited" }
```

---

### 6.14 Bỏ yêu thích
```
DELETE /api/reports/:id/favorite
```
**Auth**

**Response 200:**
```json
{ "message": "Favorite removed" }
```

---

## 7. Research Papers (NCKH) (`/api/research-papers`)

> **Tất cả endpoint yêu cầu Auth**

### 7.1 Danh sách bài NCKH
```
GET /api/research-papers
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `courseId` | number | Filter theo lớp |
| `status` | string | `draft`, `submitted`, `under_review`, `revision`, `accepted`, `published`, `rejected` |
| `search` | string | Tìm theo title/abstract |
| `page` | number | Trang |
| `limit` | number | Số bản ghi |

> Student chỉ thấy bài mình. Lecturer thấy bài mình hướng dẫn. Admin/Manager thấy tất cả.

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Ứng dụng AI trong giáo dục",
      "abstract": "...",
      "keywords": ["AI", "education"],
      "status": "published",
      "student_id": 10,
      "student_name": "SV A",
      "supervisor_id": 5,
      "supervisor_name": "GV A",
      "doi": "10.1234/example",
      "journal_name": "Journal of Education",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 10
}
```

---

### 7.2 Chi tiết bài NCKH
```
GET /api/research-papers/:id
```

**Response 200:** Full object bao gồm `student_name`, `student_email`, `supervisor_name`, `supervisor_email`, `course_name`

---

### 7.3 Tạo bài NCKH
```
POST /api/research-papers
```

**Request body:**
```json
{
  "title": "string (bắt buộc)",
  "abstract": "string (tùy chọn)",
  "keywords": ["string array (tùy chọn)"],
  "courseId": "number (tùy chọn)",
  "supervisorId": "number (tùy chọn)",
  "studentId": "number (bắt buộc nếu role không phải student)",
  "fileUrl": "string (tùy chọn)"
}
```

**Response 201:** Object research paper (status mặc định: `draft`)

---

### 7.4 Sửa bài NCKH
```
PUT /api/research-papers/:id
```

**Request body:**
```json
{
  "title": "string (tùy chọn)",
  "abstract": "string (tùy chọn)",
  "keywords": ["string array (tùy chọn)"],
  "fileUrl": "string (tùy chọn)",
  "journalName": "string (tùy chọn)",
  "conferenceName": "string (tùy chọn)"
}
```

**Response 200:** Object sau cập nhật

---

### 7.5 Đổi trạng thái + thông tin xuất bản
```
PATCH /api/research-papers/:id/status
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "status": "draft | submitted | under_review | revision | accepted | published | rejected",
  "doi": "string (tùy chọn, vd: 10.1234/example)",
  "issn": "string (tùy chọn)",
  "indexType": "ISI | Scopus | other (tùy chọn)",
  "publicationDate": "string YYYY-MM-DD (tùy chọn)"
}
```

> Khi status chuyển sang `published`, hệ thống gửi notification cho sinh viên.

**Response 200:** Object sau cập nhật

---

### 7.6 Gán GV hướng dẫn NCKH
```
PATCH /api/research-papers/:id/supervisor
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "supervisorId": "number (bắt buộc)"
}
```

**Response 200:** Object sau cập nhật

---

### 7.7 Xóa bài NCKH (soft delete)
```
DELETE /api/research-papers/:id
```

**Response 200:**
```json
{ "message": "Đã xóa (soft delete)" }
```

---

## 8. Milestones (Tiến độ) (`/api/milestones`)

> **Tất cả endpoint yêu cầu Auth**

### 8.1 Danh sách milestones theo project
```
GET /api/milestones/project/:projectId
```

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "project_id": 1,
      "milestone": "Phân tích yêu cầu",
      "description": "Thu thập và phân tích requirements",
      "status": "completed",
      "order_index": 0,
      "due_date": "2026-03-15",
      "completed_at": "2026-03-14T10:00:00Z",
      "completed_by": 10,
      "completed_by_name": "SV A"
    }
  ]
}
```

---

### 8.2 Tạo milestone
```
POST /api/milestones/project/:projectId
```

**Request body:**
```json
{
  "milestone": "string (bắt buộc — tên milestone)",
  "description": "string (tùy chọn)",
  "orderIndex": "number (tùy chọn, mặc định 0)",
  "dueDate": "string YYYY-MM-DD (tùy chọn)"
}
```

> Student chỉ tạo cho project mình. Staff tạo cho bất kỳ.

**Response 201:** Object milestone đã tạo

---

### 8.3 Tạo nhiều milestones cùng lúc
```
POST /api/milestones/project/:projectId/bulk
```

**Request body:**
```json
{
  "milestones": [
    { "milestone": "Phân tích yêu cầu", "description": "...", "orderIndex": 0, "dueDate": "2026-03-15" },
    { "milestone": "Thiết kế CSDL", "orderIndex": 1, "dueDate": "2026-03-30" },
    { "milestone": "Lập trình", "orderIndex": 2, "dueDate": "2026-05-01" }
  ]
}
```

**Response 201:**
```json
{ "items": [/* array milestones đã tạo */] }
```

---

### 8.4 Sửa milestone
```
PUT /api/milestones/:id
```

**Request body:**
```json
{
  "milestone": "string (tùy chọn)",
  "description": "string (tùy chọn)",
  "orderIndex": "number (tùy chọn)",
  "dueDate": "string (tùy chọn)"
}
```

**Response 200:** Object milestone sau cập nhật

---

### 8.5 Đổi trạng thái milestone
```
PATCH /api/milestones/:id/status
```

**Request body:**
```json
{
  "status": "pending | in_progress | completed | overdue | skipped"
}
```

> Khi `completed`, tự động set `completed_at` và `completed_by`.

**Response 200:** Object milestone sau cập nhật

---

### 8.6 Xóa milestone
```
DELETE /api/milestones/:id
```

**Response 200:**
```json
{ "message": "Đã xóa milestone" }
```

---

## 9. Mentorships (Hướng dẫn) (`/api/mentorships`)

> **Tất cả endpoint yêu cầu Auth**

### 9.1 Danh sách quan hệ hướng dẫn
```
GET /api/mentorships
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `projectId` | number | Filter theo đồ án |
| `courseId` | number | Filter theo lớp |

> Student thấy mentorship của mình. Lecturer thấy mentorship mình là mentor. Admin/Manager thấy tất cả.

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "student_id": 10,
      "student_name": "SV A",
      "student_email": "sva@edu.vn",
      "mentor_id": 5,
      "mentor_name": "GV A",
      "mentor_email": "gva@edu.vn",
      "project_id": 1,
      "project_title": "Đề tài XYZ",
      "course_id": 1,
      "status": "active",
      "start_date": "2026-03-01",
      "end_date": null,
      "note": null,
      "created_at": "2026-03-01T00:00:00Z"
    }
  ]
}
```

---

### 9.2 Tạo quan hệ hướng dẫn
```
POST /api/mentorships
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "studentId": "number (bắt buộc)",
  "mentorId": "number (bắt buộc)",
  "projectId": "number (tùy chọn)",
  "courseId": "number (tùy chọn)",
  "startDate": "string YYYY-MM-DD (bắt buộc)",
  "note": "string (tùy chọn)"
}
```

> Hệ thống gửi notification cho cả SV và GV.

**Response 201:** Object mentorship đã tạo

**Errors:** `404` SV/GV không tồn tại | `409` quan hệ đã tồn tại

---

### 9.3 Đổi trạng thái quan hệ hướng dẫn
```
PATCH /api/mentorships/:id/status
```
**Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "status": "active | completed | terminated",
  "endDate": "string YYYY-MM-DD (tùy chọn)",
  "note": "string (tùy chọn)"
}
```

**Response 200:** Object sau cập nhật

---

### 9.4 Xóa quan hệ hướng dẫn
```
DELETE /api/mentorships/:id
```
**Role: `lecturer`, `manager`, `admin`**

**Response 200:**
```json
{ "message": "Đã xóa quan hệ hướng dẫn" }
```

---

## 10. Notifications (Thông báo) (`/api/notifications`)

> **Tất cả endpoint yêu cầu Auth**

### 10.1 Danh sách thông báo của tôi
```
GET /api/notifications
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| `unreadOnly` | string | `true` để chỉ lấy chưa đọc |
| `page` | number | Trang |
| `limit` | number | Số bản ghi |

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 10,
      "type": "report.approved",
      "title": "Báo cáo được duyệt",
      "message": "Báo cáo \"XYZ\" đã được duyệt.",
      "ref_type": "report",
      "ref_id": 5,
      "channels": ["in_app"],
      "is_read": false,
      "read_at": null,
      "sent_at": "2026-03-25T10:00:00Z",
      "created_at": "2026-03-25T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 30,
  "unreadCount": 5
}
```

**Notification types (để FE render icon/màu):**

| Type | Mô tả |
|------|-------|
| `report.approved` | Báo cáo được duyệt |
| `report.rejected` | Báo cáo bị từ chối |
| `report.revision_needed` | Báo cáo cần chỉnh sửa |
| `project.approved` | Đề tài được duyệt |
| `project.cancelled` | Đề tài bị hủy |
| `project.supervisor_assigned` | Được gán GV hướng dẫn |
| `research.published` | Bài NCKH được xuất bản |
| `mentorship.assigned` | Được gán quan hệ hướng dẫn |

**`ref_type` + `ref_id`:** Dùng để navigate khi click notification.

| ref_type | Navigate đến |
|----------|-------------|
| `report` | `/reports/:ref_id` |
| `project` | `/projects/:ref_id` |
| `course` | `/courses/:ref_id` |
| `user` | `/users/:ref_id` |

---

### 10.2 Đánh dấu đã đọc (1 thông báo)
```
PATCH /api/notifications/:id/read
```

**Response 200:**
```json
{ "message": "Đã đánh dấu đã đọc" }
```

---

### 10.3 Đánh dấu tất cả đã đọc
```
PATCH /api/notifications/read-all
```

**Response 200:**
```json
{ "message": "Đã đánh dấu tất cả đã đọc", "count": 5 }
```

---

### 10.4 Xóa thông báo
```
DELETE /api/notifications/:id
```

**Response 200:**
```json
{ "message": "Đã xóa thông báo" }
```

---

## 11. RAG (Tìm kiếm ngữ nghĩa) (`/api/rag`)

### 11.1 Lưu embeddings
```
POST /api/rag/embeddings
```
**Auth + Role: `lecturer`, `manager`, `admin`**

**Request body:**
```json
{
  "chunks": [
    {
      "content": "Nội dung văn bản chunk 1",
      "embedding": [0.01, -0.02, 0.03, "...vector numbers"]
    },
    {
      "content": "Nội dung văn bản chunk 2",
      "embedding": [0.04, -0.05, 0.06, "...vector numbers"]
    }
  ]
}
```

**Response 201:**
```json
{
  "inserted": 2,
  "items": [
    { "id": 1, "content": "Nội dung văn bản chunk 1" },
    { "id": 2, "content": "Nội dung văn bản chunk 2" }
  ]
}
```

---

### 11.2 Tìm kiếm ngữ nghĩa
```
POST /api/rag/search
```
**Auth**

**Request body:**
```json
{
  "embedding": [0.01, -0.02, "...vector of query"],
  "topK": 5
}
```

**Response 200:**
```json
{
  "results": [
    { "id": 1, "content": "Nội dung liên quan nhất", "score": 0.95 },
    { "id": 3, "content": "Nội dung liên quan thứ 2", "score": 0.87 }
  ]
}
```

---

### 11.3 Hỏi đáp RAG (QA)
```
POST /api/rag/qa
```
**Auth**

**Request body:**
```json
{
  "question": "Cách triển khai microservice là gì?",
  "embedding": [0.01, -0.02, "...vector of question"],
  "topK": 5
}
```

**Response 200:**
```json
{
  "question": "Cách triển khai microservice là gì?",
  "answer": "Placeholder — cần tích hợp LLM",
  "contexts": [
    { "id": 1, "content": "...", "score": 0.95 }
  ]
}
```

> **Lưu ý:** `answer` hiện là placeholder. FE cần embedding model (gọi API bên ngoài như OpenAI) để tạo vector trước khi gọi search/qa.

---

## 12. Stats (Thống kê) (`/api/stats`)

### 12.1 Tổng quan hệ thống
```
GET /api/stats/overview
```
**Auth + Role: `admin`, `manager`**

**Response 200:**
```json
{
  "totalStudents": 500,
  "totalProjects": 120,
  "totalReports": 350,
  "totalPlagiarismChecks": 80,
  "totalFeedback": 200,
  "totalRagQueries": 1500
}
```

---

## Phụ lục: Tham khảo nhanh

### Tất cả Endpoints (tóm tắt)

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| POST | `/api/auth/login` | - | - | Đăng nhập |
| POST | `/api/auth/refresh` | - | - | Refresh token |
| POST | `/api/auth/logout` | - | - | Đăng xuất |
| POST | `/api/auth/logout-all` | Yes | All | Đăng xuất tất cả |
| GET | `/api/auth/me` | Yes | All | Thông tin user hiện tại |
| POST | `/api/auth/activate` | - | - | Kích hoạt tài khoản |
| POST | `/api/auth/request-activation` | - | - | Gửi lại email kích hoạt |
| POST | `/api/auth/forgot-password` | - | - | Quên mật khẩu |
| POST | `/api/auth/reset-password` | - | - | Đặt lại mật khẩu |
| POST | `/api/auth/change-password` | Yes | All | Đổi mật khẩu |
| | | | | |
| GET | `/api/admin/users` | Yes | admin, manager | Danh sách users |
| GET | `/api/admin/users/:id` | Yes | admin, manager | Chi tiết user |
| POST | `/api/admin/users` | Yes | admin, manager | Tạo user |
| PATCH | `/api/admin/users/:id/status` | Yes | admin, manager | Đổi trạng thái user |
| DELETE | `/api/admin/users/:id` | Yes | admin, manager | Xóa user |
| POST | `/api/admin/import-students` | Yes | admin, manager | Import SV từ CSV |
| POST | `/api/admin/import-lecturers` | Yes | admin, manager | Import GV từ CSV |
| GET | `/api/admin/import-batches` | Yes | admin, manager | Lịch sử import |
| GET | `/api/admin/import-batches/:id` | Yes | admin, manager | Chi tiết batch |
| POST | `/api/admin/resend-activation` | Yes | admin, manager | Gửi lại email kích hoạt |
| | | | | |
| GET | `/api/users/me/favorites` | Yes | All | Báo cáo yêu thích |
| | | | | |
| GET | `/api/courses` | Yes | All | Danh sách lớp |
| GET | `/api/courses/my/enrollments` | Yes | All | Lớp tôi tham gia |
| GET | `/api/courses/:id` | Yes | All | Chi tiết lớp |
| POST | `/api/courses` | Yes | lecturer+ | Tạo lớp |
| PUT | `/api/courses/:id` | Yes | lecturer+ | Sửa lớp |
| DELETE | `/api/courses/:id` | Yes | lecturer+ | Xóa lớp |
| POST | `/api/courses/:id/enroll` | Yes | lecturer+ | Thêm SV vào lớp |
| DELETE | `/api/courses/:id/unenroll/:studentId` | Yes | lecturer+ | Xóa SV khỏi lớp |
| | | | | |
| GET | `/api/projects` | Yes | All | Danh sách đồ án |
| GET | `/api/projects/:id` | Yes | All | Chi tiết đồ án |
| POST | `/api/projects` | Yes | All | Tạo đồ án |
| PUT | `/api/projects/:id` | Yes | All | Sửa đồ án |
| PATCH | `/api/projects/:id/status` | Yes | lecturer+ | Duyệt đồ án |
| PATCH | `/api/projects/:id/supervisor` | Yes | lecturer+ | Gán GV hướng dẫn |
| DELETE | `/api/projects/:id` | Yes | All | Xóa đồ án |
| | | | | |
| GET | `/api/reports` | Yes | All | Danh sách báo cáo |
| GET | `/api/reports/:id` | Yes | All | Chi tiết báo cáo |
| POST | `/api/reports` | Yes | All | Tạo báo cáo (multipart) |
| PATCH | `/api/reports/:id` | Yes | All | Sửa báo cáo |
| DELETE | `/api/reports/:id` | Yes | All | Xóa báo cáo |
| PATCH | `/api/reports/:id/status` | Yes | lecturer+ | Duyệt báo cáo |
| POST | `/api/reports/:id/resubmit` | Yes | All | Nộp lại (multipart) |
| GET | `/api/reports/:id/download` | Yes | All | Download |
| GET | `/api/reports/:id/versions` | Yes | All | Danh sách versions |
| GET | `/api/reports/:id/versions/:versionId/download` | Yes | All | Download version |
| POST | `/api/reports/:id/rating` | Yes | lecturer+ | Đánh giá |
| GET | `/api/reports/:id/ratings` | Yes | All | Xem đánh giá |
| POST | `/api/reports/:id/favorite` | Yes | All | Thêm yêu thích |
| DELETE | `/api/reports/:id/favorite` | Yes | All | Bỏ yêu thích |
| | | | | |
| GET | `/api/research-papers` | Yes | All | Danh sách NCKH |
| GET | `/api/research-papers/:id` | Yes | All | Chi tiết NCKH |
| POST | `/api/research-papers` | Yes | All | Tạo NCKH |
| PUT | `/api/research-papers/:id` | Yes | All | Sửa NCKH |
| PATCH | `/api/research-papers/:id/status` | Yes | lecturer+ | Đổi status NCKH |
| PATCH | `/api/research-papers/:id/supervisor` | Yes | lecturer+ | Gán GV hướng dẫn |
| DELETE | `/api/research-papers/:id` | Yes | All | Xóa NCKH |
| | | | | |
| GET | `/api/milestones/project/:projectId` | Yes | All | Milestones theo project |
| POST | `/api/milestones/project/:projectId` | Yes | All | Tạo milestone |
| POST | `/api/milestones/project/:projectId/bulk` | Yes | All | Tạo nhiều milestones |
| PUT | `/api/milestones/:id` | Yes | All | Sửa milestone |
| PATCH | `/api/milestones/:id/status` | Yes | All | Đổi trạng thái |
| DELETE | `/api/milestones/:id` | Yes | All | Xóa milestone |
| | | | | |
| GET | `/api/mentorships` | Yes | All | Danh sách mentorship |
| POST | `/api/mentorships` | Yes | lecturer+ | Tạo mentorship |
| PATCH | `/api/mentorships/:id/status` | Yes | lecturer+ | Đổi trạng thái |
| DELETE | `/api/mentorships/:id` | Yes | lecturer+ | Xóa mentorship |
| | | | | |
| GET | `/api/notifications` | Yes | All | Thông báo của tôi |
| PATCH | `/api/notifications/read-all` | Yes | All | Đọc tất cả |
| PATCH | `/api/notifications/:id/read` | Yes | All | Đọc 1 thông báo |
| DELETE | `/api/notifications/:id` | Yes | All | Xóa thông báo |
| | | | | |
| POST | `/api/rag/embeddings` | Yes | lecturer+ | Lưu embeddings |
| POST | `/api/rag/search` | Yes | All | Tìm kiếm ngữ nghĩa |
| POST | `/api/rag/qa` | Yes | All | Hỏi đáp RAG |
| | | | | |
| GET | `/api/stats/overview` | Yes | admin, manager | Thống kê tổng quan |

> **`lecturer+`** = `lecturer`, `manager`, `admin`
