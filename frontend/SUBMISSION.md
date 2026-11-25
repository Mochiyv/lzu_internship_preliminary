# 提交说明（SUBMISSION）

## 基本信息

| 项 | 内容 |
|---|---|
| 姓名 | 墨池语 |
| 学号 | 320240920480 |
| 方向 | 前端（同时完成了后端 L0 接口，便于直连） |
| 分支 | `320240920480` |
| 实际投入 | 约 30 小时（跨 2 天，含环境排查与文档） |

## 环境

| 项 | 版本 |
|---|---|
| 操作系统 | Windows 11 |
| 运行时 | Node 26.13.1 / JDK 17.0.14（Microsoft OpenJDK） |
| 包管理器 | npm 11.20.0 / Maven Wrapper 3.10.1 |

> 注意：这台机器上 `java -version` 默认指向 JDK 27，但 Spring Boot 3.x 只保证到 17/21。
> 我在 `.mvn/jdk-env.cmd` / `.mvn/jdk-env.sh` 里写了自动探测，`mvnw` 启动时会自己找到 JDK 17，
> **不需要评审手动切 `JAVA_HOME`**。

## 启动方式（必填，要能照抄）

前端直连后端，两个终端各起一个：

```bash
# 终端 1：后端（必须先起，前端代理指向 8080）
cd backend
./mvnw spring-boot:run          # Windows: .\mvnw.cmd spring-boot:run
# 起好后 http://localhost:8080，控制台会打印 24 条种子商品已载入

# 终端 2：前端
cd frontend
npm install
npm run dev
# 打开 http://localhost:5173
```

前置条件：Node.js 18+（`node -v`、`npm -v` 都要能打印版本号）。两个命令都必须在
`frontend/` 目录下执行，`package.json` 在那里；在仓库根目录跑会报
`npm error enoent Could not read package.json`。

> 启动失败时的排查顺序：
> 1. **`npm` 不是可识别的命令** → Node 装了但没进 `PATH`。临时补一行
>    `$env:Path = "C:\Program Files\nodejs;" + $env:Path` 再跑，或直接重开终端。
> 2. **`Error: Port 5173 is already in use`** → 上一次的 dev server 还没退。
>    `vite.config.js` 里是 `strictPort: true`，端口被占会直接退出而不是自动换端口。
>    执行 `Get-NetTCPConnection -LocalPort 5173 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }` 后重试。
> 3. **页面能开但列表是错误态** → 后端没起或不在 8080。前端把 `/api` 代理到
>    `http://localhost:8080`，先确认 `curl http://localhost:8080/api/products?pageSize=1` 有返回。
> 4. 端口本身被改过时会读到 `API_TARGET` / `MOCK_PORT` / `BACKEND_PORT` 环境变量，
>    优先级见 `vite.config.js` 的 `resolveApiTarget`。

验证后端真的起来了：

```bash
curl "http://localhost:8080/api/products?pageSize=5"
# 应返回 {"code":0,"message":"ok","data":{"total":24,...}}
```

### 三个可选开关

| 变量 | 作用 |
|---|---|
| `API_TARGET=http://host:port` | 前端代理指向任意地址（默认 `http://localhost:8080`） |
| `MOCK_PORT=3001 npm run dev` | 切回题目自带的 mock 服务（需要先在 `mock/` 下起 mock） |
| `VITE_API_BASE=/api` | 请求前缀，默认就是 `/api`，一般不用改 |

### 数据说明

- `backend/data.sql` 里有 24 条初始商品，字段和 `frontend/mock/db.json` 完全一致
  （含 `stock=0` 缺货、`status=off` 已下架、`price=9999999` 大额、emoji 标题、50 字超长标题、
  `<script>` XSS 标题这些边界样本），所以直连后端和用 mock 看到的列表是一样的。
- 数据库是 **H2 内存库**（`jdbc:h2:mem:market`），**重启后端即恢复成 24 条种子数据**。
  想复位就 Ctrl+C 再 `mvnw spring-boot:run` 一次。没有 `POST /api/_reset`，重启就是复位。
- `schema.sql` 是手写的建表语句（`DROP TABLE IF EXISTS` + `CREATE TABLE`），可重复执行。

## 我做到了哪一步

| 层级 | 完成情况 |
|---|---|
| L0 | 做了 **5 / 5** 条 |
| L1 | 做了 **0 / 4** 条 |
| L2 | 未做 |

L0 明细：

| 编号 | 内容 | 状态 |
|---|---|---|
| L0-1 | 商品列表（表格 + 分页 + 筛选 + 加载/空/错三态） | 完成 |
| L0-2 | 发布商品（5 字段表单 + 元→分换算 + 前端校验 + 成功反馈） | 完成 |
| L0-3 | `GET /api/products` 列表接口（关键词/状态/分类/分页） | 完成 |
| L0-4 | `GET /api/products/{id}` 详情接口（404 / 400 分支） | 完成 |
| L0-5 | `PATCH /api/products/{id}/status` 上下架 + 前端即时回写 | 完成 |

## 测试 / 自检

```bash
# 前端：23 条
cd frontend && npm test

# 后端：27 条
cd backend && ./mvnw -o test
```

前端输出：

```
 ✓ test/money.test.js (16 tests) 8ms
 ✓ test/products.test.js (7 tests) 10ms

 Test Files  2 passed (2)
      Tests  23 passed (23)
   Duration  720ms
```

后端输出：

```
[INFO] Tests run: 3,  Failures: 0, Errors: 0, Skipped: 0 -- in com.example.demo.DemoApplicationTests
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0 -- in com.example.demo.product.ProductCreateTests
[INFO] Tests run: 14, Failures: 0, Errors: 0, Skipped: 0 -- in com.example.demo.product.ProductQueryTests
[INFO] Tests run: 27, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

测的都是**接口契约**，不是实现细节：

- 前端 `money.test.js`：`yuanToFen` / `fenToYuan` 的舍入、负数、超两位小数、`0`、空串、超大值。
- 前端 `products.test.js`：`sellerName` 是否补齐、`description` 默认空串、请求体字段集合是否**精确匹配**、
  分页默认值、空筛选项是否被下发。
- 后端 `ProductCreateTests`：201、字段校验顺序、非法分类、价格非整数分、超长字段、显式 `description: null` 归一为空串。
- 后端 `ProductQueryTests`：列表筛选、分页越界、404/400 分支、状态变更幂等。

## 没做完的地方

| 项 | 状态 | 原因 |
|---|---|---|
| L1-1 ~ L1-4（详情页 / 订单 / 下单 / 我的订单） | 未做 | L0 里我花了较多时间在「前后端真的连上」和「边界数据不出错」上，L1 没开始 |
| L2 挑战 | 未做 | 时间不够 |
| 真实持久化（文件库 / MySQL） | 未做 | 刻意选内存库，见 `DESIGN.md` §5 |

已知问题：

1. **没有做乐观锁**。两个浏览器同时点同一行的上下架，后写的赢，不会报冲突。L0 的量级下可以接受，
   但真实场景要加 `version` 字段或 `WHERE status = ?` 条件更新。
2. **列表一次性拉 50 条**。后端 `pageSize` 上限是 50，前端默认就取 50，所以 24 条时等于不分页。
   商品上千条时这个默认值要改小，并把分页控件接上。
3. **关键词搜索是 `LIKE` 全表扫**。数据量小无所谓，量大了要建索引或用全文检索。
4. `backend/src/test/java/com/example/demo/ChatControllerTests.java` 是 0 字节空文件，我没动它。

## 自检清单

- [x] 删掉依赖目录后，按上面的命令能重新跑起来（`node_modules` / `target` 删过，重装重跑通过）
- [x] 没提交 `node_modules` / `target` / `*.db` / `.env`（`.gitignore` 已覆盖）
- [x] `DESIGN.md`、`AI_USAGE.md` 已填写完整
- [x] 截图放进了 `screenshots/`（7 张，见下）

## 截图对应关系

| 文件 | 内容 |
|---|---|
| `l0-1-product-list.png` | 商品列表，25 行（24 种子 + 1 条我发的），含缺货/已下架/大额/emoji/超长标题/XSS 标题 |
| `l0-2-publish-form.png` | 发布表单空态 |
| `l0-2-publish-form-filled.png` | 填完表单，显示「将提交 price = 1250（分），显示为 ¥12.50」 |
| `l0-3-publish-success.png` | 发布成功，绿色反馈「发布成功：二手无线鼠标（¥12.50）」，表单已清空 |
| `l0-4-status-toggle.png` | 上下架：该行状态徽标变「已下架」，按钮变「上架」，顶部 toast「《二手无线鼠标》已下架」 |
| `l0-5-empty-state.png` | 搜索 `zzz不存在的商品` 无结果的空态 + 「清空筛选」 |
| `l0-5-loading-state.png` | 请求被延迟 4s 时捕获的加载态（spinner + 「加载中…」） |
