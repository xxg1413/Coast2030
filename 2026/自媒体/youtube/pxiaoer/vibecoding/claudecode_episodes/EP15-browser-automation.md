# EP15: 浏览器自动化测试

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - Browser Integration

---

## 📝 视频大纲

### 1. 手动测试的痛苦 (0:00-1:00)
**字幕**: "Manual testing = Slow, error-prone, boring"
**演示**: 手动点击测试表单

---

### 2. 测试对象准备 (1:00-1:30)

**字幕**: "We'll test the Todo App we built in EP13-14"

**准备工作**:
- 启动EP14的Docker容器
- 确保 http://localhost:3000 可访问
- 准备如 "test-user" 的测试账号

---

### 3. Playwright集成 (2:00-4:00)

**安装**:
```
"Install and configure Playwright"
```

**录制用户操作**:
```
"Write Playwright test: login and create todo"
```

**Claude生成**:
```javascript
test('login and create todo', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.waitForSelector('.dashboard')
  await page.click('.create-todo-btn')
  await page.fill('[name="title"]', 'New Todo')
  await page.click('.save-btn')
  
  await expect(page.locator('.todo-item')).toContainText('New Todo')
})
```

---

### 4. 实战案例 (4:00-7:30)

#### 案例1: 登录表单测试
- 输入测试
- 验证测试
- 错误处理测试

#### 案例2: CRUD操作测试
- 创建todo
- 编辑todo
- 删除todo
- 列表过滤

#### 案例3: 导航测试
- 页面跳转
- 路由测试
- 返回按钮

**运行测试**: 实时显示测试执行

---

### 5. CI/CD集成 (7:30-8:30)

**Headless mode**:
```bash
claude --headless "Run all Playwright tests"
```

**GitHub Actions**:
```yaml
- name: Run E2E tests
  run: |
    claude --headless "npm run test:e2e"
```

---

### 6. 总结 (8:30-9:00)

**字幕**:
```
[8:30] "Browser automation = Save hours weekly"
[8:45] "Series complete! 🎉"
[8:55] "Start vibecoding today!"
```

---

## ✅ 制作清单
- [ ] 准备测试应用（前端）
- [ ] 录制Playwright安装
- [ ] 录制3个测试案例
- [ ] 展示CI/CD集成
- [ ] 系列总结片段
- [ ] 字幕：英文、中文
