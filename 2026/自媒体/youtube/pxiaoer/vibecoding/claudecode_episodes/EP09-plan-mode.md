# EP09: Plan Mode - 三思而后行

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - Plan Mode

---

## 📝 视频大纲

### 1. AI直接改代码的风险 (0:00-1:00)
**字幕**: "AI blindly executing = Risky!"
**演示**: AI改错代码的后果

---

### 2. 进入Plan Mode (1:00-2:30)

**字幕脚本**:
```
[1:00] "Plan Mode: Think first, execute later"
[1:20] "Activate: Shift+Tab twice"
[1:45] "Claude analyzes → Plans → Waits"
[2:10] "You review → Approve/Reject"
```

**屏幕操作**:
1. 按 Shift+Tab×2
2. 显示"Plan Mode"提示
3. 输入需求

---

### 3. 完整流程演示 (2:30-7:00)

**需求**: "Refactor user authentication system"

**Claude生成计划**:
```
Step 1: Audit current auth implementation
Step 2: Extract auth logic to service layer
Step 3: Add JWT token refresh mechanism
Step 4: Update tests
Step 5: Update documentation
```

**审查过程**:
1. 显示5步计划
2. 你反馈："Step 3 too complex, simplify"
3. Claude修改计划
4. 你批准
5. Claude执行（实时显示进度）

---

### 4. 最佳实践 (7:00-7:45)

**字幕**:
```
[7:00] "Use Plan Mode 90% of the time"
[7:20] "When to skip:"
[7:30] "→ Trivial changes (fix typo)"
[7:40] "→ Well-defined simple tasks"
```

---

### 5. Explore → Plan → Code 工作流 (7:45-8:45) 🆕

> 来源: Best Practices - Explore first, then plan, then code

**字幕脚本**:
```
[7:45] "The complete workflow: 4 phases"
[8:00] "1. EXPLORE: 'Read /src/auth, understand sessions'"
[8:15] "2. PLAN: 'Add Google OAuth. Create a plan.'"
[8:25] "3. IMPLEMENT: 'Implement from plan, write tests'"
[8:35] "4. COMMIT: 'Commit with message, open a PR'"
```

**示例 Prompts**:
```
# Explore
"read /src/auth and understand how we handle sessions 
and login. also look at how we manage environment 
variables for secrets."

# Plan  
"I want to add Google OAuth. What files need to change? 
What's the session flow? Create a plan."

# Implement
"implement the OAuth flow from your plan. write tests 
for the callback handler, run the test suite and fix 
any failures."

# Commit
"commit with a descriptive message and open a PR"
```

---

### 6. 常见失败模式 (8:45-9:30) 🆕

> 来源: Best Practices - Avoid common failure patterns

**字幕脚本**:
```
[8:45] "Avoid these 5 failure patterns:"
[8:55] "1. Kitchen sink session - Mix unrelated tasks"
[9:05] "   Fix: /clear between tasks"
[9:10] "2. Correcting over and over - Polluted context"
[9:15] "   Fix: /clear and write better initial prompt"
[9:20] "3. Over-specified CLAUDE.md - Too long, ignored"
[9:25] "4. Trust-then-verify gap - No tests = bugs"
[9:30] "5. Infinite exploration - Scope investigations"
```

**视觉元素**:
- ❌ 错误模式图标
- ✅ 修复方法
- 警告标志：⚠️

---

### 7. 总结 (9:30-10:00)
**字幕**: "Plan Mode = Safety + Transparency"
**预告**: "Next: Subagents - Parallel task delegation"

---

## ✅ 制作清单
- [ ] 录制Plan Mode完整流程
- [ ] 演示反馈和修改计划
- [ ] 展示执行进度可视化
- [ ] 字幕：英文、中文
