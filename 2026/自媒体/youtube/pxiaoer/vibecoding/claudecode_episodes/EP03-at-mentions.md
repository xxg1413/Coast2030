# EP03: @提及 - 最快的上下文注入方式

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕
> **参考**: [Best Practices - Provide Rich Content](https://docs.anthropic.com/en/docs/claude-code/best-practices#provide-rich-content)

---

## 📝 完整脚本

### 开场 (0:00-1:00)

**字幕脚本**:
```
[0:00] "AI needs context to understand you"
[0:10] "Traditional way: Copy-paste code blocks 📋"
[0:20] "Error-prone, slow, messy"
[0:35] "Better way: @ mentions"
[0:45] "Fast, precise, clean"
```

**演示**: 对比复制粘贴 vs @提及

---

### @基础用法 (1:00-3:00)

**字幕脚本**:
```
[1:00] "@ mentions - Inject context instantly"
[1:15] "Single file: @src/auth.ts"
[1:30] "Entire directory: @src/components/"
[1:45] "Config file: @package.json"
[2:00] "Claude loads file content automatically"
[2:20] "Now ask anything about these files"
[2:40] "Autocomplete helps find files fast"
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

### 多种上下文注入方式 (3:00-5:30) 🆕

> 来源: Best Practices - Provide Rich Content

**字幕脚本**:
```
[3:00] "Beyond @ mentions - 5 ways to inject context"
[3:15] "1. @file - Reference any file"
[3:30] "2. Drag & drop images directly!"
[3:45] "3. Give URLs for docs & API references"
[4:00] "   Tip: /permissions to allowlist domains"
[4:20] "4. Pipe data: cat error.log | claude"
[4:40] "5. Let Claude fetch: 'Read the API docs at...'"
[5:00] "Claude can pull context using Bash, MCP, file reads"
[5:20] "Mix and match for maximum efficiency"
```

**屏幕操作**:
1. @ 引用文件演示
2. 拖拽图片到 Claude 输入
3. 提供 URL 并配置 /permissions
4. 演示 `cat file.log | claude` 管道
5. 让 Claude 自己获取上下文

**视觉元素**:
- 5种方式的图标列表
- 管道流动动画 📄→🔀→🤖
- /permissions 配置界面

**示例命令**:
```bash
# 管道输入
cat error.log | claude "What's causing this error?"

# URL 引用
/permissions add https://api.example.com

# 让 Claude 自己获取
"Read the API docs at https://docs.example.com and explain the auth flow"
```

---

### 高级技巧 (5:30-7:30)

**字幕脚本**:
```
[5:30] "Advanced @ mention tips"
[5:45] "Fuzzy matching: @ath → auth.ts"
[6:00] "Partial paths work: @components/Button"
[6:20] "MCP servers extend @mentions"
[6:40] "@github:issue/123 - Reference issues"
[7:00] "@jira:PROJ-456 - Link tickets"
[7:15] "Combine multiple: @src/auth @tests/auth.test"
```

**演示内容**:
- 模糊匹配示例
- MCP服务器集成
- 多文件引用

---

### 实战案例 (7:30-8:30)

**字幕脚本**:
```
[7:30] "Real scenario: Debug a production error"
[7:45] "cat prod-error.log | claude"
[8:00] "@src/api/handler.ts"
[8:10] "'What's causing this error and how to fix it?'"
[8:25] "Context + Question = Perfect answer"
```

---

### 总结 (8:30-9:00)

**字幕脚本**:
```
[8:30] "Recap: 5 ways to inject context"
[8:40] "@file, images, URLs, pipes, Claude-fetch"
[8:50] "Next: ! prefix for command execution"
```

---

## 🎨 视觉化资产

- [ ] 5种上下文注入方式图标
- [ ] 管道流动动画
- [ ] @ vs 复制粘贴对比
- [ ] /permissions 界面截图

## ✅ 制作清单

### 前期
- [ ] 准备演示项目（含多个文件）
- [ ] 编写字幕脚本（英文）
- [ ] 设计@符号动画
- [ ] 准备示例图片和 URL

### 录制
- [ ] 录制复制粘贴痛点
- [ ] 录制@提及流程
- [ ] 录制5种上下文方式
- [ ] 录制模糊匹配演示
- [ ] 录制管道输入演示

### 后期
- [ ] 添加英文字幕
- [ ] @ 符号特效
- [ ] 文件内容流动动画
- [ ] 5种方式图标动画

### 发布
- [ ] 缩略图：EP03 + @ 符号 + 5 Ways
- [ ] 标题：@ Mentions & 5 Ways to Inject Context
- [ ] 字幕：英文、中文
- [ ] 标签：claude code, context, @ mention, pipe
