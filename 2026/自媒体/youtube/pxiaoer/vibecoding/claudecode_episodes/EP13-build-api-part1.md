# EP13-14: 实战 - 10分钟构建Todo API

> **总时长**: 16-18分钟（分上下两集）  
> **格式**: 无旁白屏幕录制 + 英文字幕  
> **项目**: Node.js + Express + PostgreSQL + JWT

---

## EP13: 构建API（上）8-10分钟

### 1. 项目规划 (0:00-1:00)

**需求**:
- CRUD endpoints for todos
- User authentication (JWT)
- PostgreSQL database
- RESTful API design

---

### 2. /init初始化 (1:00-2:30)

```
/init
"Node.js API with Express, PostgreSQL, JWT auth"
```

**生成结构**:
- package.json
- server.js
- routes/
- models/
- middleware/

---

### 3. 数据库设计 (2:30-4:30)

```
> ultrathink: design database schema for todo app
```

**Claude分析**:
- User表设计
- Todo表设计
- 关系设计
- 索引优化

**生成迁移文件**

---

### 4. API实现 Part 1 (4:30-8:30)

**使用Plan Mode**:
```
Shift+Tab×2
"Implement user registration and login endpoints"
```

**Claude计划**:
1. User model with password hashing
2. POST /api/auth/register
3. POST /api/auth/login
4. JWT token generation
5. Auth middleware

**实现**:
- 审查计划
- 批准执行
- 实时显示代码生成

**测试**:
- Postman测试注册
- 测试登录
- 验证JWT token

**预告**: "Next: CRUD endpoints + deployment"

---

## EP14: 构建API（下）8-10分钟

### 1. 快速回顾 (0:00-0:45)
**已完成**: Auth系统

### 2. CRUD Endpoints (0:45-3:00)

```
"Implement todo CRUD endpoints with auth protection"
```

**生成endpoints**:
- GET /api/todos (list)
- POST /api/todos (create)
- PUT /api/todos/:id (update)
- DELETE /api/todos/:id (delete)

**测试每个endpoint**

---

### 3. 测试 (3:00-5:00)

**Spawn subagent**:
```
"Create a subagent to write comprehensive tests"
```

**生成测试**:
- Unit tests (Jest)
- Integration tests
- Coverage report

**运行测试**: `npm test`

---

### 4. Docker配置 (5:00-6:30)

```
"Create Dockerfile and docker-compose.yml"
```

**生成文件**:
- Dockerfile (multi-stage build)
- docker-compose.yml (app + postgres)

**测试**: `docker-compose up`

---

### 5. 部署 (6:30-7:45)

```
@skill:railway-deploy
"Deploy to Railway with env vars"
```

**步骤**:
- 环境变量配置
- Railway部署
- 健康检查

---

### 6. 文档生成 (7:45-8:30)

```
/command docs
```

**生成**: OpenAPI/Swagger文档

---

### 7. 总结 (8:30-9:00)

**成果**:
- ✅ 完整RESTful API
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ Comprehensive tests
- ✅ Docker containerized
- ✅ Deployed to cloud
- ✅ API documentation

**对比**:
- AI辅助: < 10分钟
- 传统开发: 3-4小时

---

## ✅ 制作清单（两集）

### 准备
- [ ] 准备干净项目目录
- [ ] Postman collection
- [ ] PostgreSQL测试数据

### EP13录制
- [ ] 项目初始化
- [ ] 数据库设计
- [ ] Auth实现和测试

### EP14录制
- [ ] CRUD实现
- [ ] 测试编写
- [ ] Docker配置
- [ ] 部署演示

### 后期
- [ ] 添加字幕（两集）
- [ ] 代码高亮标注
- [ ] 进度条显示
- [ ] 时间对比动画
