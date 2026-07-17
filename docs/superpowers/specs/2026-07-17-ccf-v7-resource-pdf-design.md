# CCF 第七版目录 PDF 资源页设计

## 目标

将 CCF 官网发布的《第七版中国计算机学会推荐国际学术会议和期刊目录（正式版）》保存到个人主页仓库，并在 `resources.html` 提供稳定的站内 PDF 入口。

## 来源与文件

- 采用 CCF 官方页面在 2026 年 3 月 31 日发布、4 月 9 日勘误更新后的正式版下载文件。
- 将文件保存为 `files/resources/ccf-recommended-conferences-journals-2026-v7.pdf`，使用 ASCII 文件名以避免 URL 编码和跨平台路径问题。
- 下载后校验文件类型、大小、页数与 PDF 可解析性，避免把错误页保存成 PDF。

## 页面设计

- 沿用 `resources.html` 现有的资源卡片结构和样式，不新增 CSS，不调整导航或其他页面。
- 在现有学位授予标准之前新增一张资源卡片，标题为“第七版中国计算机学会推荐国际学术会议和期刊目录（正式版）”。
- 元信息写为 “CCF recommended international conferences and journals, seventh edition (2026).”
- 按钮继续使用现有的 “View PDF”，在新标签页打开站内 PDF。

## 方案取舍

1. 推荐并采用：从 CCF 官方下载后在本站托管。站内链接稳定，符合现有资源页模式。
2. 仅链接 CCF 下载接口：无需提交二进制文件，但官方动态下载地址可能变化或限制直接访问。
3. 链接高校镜像：访问通常简单，但来源权威性和长期稳定性弱于 CCF 官方文件。

## 验证与发布

- 检查 HTML 语法相关结构、资源链接目标、PDF 文件头和可解析页数。
- 运行 `git diff --check`，仅暂存设计记录、`resources.html` 与新增 PDF；保留工作区已有的无关改动。
- 推送到 `origin/main` 后确认本地与远端提交一致，并通过公开 URL 检查资源页和 PDF 均返回成功状态。
