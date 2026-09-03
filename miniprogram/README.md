# Meimi&H 小程序适配层

这是第一阶段的小程序入口，使用微信 `web-view` 承载已经完成的移动端产品图册，保持产品数据和视觉交互只有一套来源。

## 发布前配置

1. 先执行主项目 `npm run build`，把生成的 `out/` 部署到正式 HTTPS 站点，并确认 `https://www.meimifurniture.com/app/` 返回 200；当前该地址尚未部署，返回 404。
2. 使用微信开发者工具导入 `miniprogram` 文件夹。
3. 在 `project.config.json` 中替换真实 AppID；没有 AppID 时只能使用测试号预览，不能正式提交。
4. 在微信公众平台配置业务域名 `www.meimifurniture.com`，不要填写路径 `/app/`。
5. 确认线上地址、图片资源和电话链接均可访问，再编译、预览和提交审核。

## 本地验证

在主项目根目录执行：

```bash
npm run audit:miniprogram
```

它会检查小程序入口文件、JSON、`web-view` 和生产地址配置。微信开发者工具的真实 AppID、业务域名和审核提交仍需在微信公众平台完成。

当前适配层不包含拆分图/3D功能；该能力按产品计划放到最后阶段。资料工作台 `/admin` 目前是本地浏览器版，正式后台还需接入登录、数据库和权限。
