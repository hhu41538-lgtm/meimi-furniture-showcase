# 美觅家居产品图册

移动端优先的家具、定制与空间案例产品图册，入口为 `/app`；`/admin` 是内部员工报价工作台。

运行环境要求 Node.js `18.18+`。

## 本地开发

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:3000/app`。

## 检查与构建

```bash
npx tsc --noEmit
npm run lint
npm run audit:catalogue
npm run audit:export
npm run audit:miniprogram
npm run audit:security
npm run smoke:catalogue
npm run build
```

`audit:catalogue` 会检查产品图册引用的图片是否存在；`smoke:catalogue` 会检查核心路由、PWA 清单、离线页和国内联系电话。

也可以直接运行 `npm run check:catalogue` 完成整套检查。

## 本地生产预览

```bash
npm run build
npm run preview:catalogue
```

`next start` 会启动完整的 Next.js 生产服务。生产部署需要支持 Next.js 服务端接口，以便管理员和销售端共享云端产品、价格与报价公式。

## 主要入口

- `/app`：移动产品图册
- `/app/products/[slug]`：产品详情、视图切换、材质效果与局部细节
- `/app/studio/[slug]`：空间案例与定制方向
- `/manifest.webmanifest`：PWA 配置
- `/offline.html`：离线回退页
- `/admin`：内部员工报价工作台。先选择管理员版或销售版登录；管理员密钥为 `2675982129`，销售可自行注册密钥并由管理员分配客户池、报价、产品、搜索、汇率物流权限。管理员可以新增 / 下架 / 删除产品、维护固定报价模式并统一销售端售价，销售端只能读取这些资料。
- `miniprogram/`：微信小程序 `web-view` 适配层，导入微信开发者工具后替换真实 AppID

## 发布顺序

1. 执行 `npm run build`，将 `out/` 部署到 HTTPS 静态托管，并确认 `https://www.meimifurniture.com/app/` 可访问。
2. 在微信公众平台把 `www.meimifurniture.com` 配置为业务域名，再导入 `miniprogram/` 提交审核。
3. `/admin` 的客户资源、报价草稿和报价留档仍按员工保存在浏览器本地；产品、价格和报价公式通过 `/api/workspace-state` 同步到云端。首次部署前，需要在 Vercel Marketplace 绑定 Postgres，并配置 `DATABASE_URL` 与 `MEIMI_ADMIN_SYNC_KEY` 环境变量。

### 开启产品与价格同步

1. 在 Vercel 项目的 `Storage` 中从 Marketplace 绑定 Neon 或其他兼容 Postgres 的数据库，让项目获得 `DATABASE_URL`。
2. 在 Vercel 项目的 `Settings > Environment Variables` 增加 `MEIMI_ADMIN_SYNC_KEY`，值填写管理员密钥 `2675982129`，至少勾选 Production。
3. 重新部署一次。管理员登录后保存产品或报价公式，工作台顶部出现“已同步云端 V...”即表示发布成功；销售端打开、切回页面或等待约 30 秒会自动读取最新资料。

接口会在第一次访问时自动创建 `meimi_workspace_state` 表。云端只保存产品资料、销售端统一价格和报价公式，不保存客户私有备注、报价草稿或报价留档。

## 素材约定

产品数据位于 `lib/products.ts`，空间案例位于 `lib/catalogueStudio.ts`。新增图片后，先更新对应数据引用，再执行素材审计与生产构建。
