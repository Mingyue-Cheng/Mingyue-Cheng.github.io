# CCF 第七版目录 PDF 资源页实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CCF 第七版正式目录 PDF 自托管到个人主页，并在资源页新增可公开访问的入口。

**Architecture:** 从 CCF 官方下载接口取得 2026 年 4 月 9 日勘误版 PDF，保存到现有 `files/resources/` 目录；在 `resources.html` 的资源列表顶部沿用现有卡片结构新增入口。发布时只暂存本计划、目标 HTML 与新增 PDF，不触碰工作区已有的无关文件。

**Tech Stack:** 静态 HTML、GitHub Pages、curl、file、pdfinfo、Git

---

### Task 1: 保存并校验官方 PDF

**Files:**
- Create: `files/resources/ccf-recommended-conferences-journals-2026-v7.pdf`

- [x] **Step 1: 运行目标文件存在性检查并确认失败**

Run:

```bash
test -f files/resources/ccf-recommended-conferences-journals-2026-v7.pdf
```

Expected: FAIL，退出码为 1，因为目标 PDF 尚未加入仓库。

- [x] **Step 2: 从 CCF 官方下载接口取得文件**

Run:

```bash
curl -sS -L -o /tmp/ccf-v7.pdf 'https://www.ccf.org.cn/ccf/contentcore/resource/download?ID=112CF3BF7E1140ACEB271ADAED12A67ADFABB8FF099E40C2759502A85C8A281F'
```

Expected: 命令成功，`/tmp/ccf-v7.pdf` 创建。

- [x] **Step 3: 校验临时文件后复制到资源目录**

Run:

```bash
file /tmp/ccf-v7.pdf
test "$(pdfinfo /tmp/ccf-v7.pdf | awk '/^Pages:/ {print $2}')" = "72"
test "$(shasum -a 256 /tmp/ccf-v7.pdf | awk '{print $1}')" = "271b630b576bf8a4f802e767f5694caded93680e22b3a19bef7902591c45c1d3"
cp /tmp/ccf-v7.pdf files/resources/ccf-recommended-conferences-journals-2026-v7.pdf
```

Expected: 临时文件是 PDF 1.7、72 页且摘要匹配，随后目标文件创建。

- [x] **Step 4: 校验仓库内文件类型、页数、大小和摘要**

Run:

```bash
file files/resources/ccf-recommended-conferences-journals-2026-v7.pdf
pdfinfo files/resources/ccf-recommended-conferences-journals-2026-v7.pdf
shasum -a 256 files/resources/ccf-recommended-conferences-journals-2026-v7.pdf
```

Expected: PDF 1.7、72 页、346777 字节，SHA-256 为 `271b630b576bf8a4f802e767f5694caded93680e22b3a19bef7902591c45c1d3`。

### Task 2: 在资源页新增卡片

**Files:**
- Modify: `resources.html`

- [x] **Step 1: 运行页面入口断言并确认失败**

Run:

```bash
rg -n 'ccf-recommended-conferences-journals-2026-v7\.pdf' resources.html
```

Expected: FAIL，退出码为 1，因为页面尚未包含新入口。

- [x] **Step 2: 在现有资源卡片前加入最小 HTML**

在 `<div class="resource-list">` 后加入：

```html
      <article class="resource-item">
        <h2 class="resource-title">第七版中国计算机学会推荐国际学术会议和期刊目录（正式版）</h2>
        <div class="resource-meta">CCF recommended international conferences and journals, seventh edition (2026).</div>
        <div class="resource-actions">
          <a class="resource-link" href="files/resources/ccf-recommended-conferences-journals-2026-v7.pdf" target="_blank" rel="noopener">View PDF</a>
        </div>
      </article>
```

- [x] **Step 3: 校验链接、标题、卡片顺序与 HTML 差异**

Run:

```bash
rg -n '第七版中国计算机学会推荐国际学术会议和期刊目录（正式版）|ccf-recommended-conferences-journals-2026-v7\.pdf' resources.html
git diff --check -- resources.html
```

Expected: 标题和链接各命中一次，新增卡片位于原有学位授予标准卡片之前，`git diff --check` 无输出。

### Task 3: 提交、推送并检查线上资源

**Files:**
- Add: `docs/superpowers/plans/2026-07-17-ccf-v7-resource-pdf.md`
- Add: `files/resources/ccf-recommended-conferences-journals-2026-v7.pdf`
- Modify: `resources.html`

- [x] **Step 1: 运行完整的本地发布前检查**

Run:

```bash
git diff --check
test "$(pdfinfo files/resources/ccf-recommended-conferences-journals-2026-v7.pdf | awk '/^Pages:/ {print $2}')" = "72"
test "$(shasum -a 256 files/resources/ccf-recommended-conferences-journals-2026-v7.pdf | awk '{print $1}')" = "271b630b576bf8a4f802e767f5694caded93680e22b3a19bef7902591c45c1d3"
```

Expected: 所有命令退出码为 0。

- [x] **Step 2: 仅暂存本次目标文件并检查范围**

Run:

```bash
git add docs/superpowers/plans/2026-07-17-ccf-v7-resource-pdf.md resources.html files/resources/ccf-recommended-conferences-journals-2026-v7.pdf
git diff --cached --name-only
git diff --cached --check
```

Expected: 暂存区只包含上述三个文件，检查无错误；`.DS_Store`、`.superpowers/` 与 `HomePage_files/Mycheng-7.jpg` 保持未暂存。

- [ ] **Step 3: 创建实施提交并推送**

Run:

```bash
git commit -m "Add CCF v7 directory PDF resource"
git push origin main
```

Expected: 提交和推送成功。

- [ ] **Step 4: 验证远端提交和公开 URL**

Run:

```bash
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
curl -sI https://mingyue-cheng.github.io/resources.html
curl -sI https://mingyue-cheng.github.io/files/resources/ccf-recommended-conferences-journals-2026-v7.pdf
```

Expected: 本地与 `origin/main` 为 `0 0`；两个公开 URL 最终均返回 HTTP 200，PDF 响应类型为 `application/pdf` 或 `application/octet-stream`。
