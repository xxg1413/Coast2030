# EP12: Plugins + LSP - 完整工具链

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - Plugins & LSP

---

## 📝 视频大纲

### Part 1: Plugins (0:00-5:00)

#### 1. 配置地狱 (0:00-1:00)
**字幕**: "Setup Claude Code = 47 files across 12 dirs?"
**演示**: 复杂的手动配置过程

#### 2. Plugins解决方案 (1:00-3:00)

**字幕**:
```
[1:00] "Plugins = All-in-one packages"
[1:20] "Includes: Commands + Skills + Hooks + MCP"
[1:45] "Install: /plugin install team-setup"
[2:15] "One command = Full environment ready"
```

**演示**:
```bash
/plugin install my-team-setup
```

#### 3. 创建Plugin (3:00-4:30)

**目录结构**:
```
my-plugin/
├── plugin.json
├── commands/
├── skills/
├── hooks/
└── mcp-servers/
```

#### 4. Marketplace (4:30-5:00)
**演示**: 浏览、搜索、安装热门plugins

---

### Part 2: Hooks (5:00-7:00) 🆕

> 来源: Best Practices - Set up hooks

#### 1. Hooks 是什么 (5:00-5:30)
**字幕**: "Hooks = Automated actions on events"

#### 2. Hooks 配置 (5:30-6:30)

**字幕脚本**:
```
[5:30] "Configure hooks via /hooks or settings.json"
[5:45] "5 powerful use cases:"
[5:55] "1. Auto-format: .ts → prettier, .go → gofmt"
[6:05] "2. Linting: Auto-lint changed files"
[6:15] "3. Guardrails: Block .env, secrets/ edits"
[6:25] "4. Logging: Track all executed commands"
```

**配置示例** (`.claude/settings.json`):
```json
{
  "hooks": {
    "onFileChange": {
      "*.ts": "npx prettier --write",
      "*.go": "gofmt -w"
    },
    "onBeforeEdit": {
      "block": [".env", "secrets/*", "*.pem"]
    }
  }
}
```

**视觉元素**:
- 5种 Hooks 用例图标
- 配置文件高亮
- 自动触发动画

#### 3. 自定义 Slash Commands (6:30-7:00) 🆕

**字幕脚本**:
```
[6:30] "Create custom slash commands"
[6:40] "Put in .claude/commands/ or ~/.claude/commands/"
[6:50] "Use $ARGUMENTS for input"
```

**配置示例** (`.claude/commands/fix-github-issue.md`):
```markdown
---
description: Fix a GitHub issue
---
Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:
1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR
```

**使用**:
```
/fix-github-issue 1234
```

---

### Part 3: LSP Integration (7:00-9:00)

#### 1. LSP是什么 (5:00-5:45)
**字幕**: "Language Server Protocol = IDE-level intelligence"

#### 2. LSP功能演示 (5:45-8:00)

**实时错误提示**:
- 写代码时立即看到类型错误
- 红色波浪线标注

**Go to Definition**:
- 点击函数跳转到定义

**Hover Information**:
- 鼠标悬停看参数文档

**代码导航**:
- Find references
- Symbol search

#### 3. 对比 (8:00-8:30)
**分屏**:
- 左：无LSP（盲写）
- 右：有LSP（实时反馈）

---

### 3. 总结 (8:30-9:00)

**字幕**:
```
[8:30] "Plugins = Quick setup"
[8:40] "LSP = IDE-level智能"
[8:50] "Next: Real project - Build API"
```

---

## ✅ 制作清单
- [ ] 演示plugin安装
- [ ] 创建简单plugin
- [ ] 录制LSP所有功能
- [ ] 对比有无LSP的差异
- [ ] 字幕：英文、中文
