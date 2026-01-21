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

### 4. Claude Code Remote (5:30-6:45)

**字幕**: "Remote collaboration with AI"
**演示**:
- 团队成员远程访问会话
- 实时共享编程环境
- 配对编程演示

---

### 5. /export命令 (6:45-8:00)

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
