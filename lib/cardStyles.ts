/**
 * cardStyles.ts
 * 视觉风格预设 —— 控制 Excalidraw 元素的颜色、粗细、填充、字体等外观属性。
 * 与内容模板（template）正交：任意 template × 任意 style 可自由组合。
 */

export type StyleId =
  | "sketch"          // 手绘涂鸦
  | "minimal"         // 极简商务
  | "neon"            // 霓虹暗黑
  | "vintage"         // 复古纸张
  | "memphis"         // 孟菲斯撞色
  | "jp-fresh"        // 日系清新
  | "luxury"          // 质感黑金
  | "candy"           // 糖果渐变
  | "notebook";       // 手写笔记

export type CardStyle = {
  id: StyleId;
  name: string;
  description: string;
  preview: string;           // 用于 UI 展示的 emoji / 小图标
  background: string;        // 画布背景色
  primary: string;           // 主描边色
  secondary: string;         // 次要 / 装饰色
  accent: string;            // 强调色（高亮、重点）
  textOnLight: string;       // 浅底上的文字色
  textOnDark: string;        // 深底上的文字色
  fillStyle: "hachure" | "cross-hatch" | "solid" | "zigzag";
  strokeWidth: number;
  roughness: number;         // 0 = 线条完美，3 = 非常手绘
  fontFamily: number;        // 1=Virgil(手绘) 2=Helvetica 3=Cascadia
  fontSize: { title: number; subtitle: number; body: number; label: number; highlight: number };
  labelFill: string;         // tag 标签框背景
  boxFill: string;           // box 框背景
  sectionGap: number;        // section 间距
  chipFg: string;            // 风格选中时的前景文字色（对比度安全）
};

export const cardStyles: CardStyle[] = [
  // ── 1. 手绘涂鸦 ──
  {
    id: "sketch",
    name: "手绘涂鸦",
    description: "夸张手绘感，歪歪扭扭的线条和涂鸦填充",
    preview: "✏️",
    background: "#fffef8",
    primary: "#1a1a1a",
    secondary: "#555555",
    accent: "#e03131",
    textOnLight: "#1a1a1a",
    textOnDark: "#ffffff",
    fillStyle: "hachure",
    strokeWidth: 4,
    roughness: 3,
    fontFamily: 1,
    fontSize: { title: 58, subtitle: 30, body: 32, label: 28, highlight: 38 },
    labelFill: "#fff3f3",
    boxFill: "#fffef8",
    sectionGap: 62,
    chipFg: "#fff"
  },

  // ── 2. 极简商务 ──
  {
    id: "minimal",
    name: "极简商务",
    description: "干净利落，适合职场和商业场景",
    preview: "📐",
    background: "#fafafa",
    primary: "#1a1a2e",
    secondary: "#6c757d",
    accent: "#0066ff",
    textOnLight: "#1a1a2e",
    textOnDark: "#ffffff",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 0,
    fontFamily: 3,
    fontSize: { title: 52, subtitle: 26, body: 28, label: 24, highlight: 34 },
    labelFill: "#e8f0fe",
    boxFill: "#ffffff",
    sectionGap: 50,
    chipFg: "#fff"
  },

  // ── 3. 霓虹暗黑 ──
  {
    id: "neon",
    name: "霓虹暗黑",
    description: "深色背景 + 荧光描边，科技感拉满",
    preview: "💜",
    background: "#0d1117",
    primary: "#00ffcc",
    secondary: "#8b949e",
    accent: "#ff6ec7",
    textOnLight: "#c9d1d9",
    textOnDark: "#00ffcc",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    fontFamily: 3,
    fontSize: { title: 52, subtitle: 26, body: 28, label: 24, highlight: 34 },
    labelFill: "#161b22",
    boxFill: "#161b22",
    sectionGap: 52,
    chipFg: "#1a1a1a"  // 粉色背景用深色字
  },

  // ── 4. 复古纸张 ──
  {
    id: "vintage",
    name: "复古纸张",
    description: "暖色纸质感，文艺温暖",
    preview: "📜",
    background: "#f5f0e1",
    primary: "#4a3728",
    secondary: "#8b7355",
    accent: "#b52418",
    textOnLight: "#3e2723",
    textOnDark: "#f5f0e1",
    fillStyle: "hachure",
    strokeWidth: 3,
    roughness: 2.8,
    fontFamily: 1,
    fontSize: { title: 52, subtitle: 26, body: 28, label: 26, highlight: 34 },
    labelFill: "#fde8d0",
    boxFill: "#faf5e8",
    sectionGap: 54,
    chipFg: "#fff"
  },

  // ── 5. 孟菲斯撞色 ──
  {
    id: "memphis",
    name: "孟菲斯撞色",
    description: "大胆几何 + 鲜艳配色，年轻活泼",
    preview: "🎨",
    background: "#fffef5",
    primary: "#2d3436",
    secondary: "#636e72",
    accent: "#e17055",
    textOnLight: "#2d3436",
    textOnDark: "#ffffff",
    fillStyle: "cross-hatch",
    strokeWidth: 3,
    roughness: 2.5,
    fontFamily: 1,
    fontSize: { title: 54, subtitle: 28, body: 30, label: 26, highlight: 36 },
    labelFill: "#ffeaa7",
    boxFill: "#ffffff",
    sectionGap: 56,
    chipFg: "#fff"
  },

  // ── 6. 日系清新 ──
  {
    id: "jp-fresh",
    name: "日系清新",
    description: "柔和马卡龙色调，清爽舒适",
    preview: "🌸",
    background: "#fefefe",
    primary: "#5b7553",
    secondary: "#9cb894",
    accent: "#e88d94",
    textOnLight: "#4a5568",
    textOnDark: "#ffffff",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1.2,
    fontFamily: 1,
    fontSize: { title: 48, subtitle: 24, body: 26, label: 24, highlight: 32 },
    labelFill: "#fce4ec",
    boxFill: "#f9fbe7",
    sectionGap: 48,
    chipFg: "#fff"
  },

  // ── 7. 质感黑金 ──
  {
    id: "luxury",
    name: "质感黑金",
    description: "深色底 + 金色描边，高端大气",
    preview: "🖤",
    background: "#1a1a1a",
    primary: "#d4af37",
    secondary: "#8a8a8a",
    accent: "#f5e6ab",
    textOnLight: "#e8e8e8",
    textOnDark: "#d4af37",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 0.5,
    fontFamily: 3,
    fontSize: { title: 52, subtitle: 26, body: 28, label: 24, highlight: 34 },
    labelFill: "#2a2a2a",
    boxFill: "#222222",
    sectionGap: 52,
    chipFg: "#1a1a1a"  // 金色背景用深色字
  },

  // ── 8. 糖果渐变 ──
  {
    id: "candy",
    name: "糖果渐变",
    description: "粉紫蓝配色，甜美梦幻",
    preview: "🍬",
    background: "#fef6ff",
    primary: "#6c5ce7",
    secondary: "#a29bfe",
    accent: "#fd79a8",
    textOnLight: "#2d3436",
    textOnDark: "#ffffff",
    fillStyle: "hachure",
    strokeWidth: 2,
    roughness: 1.5,
    fontFamily: 1,
    fontSize: { title: 52, subtitle: 26, body: 28, label: 26, highlight: 34 },
    labelFill: "#f3e5f5",
    boxFill: "#ffffff",
    sectionGap: 52,
    chipFg: "#fff"
  },

  // ── 9. 手写笔记 ──
  {
    id: "notebook",
    name: "手写笔记",
    description: "仿笔记本横线，真实手写感",
    preview: "📓",
    background: "#fffff8",
    primary: "#2c3e50",
    secondary: "#7f8c8d",
    accent: "#c0392b",
    textOnLight: "#2c3e50",
    textOnDark: "#ecf0f1",
    fillStyle: "hachure",
    strokeWidth: 3,
    roughness: 3,
    fontFamily: 1,
    fontSize: { title: 50, subtitle: 24, body: 28, label: 24, highlight: 34 },
    labelFill: "#ebf5fb",
    boxFill: "#fdfefe",
    sectionGap: 50,
    chipFg: "#fff"
  }
];

/** 获取风格，找不到时回退到 sketch */
export function getStyle(id: StyleId): CardStyle {
  return cardStyles.find((s) => s.id === id) || cardStyles[0];
}
