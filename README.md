# HandCard ✏️

中文文案 → Excalidraw 手绘知识卡片生成器

输入中文文案，自动拆分为结构化内容，实时生成 Excalidraw 风格的知识卡片图片。支持 15 种内容模板 × 9 种视觉风格自由组合，PPT 式多页轮播预览，一键导出 PNG。

## ✨ 功能特性

### 15 种内容模板

| 模板 | 场景 |
|---|---|
| 💡 认知反差型 | 打破常见认知，制造冲击感 |
| 🔄 错误/正确对比型 | ❌✅ 直观对比，纠正行为 |
| 🪜 三步方法型 | 简单步骤，降低行动门槛 |
| 📋 问题清单型 | 清单引发自查，对号入座 |
| 🎯 痛点成交型 | 放大痛点，推动行动 |
| 📖 故事型 | 真实故事引发共鸣 |
| 📊 数据冲击型 | 数字制造冲击，增强说服力 |
| 💬 金句卡片型 | 金句 + 解读，适合传播 |
| ❓ 问答解惑型 | 提问引发好奇，回答给价值 |
| 🔄 前后对比型 | 以前 vs 现在，直观变化 |
| ⏰ 限时促销型 | 制造紧迫感，推动立刻行动 |
| 🗣️ 用户证言型 | 真实反馈建立信任 |
| 🧩 方法论型 | 系统化框架，专业权威 |
| 🔥 热点借势型 | 蹭热点引流 |
| 🎓 知识科普型 | 把复杂概念讲清楚 |

### 9 种视觉风格

| 风格 | 特点 |
|---|---|
| ✏️ 手绘涂鸦 | 高 roughness、hachure 填充、Virgil 手绘字体 |
| 📐 极简商务 | 线条干净、solid 填充、Cascadia 字体 |
| 💜 霓虹暗黑 | 深色底 + 荧光描边 |
| 📜 复古纸张 | 牛皮纸底色、棕色描边 |
| 🎨 孟菲斯撞色 | cross-hatch 填充、鲜艳配色 |
| 🌸 日系清新 | 柔和马卡龙色调 |
| 🖤 质感黑金 | 纯黑底 + 金色描边 |
| 🍬 糖果渐变 | 粉紫蓝配色 |
| 📓 手写笔记 | 仿笔记本横线、最高 roughness |

### 其他特性

- 📐 画布尺寸 1080×1920（9:16 竖屏，适合短视频封面）
- 🖼️ PPT 式多页轮播预览，同时可见 2 张卡片
- 🔍 缩放控制（滑条 + 按钮 + 键盘快捷键）
- 📥 一键导出 PNG
- 📝 结构化 JSON 预览
- 📱 响应式布局

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器
# http://localhost:3000
```

## 🏗️ 技术栈

- **Next.js 15** + TypeScript
- **Excalidraw** — 手绘风格画布渲染
- **React 19**

## 📁 项目结构

```
├── app/
│   ├── page.tsx              # 入口页
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   └── CardGenerator.tsx     # 核心组件（模板+风格+轮播+导出）
├── lib/
│   ├── mockParser.ts         # 文案解析器（15 种模板）
│   ├── cardStyles.ts         # 视觉风格预设（9 种风格）
│   ├── excalidrawElements.ts # JSON → Excalidraw 元素
│   └── exportPng.ts          # PNG 导出
├── package.json
└── next.config.js
```

## 🔧 后续扩展

当前 `mockParser.ts` 为本地 mock 实现，可替换为 AI API 调用：

```typescript
// 替换 mockParseToCardData 函数
export async function mockParseToCardData(
  input: string,
  templateId: TemplateId
): Promise<CardData> {
  const response = await fetch("/api/parse", {
    method: "POST",
    body: JSON.stringify({ text: input, template: templateId }),
  });
  return response.json();
}
```

## 📄 License

MIT
