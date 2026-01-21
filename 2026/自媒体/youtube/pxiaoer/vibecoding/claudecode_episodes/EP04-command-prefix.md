# EP04: ! 前缀 - 命令行瞬间执行

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - The ! Prefix

---

## 📝 视频大纲

### 1. 传统方式的问题 (0:00-1:00)

**字幕脚本**:
```
[0:00] "Don't waste tokens asking AI to run commands"
[0:15] "Traditional way:"
[0:20] "You: 'Can you run git status?'"
[0:30] "AI: 'Sure, running git status...'"
[0:40] "Wasted: 2 seconds + tokens"
[0:50] "Better way exists →"
```

**屏幕操作**:
1. 显示对话框：用户提问
2. AI回复确认
3. 显示token消耗计数器
4. 时钟显示浪费的时间

**视觉元素**:
- ❌ 红色X标记浪费
- 💸 Token计数器动画
- ⏱️ 时钟倒计时

---

### 2. ! 前缀原理 (1:00-3:00)

**字幕脚本**:
```
[1:00] "! prefix - Execute bash instantly"
[1:15] "No model processing"
[1:25] "No delay"
[1:35] "No wasted tokens"
[1:50] "Output auto-injected into context"
[2:10] "Example: ! git status"
[2:30] "Instant execution ⚡"
```

**屏幕操作**:
1. 输入 `! git status`
2. 立即显示输出（无等待）
3. 对比图：传统方式 vs ! 前缀
4. Token计数器显示0消耗

**视觉元素**:
- ⚡ 闪电图标（速度）
- 对比分屏：左慢右快
- Token: 0 （绿色显示）
- 输出自动注入动画

---

### 3. 实用场景演示 (3:00-7:00)

#### 场景1：Git操作 (3:00-4:00)
**字幕**: "Check git status, branch, logs"
```bash
! git status
! git branch
! git log -n 5
```

#### 场景2：运行测试 (4:00-4:45)
**字幕**: "Run tests instantly"
```bash
! npm test
! pytest tests/
! jest --coverage
```

#### 场景3：文件操作 (4:45-5:30)
**字幕**: "List files, check sizes"
```bash
! ls -la src/
! du -sh dist/
! find . -name "*.md"
```

#### 场景4：查看日志 (5:30-6:15)
**字幕**: "Tail logs, search errors"
```bash
! tail -f logs/app.log
! grep "ERROR" logs/*.log
```

#### 场景5：包管理 (6:15-7:00)
**字幕**: "Check dependencies"
```bash
! npm list --depth=0
! pip freeze
```

**屏幕操作**（每个场景）:
1. 输入命令
2. 显示输出
3. 高亮关键信息

---

### 4. 最佳实践 (7:00-8:30)

**字幕脚本**:
```
[7:00] "When to use ! prefix?"
[7:10] "✅ Quick checks (git status, ls)"
[7:20] "✅ Read-only operations"
[7:30] "✅ Getting system info"
[7:45] "When to let Claude execute?"
[7:55] "→ Complex multi-step tasks"
[8:05] "→ Conditional logic needed"
[8:15] "→ Error handling required"
```

**视觉元素**:
- ✅/❌ 决策树图
- 使用场景卡片

---

### 5. 总结 (8:30-9:00)

**字幕脚本**:
```
[8:30] "! prefix = instant bash execution"
[8:40] "Save time + Save tokens"
[8:50] "Use it 50+ times per day"
[8:55] "Next: 5 Core Shortcuts"
```

---

## 🎨 视觉化资产

- [ ] 对比动画：传统 vs ! 前缀
- [ ] Token计数器组件
- [ ] 场景卡片（5个）
- [ ] 决策树图（何时使用）

## ✅ 制作清单

### 前期
- [ ] 准备5个场景的演示脚本
- [ ] 测试所有命令确保输出清晰

### 录制
- [ ] 录制传统方式痛点
- [ ] 录制5个实用场景
- [ ] 录制对比效果

### 后期
- [ ] 添加字幕
- [ ] Token计数器动画
- [ ] 场景切换特效
- [ ] 背景音乐

### 发布
- [ ] 缩略图：! 符号 + "Instant Execution"
- [ ] 标题：! Prefix: Execute Bash Commands Instantly
- [ ] 字幕：英文、中文

