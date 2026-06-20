<p align="center">
  <h1 align="center">✏️ HandCard</h1>
  <p align="center"><b>中文文案 → 手绘知识卡片</b></p>
  <p align="center">
    输入文案，自动生成 Excalidraw 风格知识卡片<br/>
    15 种营销模板 × 9 种视觉风格 × PPT 多页轮播
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Excalidraw-0.18-violet" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## 截图

> 运行 `npm run dev` 后访问 `http://localhost:3000`，截图保存到 `screenshots/` 目录即可在下方展示。

<p align="center">
  <img src="screenshots/01-empty.png" width="45%" alt="空状态" />
  <img src="screenshots/02-sketch.png" width="45%" alt="手绘涂鸦风格" />
</p>
<p align="center">
  <img src="screenshots/03-minimal.png" width="45%" alt="极简商务风格" />
  <img src="screenshots/04-neon.png" width="45%" alt="霓虹暗黑风格" />
</p>

---

## 它能做什么

把一段中文文案丢进去，**自动拆分**标题、模块、要点、强调句，**实时渲染**成手绘风格的知识卡片图片。

适合做：短视频封面 · 朋友圈海报 · 小红书图文 · 课程卡片 · 营销素材

---

## 15 种内容模板

| 模板 | 适用场景 | 自动识别规则 |
|:---|:---|:---|
| 💡 **认知反差型** | 打破常识，制造冲击 | "你以为"→删除线，"实际上"→高亮 |
| 🔄 **错误/正确对比** | 纠正行为习惯 | "错误："+下一行"正确："→左右对比 |
| 🪜 **三步方法型** | 降低行动门槛 | "第X步："→步骤标签卡片 |
| 📋 **问题清单型** | 引发自查共鸣 | 每行→红色编号圆圈+内容框 |
| 🎯 **痛点成交型** | 放大痛点推动行动 | "第X种："→标签框，"流程："→流程箭头 |
| 📖 **故事型** | 引发共鸣代入感 | 逐行叙事，最后一句自动高亮 |
| 📊 **数据冲击型** | 数字增强说服力 | 数字/百分比开头的行→自动高亮 |
| 💬 **金句卡片型** | 适合传播收藏 | 第一行→高亮金句，其余→解读 |
| ❓ **问答解惑型** | 提问引发好奇 | "问："/"答："→左右对比卡片 |
| 🔄 **前后对比型** | 展示变化 | "以前："/"现在："→左右对比 |
| ⏰ **限时促销型** | 制造紧迫感 | 价格/名额/截止日期→自动高亮 |
| 🗣️ **用户证言型** | 建立信任 | "——xxx"→注释箭头 |
| 🧩 **方法论型** | 建立专业权威 | 英文缩写+中文→标签卡片 |
| 🔥 **热点借势型** | 蹭热点引流 | "第X个："→标签卡片 |
| 🎓 **知识科普型** | 建立专业形象 | 数字行→高亮，短标题+长解释→标签 |

---

## 9 种视觉风格

| 风格 | 视觉特点 |
|:---|:---|
| ✏️ **手绘涂鸦** | 粗线条、歪扭边框、hachure 填充、四角红点装饰 |
| 📐 **极简商务** | 零 roughness、纯色填充、Cascadia 字体 |
| 💜 **霓虹暗黑** | 深色底 `#0d1117`、青绿描边、粉色强调 |
| 📜 **复古纸张** | 牛皮纸底色、棕色描边、手绘填充 |
| 🎨 **孟菲斯撞色** | cross-hatch 填充、黄标签框、橙色强调 |
| 🌸 **日系清新** | 柔和粉绿配色、低 roughness |
| 🖤 **质感黑金** | 纯黑底+金色描边、solid 填充 |
| 🍬 **糖果渐变** | 粉紫蓝配色、hachure 填充 |
| 📓 **手写笔记** | 自动画横线+红色竖线、最高 roughness |

---

## 其他特性

- 📐 画布 1080×1920（9:16 竖屏，短视频封面标准尺寸）
- 🖼️ PPT 式多页轮播，同时可见 2 张卡片，左右滑动切换
- 🔍 缩放滑条 + 一键适配画面
- 📥 一键导出 PNG（自动计算元素边界，不裁切）
- 📝 可折叠 JSON 预览面板
- 📱 响应式布局，移动端可用
- ⌨️ 键盘左右箭头翻页

---

## 快速开始

```bash
git clone https://github.com/zhuowoshuang/handcard.git
cd handcard
npm install
npm run dev
```

打开 `http://localhost:3000`，选择模板 → 输入文案 → 点击「⚡ 生成预览」

---

## 项目结构

```
├── app/
│   ├── page.tsx                # 入口
│   ├── layout.tsx              # 布局
│   └── globals.css             # 全局样式（PPT轮播、模板卡片、风格选择器）
├── components/
│   └── CardGenerator.tsx       # 核心组件（状态管理 + Excalidraw 集成）
├── lib/
│   ├── mockParser.ts           # 文案解析器（15种模板 × 各自的解析规则）
│   ├── cardStyles.ts           # 视觉风格预设（9种风格的颜色/粗细/字体配置）
│   ├── excalidrawElements.ts   # JSON → Excalidraw 骨架元素
│   └── exportPng.ts            # PNG 导出（exportToBlob + 自动边界计算）
├── package.json
└── next.config.js
```

---

## 技术实现

- **Excalidraw `convertToExcalidrawElements`**：用骨架对象（skeleton）描述矩形、文字、箭头、椭圆、线条，由 Excalidraw 统一转换为正式元素
- **模板解析器**：纯正则匹配，无 AI 依赖。每种模板有独立的解析函数，后续可替换为 OpenAI / Claude API
- **风格系统**：颜色、粗细、roughness、填充方式、字体全部参数化，任意模板 × 任意风格自由组合
- **PNG 导出**：`exportToBlob` 自动根据元素边界计算画布大小，不依赖固定尺寸

---

## 后续可扩展

当前 `mockParser.ts` 为正则 mock 实现，替换为 AI API 只需改一个函数：

```ts
export async function mockParseToCardData(
  input: string,
  templateId: TemplateId
): Promise<CardData> {
  const res = await fetch("/api/parse", {
    method: "POST",
    body: JSON.stringify({ text: input, template: templateId }),
  });
  return res.json();
}
```

---

## License

MIT
