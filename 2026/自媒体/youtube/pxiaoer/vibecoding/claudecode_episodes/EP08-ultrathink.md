# EP08: Ultrathink - 深度思考模式

> **时长**: 8-10分钟  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **参考**: Advent of Claude - Ultrathink & Extended Thinking

---

## 📝 视频大纲

### 1. 表面回答 vs 深度思考 (0:00-1:30)

**对比演示**:
- 左：普通prompt → "使用Redis缓存"
- 右：ultrathink → 分析5种方案，权衡利弊

---

### 2. Ultrathink使用 (1:30-3:30)

**字幕脚本**:
```
[1:30] "ultrathink: Triggers 32K token reasoning"
[2:00] "Syntax: > ultrathink: your question"
[2:30] "Example: design caching layer for API"
```

**演示**:
```
> ultrathink: design a caching layer for our API
```

Claude分析:
- 缓存策略（Redis vs Memcached vs CDN）
- 数据一致性
- 过期策略
- 性能权衡
- 成本考虑

---

### 3. 对比案例 (3:30-6:30)

#### 案例1: 架构设计
- 普通: "用微服务"
- Ultrathink: 单体 vs 微服务 vs Serverless深度分析

#### 案例2: 性能优化
- 普通: "加索引"
- Ultrathink: 分析10种优化方案

---

### 4. Extended Thinking (API) (6:30-8:00)

**代码示例**:
```javascript
thinking: { 
  type: "enabled", 
  budget_tokens: 5000 
}
```

**功能**: 看到Claude的思考过程（thinking blocks）

---

### 5. 何时使用 (8:00-9:00)

**字幕**:
```
[8:00] "Use ultrathink when:"
[8:10] "→ Complex architecture decisions"
[8:20] "→ Tricky debugging"
[8:30] "→ Performance optimization"
[8:45] "Next: Plan Mode deep dive"
```

---

## ✅ 制作清单
- [ ] 录制对比演示（普通 vs ultrathink）
- [ ] 录制2个深度案例
- [ ] 展示thinking blocks
- [ ] 字幕：英文、中文
