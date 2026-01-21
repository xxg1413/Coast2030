# EP11: Agent Skills - 打造专属技能包

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - Agent Skills

---

## 📝 视频大纲

### 1. 重复教AI的痛苦 (0:00-1:00)
**字幕**: "Teaching your deploy process every time?"
**演示**: 每次都要解释公司部署流程

---

### 2. Agent Skills概念 (1:00-2:30)

**字幕脚本**:
```
[1:00] "Agent Skills = Reusable instruction packages"
[1:20] "Official standard: agentskills.io"
[1:45] "Package once, use everywhere"
[2:10] "Share with your team"
```

---

### 3. 使用现有Skills (2:30-4:00)

**演示**:
```
@skill:railway-deploy
"Deploy to staging environment"
```

**步骤**:
1. 安装Skill from marketplace
2. 调用Skill
3. Claude自动应用流程

---

### 4. 创建自定义Skill (4:00-7:30)

**文件结构**:
```
.claude/skills/deploy/
├── instructions.md
├── scripts/
│   └── deploy.sh
└── resources/
    └── deployment-checklist.md
```

**instructions.md示例**:
```markdown
# Deployment Skill

When deploying:
1. Run tests first
2. Build production build
3. Check environment variables
4. Deploy to Railway
5. Verify health check
```

**演示**:
1. 创建目录结构
2. 编写instructions
3. 添加脚本
4. 测试Skill
5. 使用 `@skill:deploy`

---

### 5. 团队共享 (7:30-8:30)

**字幕**: "Git manages Skills, team stays synced"

**演示**:
- Git commit Skills
- 团队成员clone
- 统一工作流

---

### 6. 总结 (8:30-9:00)
**字幕**: "Skills = Team knowledge codified"
**预告**: "Next: Plugins - One-click setup"

---

## ✅ 制作清单
- [ ] 演示使用现有Skill
- [ ] 完整创建自定义Skill流程
- [ ] 展示团队协作场景
- [ ] 字幕：英文、中文
