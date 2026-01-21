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

### 4. 使用场景 (7:00-8:15)

**字幕**:
```
[7:00] "Perfect for:"
[7:10] "→ Large codebase refactoring"
[7:25] "→ Multi-module development"
[7:40] "→ Documentation generation"
[7:55] "→ Parallel testing"
```

---

### 5. 总结 (8:15-9:00)

**字幕**: "Subagents = Multiply your productivity"
**预告**: "Next: Agent Skills - Custom capabilities"

---

## ✅ 制作清单
- [ ] 录制4个并行窗口（主+3个sub）
- [ ] 可视化并行工作进度
- [ ] 展示结果合并
- [ ] 字幕：英文、中文
