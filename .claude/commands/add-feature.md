# Add Feature Workflow

Khi user yêu cầu thêm tính năng mới, thực hiện workflow sau:

## Phase 1: Phân tích & Lên kế hoạch

1. **Phân tích yêu cầu** - Hiểu rõ tính năng cần thêm
2. **Phân tích codebase** - Đọc code liên quan (navigation, screens, API, state)
3. **Lên kế hoạch** với format:
   - Screens cần tạo/sửa
   - Navigation routes cần thêm
   - API endpoints / Supabase queries
   - Redux state changes
   - Components cần tạo
   - testID cần thêm (theo convention trong CLAUDE.md)
4. **Trình bày kế hoạch** cho user review trước khi code

## Phase 2: Implement

1. **Tạo/sửa files** theo kế hoạch đã duyệt
2. **Luôn thêm testID** cho mọi interactive element (buttons, inputs, lists, cards)
3. **Đảm bảo** navigation routes được đăng ký trong RootNavigator
4. **Đảm bảo** deep links nếu cần trong linkingConfig.ts

## Phase 3: Automation Testing (Fix-Until-Green Loop)

1. **Viết E2E test specs** trong `e2e/specs/batch-XX-{feature}/`
2. **Chạy tests trên simulator**:
   ```
   xcrun simctl terminate <UDID> com.vuongnguyen.grow; sleep 1
   xcrun simctl launch <UDID> com.vuongnguyen.grow; sleep 3
   npx wdio run e2e/wdio.agent1.conf.js --spec e2e/specs/batch-XX/file.spec.ts
   ```
3. **Fix loop**: Nếu test fail:
   - Lỗi test code → sửa test → chạy lại
   - Lỗi feature code → sửa feature → chạy lại
   - Lặp đến khi ALL PASS
4. **Regression check**: Chạy batches liên quan để đảm bảo không break gì

## Phase 4: Báo cáo

1. Tổng hợp files đã tạo/sửa
2. Tests đã viết và kết quả
3. Bugs phát hiện và sửa trong quá trình test

---

**Quan trọng**: Không skip bước testing. Mỗi feature PHẢI có E2E tests trước khi hoàn tất.
