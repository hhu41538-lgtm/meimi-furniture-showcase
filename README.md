# 美觅家居产品图册

移动端优先的家具、定制与空间案例产品图册。当前以 Next.js 静态导出方式运行，入口为 `/app`。

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

## 预览静态产物

```bash
npm run build
npm run preview:catalogue
```

静态文件输出在 `out/`，可部署到支持静态文件托管的服务器或 CDN。当前项目使用 `output: export`，`npm run start` 会直接预览 `out/` 静态产物。

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
3. 当前 `/admin` 的账号、产品价格、公式、客户资源和报价留档保存在浏览器 `localStorage`，适合内部试运行与单浏览器验证；正式多设备上线前需要把登录、权限、产品和报价数据接入服务端数据库 / 身份服务。

## 素材约定

产品数据位于 `lib/products.ts`，空间案例位于 `lib/catalogueStudio.ts`。新增图片后，先更新对应数据引用，再执行素材审计与生产构建。
