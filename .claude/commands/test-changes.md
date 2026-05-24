# Test Changes Workflow

Khi user sửa code hoặc yêu cầu kiểm tra sau khi thay đổi:

## Bước 1: Phân tích thay đổi

1. Chạy `git diff --name-only` để xem files đã thay đổi
2. Xác định screens/components bị ảnh hưởng
3. Tìm E2E tests liên quan: `grep -rl "testID-name" e2e/specs/`

## Bước 2: Kiểm tra testID

1. Kiểm tra files thay đổi có giữ nguyên testID không
2. Nếu thêm UI element mới → thêm testID theo convention
3. Nếu xóa element có testID → cập nhật tests tương ứng

## Bước 3: Chạy tests liên quan

1. Xác định batches cần chạy dựa trên files thay đổi:
   - `src/features/auth/` → batch-01, batch-09
   - `src/features/profile/` → batch-02, batch-14
   - `src/features/challenges/` → batch-03, batch-10
   - `src/features/checkin/` hoặc `src/features/feed/` → batch-04, batch-11
   - `src/features/squad/` → batch-05, batch-12
   - `src/features/gamification/` hoặc `src/features/points/` → batch-06, batch-13
   - `src/features/notifications/` hoặc `src/features/analytics/` → batch-07
   - `src/app/navigation/` → batch-08, batch-15
   - `src/shared/` → chạy tất cả batches liên quan

2. Chạy từng batch:
   ```
   xcrun simctl terminate <UDID> com.vuongnguyen.grow; sleep 1
   xcrun simctl launch <UDID> com.vuongnguyen.grow; sleep 3
   npx wdio run e2e/wdio.agent1.conf.js --spec e2e/specs/batch-XX/file.spec.ts
   ```

## Bước 4: Fix-Until-Green

1. Nếu test fail vì code thay đổi hợp lệ → cập nhật test
2. Nếu test fail vì bug trong code mới → sửa code
3. Lặp đến khi ALL PASS

## Bước 5: Viết tests mới (nếu cần)

1. Nếu thay đổi thêm flow/screen mới → viết test mới
2. Đặt trong batch phù hợp hoặc tạo batch mới
3. Chạy fix-until-green cho tests mới

## Bước 6: Báo cáo

- Files thay đổi
- Tests chạy + kết quả
- Tests mới viết (nếu có)
- Regressions phát hiện và sửa
