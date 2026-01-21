# EP02: /init命令 - 让Claude自己读懂你的项目

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **发布日期**: 2026年2月第2周

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

### 3. 实战演示 (4:00-7:00)

**字幕脚本**:
```
[4:00] "Real example: Open source project"
[4:10] "Project: https://github.com/example/api"
[4:20] "git clone..."
[4:40] "cd api && claude"
[4:50] "/init"
[5:10] "Analysis complete"
[5:20] "View CLAUDE.md:"
[5:30] "Build"
---

## 📝 视频大纲

### 1. 为什么上下文很重要 (0:00-1:00)

**字幕脚本**:
```
[0:00] "AI needs context to understand you"
[0:10] "Traditional way: Copy-paste code blocks 📋"
[0:20] "Error-prone, slow, messy"
[0:35] "Better way: @ mentions"
[0:45] "Fast, precise, clean"
```

**屏幕操作**:
1. 展示复制粘贴代码的麻烦过程
2. 代码格式丢失示例
3. @ 提及的流畅演示对比

---

### 2. @提及基础 (1:00-4:00)

**字幕脚本**:
```
[1:00] "@ mentions - Inject context instantly"
[1:15] "Single file: @src/auth.ts"
[1:30] "Entire directory: @src/components/"
[1:45] "Config file: @package.json"
[2:00] "Claude loads file content automatically"
[2:20] "Now ask anything about these files"
```

**屏幕操作**:
1. 输入 `@src/auth.ts`
2. 显示自动补全下拉菜单
3. 选择后，文件内容注入（动画）
4. 提问示例："Add email validation"

**视觉元素**:
- @ 符号放大动画
- 文件内容流入效果
- 自动补全菜单高亮

---

## ✅ 制作清单

### 前期
- [ ] 准备演示项目（含多个文件）
- [ ] 编写字幕脚本（英文）
- [ ] 设计@符号动画

### 录制
- [ ] 录制复制粘贴痛点
- [ ] 录制@提及流程
- [ ] 录制模糊匹配演示
- [ ] 录制MCP集成

### 后期
- [ ] 添加英文字幕
- [ ] @ 符号特效
- [ ] 文件内容流动动画
- [ ] 对比图表

### 发布
- [ ] 缩略图：EP03 + @ 符号
- [ ] 标题：@ Mentions: 3X Faster Context Injection
- [ ] 字幕：英文、中文
- [ ] 标签：claude code, context, @ mention
