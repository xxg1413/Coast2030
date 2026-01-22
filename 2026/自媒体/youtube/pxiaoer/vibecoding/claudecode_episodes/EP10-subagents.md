# EP10: Subagents - 任务委派大师

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - Subagents

---

## 📝 视频大纲

### 1. 圣诞老人的精灵 (0:00-1:00)
**字幕**: "Santa has elves, Claude has subagents"
**比喻**: 圣诞老人委派任务给精灵，并行工作

---

### 2. Subagent能力 (1:00-2:30)

**字幕脚本**:
```
[1:00] "Each subagent:"
[1:10] "→ Independent 200K context window"
[1:25] "→ Runs in parallel"
[1:40] "→ Access to all MCP tools"
[1:55] "→ Results merge back automatically"
[2:15] "Create: 'Spawn subagent to...'"
```

---

### 3. 实战演示 (2:30-7:00)

**场景**: 同时开发新功能、重构和文档

**主Agent**: "Build user profile feature"

**Subagent 1**: "Refactor auth module for better testability"
```
Create a subagent to refactor the auth module
```

**Subagent 2**: "Write comprehensive tests for API endpoints"
```
Spawn a subagent to write tests
```

**Subagent 3**: "Update API documentation"
```
Create a subagent to update docs
```

**可视化**:
- 4个并行窗口
- 主Agent + 3个Sub agents
- 实时显示进度
- 完成后自动合并

---

### 4. 使用场景 (7:00-7:30)

**字幕**:
```
[7:00] "Perfect for:"
[7:10] "→ Large codebase refactoring"
[7:20] "→ Multi-module development"
```

---

### 5. 用 Subagent 做调查 (7:30-8:15) 🆕

> 来源: Best Practices - Use subagents for investigation

**字幕脚本**:
```
[7:30] "Pro tip: Subagents for investigation"
[7:45] "'Use subagents to investigate how our auth 
        handles token refresh'"
[8:00] "Benefits:"
[8:05] "→ Doesn't pollute main context"
[8:10] "→ Explore unfamiliar code safely"
```

**示例 Prompts**:
```
"Use subagents to investigate how our authentication
system handles token refresh, and whether we have
any existing OAuth utilities I should reuse."

"use a subagent to review this code for edge cases"
```

---

### 6. 自定义 Subagent (8:15-8:45) 🆕

**字幕脚本**:
```
[8:15] "Create custom subagents in .claude/agents/"
[8:30] "Example: security-reviewer.md"
```

**配置示例**:
`.claude/agents/security-reviewer.md`:
```markdown
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer. Review code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure data handling

Provide specific line references and suggested fixes.
```

**视觉元素**:
- 配置文件结构
- 安全审查报告示例

---

### 7. 总结 (8:45-9:00)

**字幕**: "Subagents = Multiply your productivity"
**预告**: "Next: Agent Skills - Custom capabilities"

---

## ✅ 制作清单
- [ ] 录制4个并行窗口（主+3个sub）
- [ ] 可视化并行工作进度
- [ ] 展示结果合并
- [ ] 字幕：英文、中文
