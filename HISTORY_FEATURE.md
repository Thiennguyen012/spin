# Tính Năng Lưu Lịch Sử Quay Số

## Tổng Quan

Đã thêm logic để lưu lịch sử quay số vào `localStorage` và hỗ trợ xuất dữ liệu dưới các định dạng khác nhau.

## Các Tệp Được Thêm/Sửa

### 1. **[src/lib/historyStorage.ts](src/lib/historyStorage.ts)** (TỆP MỚI)

Tệp tiện ích chứa các hàm quản lý lịch sử quay:

#### Các Hàm:

- **`saveSpinToHistory(number, minRange, maxRange)`**
  - Lưu số quay vào localStorage
  - Ghi lại thời gian quay, phạm vi tối thiểu/tối đa
  - Cập nhật thời gian sửa đổi

- **`getSpinHistory()`**
  - Lấy toàn bộ lịch sử từ localStorage
  - Trả về `null` nếu không có dữ liệu

- **`clearSpinHistory()`**
  - Xóa toàn bộ lịch sử quay

- **`exportHistoryAsJSON()`**
  - Xuất lịch sử dưới dạng file JSON
  - Tên file: `lucky_spin_history_YYYY-MM-DD.json`

- **`exportHistoryAsCSV()`**
  - Xuất lịch sử dưới dạng file CSV
  - Tên file: `lucky_spin_history_YYYY-MM-DD.csv`

- **`getSpinCount()`**
  - Trả về số lần quay

### 2. **[src/components/LuckyDraw.tsx](src/components/LuckyDraw.tsx)** (ĐÃ SỬA)

Cập nhật component chính để:

- Import các hàm từ `historyStorage.ts`
- Gọi `saveSpinToHistory()` mỗi khi quay số thành công
- Gọi `clearSpinHistory()` khi xóa lịch sử

### 3. **[src/components/HistoryPanel.tsx](src/components/HistoryPanel.tsx)** (ĐÃ SỬA)

Cập nhật panel lịch sử để:

- Thêm nút "JSON" để xuất file JSON
- Thêm nút "CSV" để xuất file CSV
- Giữ nguyên nút "Xóa" nhưng sắp xếp gọn gàng hơn
- Responsive trên mobile

## Cách Sử Dụng

### Lưu Dữ liệu Tự động

- Mỗi khi quay số thành công, dữ liệu tự động được lưu vào localStorage
- Dữ liệu bao gồm:
  - Số quay
  - Thời gian quay (ISO format)
  - Phạm vi quay (min, max)
  - Thời gian tạo và cập nhật lịch sử

### Xuất Dữ Liệu

1. **Xuất JSON**: Click nút "JSON" → Tải file `.json` có đầy đủ thông tin
2. **Xuất CSV**: Click nút "CSV" → Tải file `.csv` để mở trong Excel
3. **Xóa Dữ Liệu**: Click nút "Xóa" → Xóa toàn bộ lịch sử (localStorage + UI)

## Cấu Trúc Dữ Liệu localStorage

```json
{
  "records": [
    {
      "number": 123,
      "timestamp": "2026-02-02T10:30:45.123Z",
      "date": "2026-02-02T10:30:45.123Z"
    }
  ],
  "minRange": 1,
  "maxRange": 999,
  "createdAt": "2026-02-02T10:30:00.000Z",
  "updatedAt": "2026-02-02T10:30:45.123Z"
}
```

## Lợi Ích

✅ **Dữ liệu Persistent**: Lịch sử được lưu ngay cả khi tắt trình duyệt
✅ **Xuất Linh Hoạt**: Hỗ trợ JSON (chi tiết) và CSV (Excel)
✅ **Quản Lý Dữ Liệu**: Dễ dàng xóa, xuất hoặc xem lịch sử
✅ **Ghi Chép**: Lưu tất cả thông tin liên quan (thời gian, phạm vi)
✅ **Responsive**: Giao diện phù hợp trên cả desktop và mobile

## Hỗ Trợ Lỗi

- Tất cả các hàm có xử lý try-catch để tránh lỗi
- Hiển thị thông báo lỗi nếu có vấn đề khi xuất dữ liệu
