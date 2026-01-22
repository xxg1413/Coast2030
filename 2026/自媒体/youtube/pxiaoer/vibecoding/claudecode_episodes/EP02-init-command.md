# EP02: /init命令 - 让Claude自己读懂你的项目

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **发布日期**: 2026年2月第2周
> **参考**: [Best Practices - CLAUDE.md](https://docs.anthropic.com/en/docs/claude-code/best-practices#write-an-effective-claude-md)

---

## 📝 视频大纲

### 1. 问题场景 (0:00-1:00)

**字幕脚本**:
```
[0:00] "New project onboarding = pain 😫"
[0:10] "Read README...outdated"
[0:20] "Search for build commands..."
[0:30] "Ask team members..."
[0:40] "2-3 days to understand codebase"
[0:50] "What if Claude could do it in 30 seconds?"
```

**屏幕操作**:
1. 显示复杂项目文件树（100+文件）
2. 打开过时的README（标注❌）
3. 代码注释与实际不符（对比高亮）
4. 时钟动画：3天倒计时

**视觉元素**:
- 痛苦表情：😫😰😵
- 时钟：快速旋转3天
- 问号：❓到处都是

---

### 2. /init核心功能 (1:00-4:00)

**字幕脚本**:
```
[1:00] "/init command - Auto project onboarding"
[1:15] "Open any project directory"
[1:25] "Run: /init"
[1:40] "Claude analyzes entire codebase..."
[2:00] "Generates CLAUDE.md:"
[2:10] "→ Build & test commands"
[2:20] "→ Directory structure explained"
[2:30] "→ Code conventions detected"
[2:40] "→ Architecture decisions documented"
[2:50] "30 seconds = full understanding ✅"
```

**屏幕操作**:
1. cd到项目目录
2. 输入 `/init`
3. 显示分析进度条
4. 实时显示Claude扫描文件（加速2倍）
5. CLAUDE.md文件生成动画
6. 逐节展开查看内容

**视觉元素**:
- 进度条：文件扫描进度
- 文件图标：📁📄 快速闪过
- 生成动画：✨ CLAUDE.md出现
- 分节标签：Build/Test/Structure/Conventions

---

### 3. CLAUDE.md 配置层级 (4:00-5:30) 🆕

> 来源: Best Practices - Write an effective CLAUDE.md

**字幕脚本**:
```
[4:00] "CLAUDE.md hierarchy - Multiple levels"
[4:15] "~/.claude/CLAUDE.md → Global settings"
[4:30] "./CLAUDE.md → Project root, share with team"
[4:45] "CLAUDE.local.md → Personal overrides, gitignore"
[5:00] "Parent/Child dirs → Auto-inherited"
[5:15] "Monorepo? root/CLAUDE.md + root/foo/CLAUDE.md"
```

**屏幕操作**:
1. 展示配置层级图
2. 创建 ~/.claude/CLAUDE.md（全局）
3. 创建 ./CLAUDE.md（项目）
4. 创建 CLAUDE.local.md + 添加到 .gitignore

**视觉元素**:
- 层级树状图
- 📁 Home → Project → Local
- ✅ Git tracked / ❌ Gitignored 标签

---

### 4. CLAUDE.md 内容最佳实践 (5:30-7:00) 🆕

**字幕脚本**:
```
[5:30] "What to put in CLAUDE.md?"
[5:45] "# Code style"
[5:55] "- Use ES modules (import/export)"
[6:05] "- Destructure imports when possible"
[6:20] "# Workflow"
[6:30] "- Be sure to typecheck after changes"
[6:40] "- Prefer single tests, not full suite"
[6:50] "Pro tip: Use @path/to/file to reference docs"
```

**示例代码**:
```markdown
# Code style
- Use ES modules (import/export) syntax, not CommonJS
- Destructure imports when possible

# Workflow
- Typecheck when you're done making changes
- Prefer running single tests for performance

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

**视觉元素**:
- 代码块高亮
- ✅ 好的配置示例 / ❌ 坏的配置示例

---

### 5. 实战演示 (7:00-8:30)

**字幕脚本**:
```
[7:00] "Real example: Open source project"
[7:10] "git clone https://github.com/example/api"
[7:25] "cd api && claude"
[7:35] "/init"
[7:50] "Analysis complete in 25 seconds"
[8:00] "View CLAUDE.md - all sections populated"
[8:15] "Now Claude understands your project! 🎉"
```

**屏幕操作**:
1. Clone一个真实开源项目
2. 运行 `/init`
3. 显示生成的 CLAUDE.md 内容
4. 立即测试 Claude 对项目的理解

---

### 6. 总结 (8:30-9:00)

**字幕脚本**:
```
[8:30] "Recap:"
[8:35] "/init → Auto-generate CLAUDE.md"
[8:45] "Hierarchy: Global → Project → Local"
[8:55] "Next: @ mentions - Fast context injection"
```

---

## 🎨 视觉化资产

- [ ] 配置层级树状图（Home/Project/Local）
- [ ] Before/After 对比（无CLAUDE.md vs 有）
- [ ] 代码样式示例卡片
- [ ] 进度条动画

## ✅ 制作清单

### 前期
- [ ] 准备演示项目
- [ ] 编写完整字幕脚本
- [ ] 设计配置层级图

### 录制
- [ ] 录制 /init 流程
- [ ] 录制 CLAUDE.md 层级演示
- [ ] 录制最佳实践示例
- [ ] 录制实战项目

### 后期
- [ ] 添加英文字幕
- [ ] 添加层级示意图动画
- [ ] 高亮代码块

### 发布
- [ ] 缩略图：EP02 + /init + CLAUDE.md
- [ ] 标题：/init: Let Claude Understand Your Project in 30 Seconds
- [ ] 字幕：英文、中文
- [ ] 标签：claude code, init, CLAUDE.md, onboarding
