# E2E Test Status

Kiểm tra trạng thái E2E test suite:

1. Đếm tổng test specs: `find e2e/specs -name "*.spec.ts" | wc -l`
2. Liệt kê theo batch: `for dir in e2e/specs/batch-*; do echo "$(basename $dir): $(ls $dir/*.spec.ts 2>/dev/null | wc -l) specs"; done`
3. Kiểm tra screens có testID: `grep -rl 'testID=' src/features/*/screens/*.tsx | wc -l` vs `ls src/features/*/screens/*.tsx | wc -l`
4. Kiểm tra screens THIẾU testID: `for f in src/features/*/screens/*.tsx; do grep -q 'testID=' "$f" || echo "MISSING: $f"; done`
5. Kiểm tra infrastructure: Appium (`curl -s http://localhost:4723/status`), Metro (`curl -s http://localhost:8081/status`), Simulators (`xcrun simctl list devices booted`)

Báo cáo format:
```
E2E Test Suite Status:
- Total specs: X
- Batches: X
- Screen coverage: X/Y screens have testID
- Missing testID: [list]
- Infrastructure: Appium [OK/DOWN], Metro [OK/DOWN], Simulators [X booted]
```
