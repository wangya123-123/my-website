# 好生学习中心网站

这个版本已接入“小鸡聚合”的 OpenAI 兼容图片编辑接口，用于“用户上传教材图片，生成复习分析样板图”。

样板图会引导上游模型输出这些模块：

- 教材识别：学科、年级、教材版本、省份或地区适配，无法确认时标注“需确认”
- 历年考试题型方向：按学科概括常见题型
- 常考框架：把教材核心章节整理成复习框架
- 重点难点：区分必会基础、易错难点、拔高思维
- 思维导图：展示复习路径
- 复习指标和规划：阶段目标、每日任务、错题整理、真题训练、回顾检测

## 启动

先设置上游接口密钥：

```powershell
$env:XIAOJI_API_KEY="你的密钥"
```

可选配置：

```powershell
$env:XIAOJI_API_BASE="https://xiaoji.baziapi.site/v1"
$env:XIAOJI_IMAGE_MODEL="gpt-image-2"
$env:PORT="4173"
```

启动服务：

```powershell
& "C:\Users\ZhuanZ（无密码）\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\server.py
```

打开：

```text
http://127.0.0.1:4173/
```

## 接口

前端会调用本项目自己的接口：

```text
POST /api/textbook-sample
```

字段：

- `image`：教材图片，支持 JPG、PNG、WEBP、GIF，10MB 以内
- `goal`：可选，省份 / 年级 / 科目 / 考试目标，例如“广东初三数学中考”

后端再调用：

```text
POST https://xiaoji.baziapi.site/v1/images/edits
```

密钥只保存在后端环境变量中，不会暴露给浏览器。
