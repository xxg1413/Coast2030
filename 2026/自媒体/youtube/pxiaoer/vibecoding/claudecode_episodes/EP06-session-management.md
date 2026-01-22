# EP06: 会话管理 - 多任务无缝切换

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - Session Management

---

## 📝 视频大纲

### 1. 问题场景 (0:00-1:00)
**字幕**: "Juggling 3 features at once? Context chaos!"
**演示**: 同一Terminal混乱切换不同项目

### 2. Named Sessions (1:00-4:00)

**字幕脚本**:
```
[1:00] "Named Sessions - Isolate your work"
[1:20] "claude --session feature-auth"
[1:40] "claude --session fix-bug-123"
[2:00] "claude --session refactor-api"
[2:20] "Each session = Isolated context"
[2:40] "Switch anytime, resume anywhere"
```

**屏幕操作**:
1. 创建3个不同会话
2. 在每个会话中工作
3. 快速切换演示
4. 显示会话列表

**视觉元素**:
- 会话卡片（3个）
- 切换动画
- 上下文隔离示意图

---

### 3. Continue Where You Left Off (4:00-5:30)

**字幕**: "Exit → Relaunch → Exactly where you left"
**演示**:
- 会话中退出
- 重新启动
- 代码改动保留
- 对话历史保留

---

### 4. Claude Code Remote (5:30-6:00)

**字幕**: "Remote collaboration with AI"
**演示**:
- 团队成员远程访问会话
- 实时共享编程环境

---

### 5. 激进管理上下文 (6:00-7:15) 🆕

> 来源: Best Practices - Manage context aggressively

**字幕脚本**:
```
[6:00] "Pro tip: Manage context aggressively"
[6:15] "/clear frequently between tasks"
[6:30] "Long sessions = messy context = worse results"
[6:45] "Auto compaction: Claude summarizes when full"
[7:00] "/compact Focus on API changes - Manual control"
```

**屏幕操作**:
1. 展示上下文使用量指示器
2. 演示 /clear 命令
3. 演示 /compact 带自定义指令
4. 显示压缩前后对比

**视觉元素**:
- 上下文使用量条 (0%-100%)
- 压缩动画：大→小
- 警告图标：⚠️ Context pollution

---

### 6. 恢复会话技巧 (7:15-8:00) 🆕

**字幕脚本**:
```
[7:15] "Resume conversations like a pro"
[7:30] "claude --continue → Resume most recent"
[7:40] "claude --resume → Pick from history"
[7:50] "/rename → Name your session for easy find"
```

**示例**:
```bash
# 恢复最近会话
claude --continue

# 选择历史会话
claude --resume

# 命名会话
/rename "oauth-migration"
/rename "debugging-memory-leak"
```

**视觉元素**:
- 会话历史列表
- 命名标签动画
- Before/After 会话组织对比

---

### 7. /export命令 (8:00-8:30)

**字幕**: "Export session for documentation"
```bash
/export session-transcript.md
```

**包含内容**:
- 所有prompts和responses
- 代码变更历史
- 执行的命令

---

## ✅ 制作清单
- [ ] 录制3个并行会话演示
- [ ] 演示会话切换流程
- [ ] 录制/export功能
- [ ] 字幕：英文、中文
