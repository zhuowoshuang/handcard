/**
 * stylePresets.ts
 * 6 种视觉风格预设 —— 控制背景、排版、颜色、边框、装饰、特效。
 * 与内容模板（template）正交：任意 template × 任意 preset 可自由组合。
 * 所有装饰通过 Excalidraw 元素渲染，PNG 导出自然包含。
 */

// ============================================================
//  类型
// ============================================================

export type PresetId =
  | "classic-handdrawn"
  | "notebook-doodle"
  | "cute-paper-note"
  | "lined-paper-clean"
  | "marker-highlight"
  | "scrapbook-sticker";

export interface StylePreset {
  id: PresetId;
  name: string;
  description: string;
  preview: string;

  background: {
    type: "plain" | "paper" | "lined" | "notebook" | "scrapbook";
    color: string;
    lineColor?: string;
    lineOpacity?: number;
    lineGap?: number;
    showBinding?: boolean;
    bindingColor?: string;
  };

  typography: {
    titleFontSize: number;
    bodyFontSize: number;
    labelFontSize: number;
    highlightFontSize: number;
    subtitleFontSize: number;
    fontFamily: number;      // 1=Virgil 2=Helvetica 3=Cascadia
  };

  colors: {
    ink: string;
    primary: string;
    secondary: string;
    danger: string;
    success: string;
    highlight: string[];     // 荧光笔色板
    labelBg: string;
    boxBg: string;
    boxStroke: string;
  };

  border: {
    type: "none" | "handdrawn" | "rounded" | "sketch" | "paper-card";
    width: number;
    radius: number;
    roughness: number;
    strokeStyle: "solid" | "dashed" | "dotted";
  };

  decorations: {
    enabled: boolean;
    density: "low" | "medium" | "high";
    items: string[];         // 装饰类型标识
  };

  effects: {
    paperShadow: boolean;
    markerHighlight: boolean;
    doodleUnderline: boolean;
    handdrawnCircle: boolean;
    watercolorBrush: boolean;
    stickerRotate: boolean;  // 内容块轻微旋转
  };

  sectionGap: number;
  chipFg: string;
}

// ============================================================
//  6 种风格预设
// ============================================================

export const stylePresets: StylePreset[] = [
  // ── 1. 经典手绘知识卡 ──
  {
    id: "classic-handdrawn",
    name: "经典手绘",
    description: "白底黑框红线，适合商业知识和方法论",
    preview: "✏️",
    background: { type: "plain", color: "#ffffff" },
    typography: { titleFontSize: 56, bodyFontSize: 30, labelFontSize: 28, highlightFontSize: 36, subtitleFontSize: 28, fontFamily: 1 },
    colors: {
      ink: "#1a1a1a", primary: "#1a1a1a", secondary: "#555555",
      danger: "#e03131", success: "#2f9e44",
      highlight: ["#ffe3e3", "#d0ebff"],
      labelBg: "#fff5f5", boxBg: "#ffffff", boxStroke: "#1a1a1a"
    },
    border: { type: "handdrawn", width: 3, radius: 12, roughness: 2.5, strokeStyle: "solid" },
    decorations: { enabled: true, density: "low", items: ["title-underline", "corner-dot"] },
    effects: { paperShadow: false, markerHighlight: false, doodleUnderline: true, handdrawnCircle: false, watercolorBrush: false, stickerRotate: false },
    sectionGap: 56, chipFg: "#fff"
  },

  // ── 2. 手账涂鸦笔记 ──
  {
    id: "notebook-doodle",
    name: "手账涂鸦",
    description: "笔记本页面 + doodle 装饰，活泼亲切",
    preview: "📓",
    background: { type: "notebook", color: "#fdf6e3", lineColor: "#c8d8e8", lineOpacity: 30, lineGap: 48, showBinding: true, bindingColor: "#e74c3c" },
    typography: { titleFontSize: 52, bodyFontSize: 28, labelFontSize: 26, highlightFontSize: 34, subtitleFontSize: 26, fontFamily: 1 },
    colors: {
      ink: "#2c3e50", primary: "#2c3e50", secondary: "#7f8c8d",
      danger: "#e74c3c", success: "#27ae60",
      highlight: ["#fff9c4", "#bbdefb", "#f8bbd0"],
      labelBg: "#e3f2fd", boxBg: "#fffde7", boxStroke: "#5c6bc0"
    },
    border: { type: "rounded", width: 2, radius: 16, roughness: 2, strokeStyle: "solid" },
    decorations: { enabled: true, density: "high", items: ["bulb", "star", "cloud", "gear", "arrow", "dashed-circle", "sparkle", "pencil"] },
    effects: { paperShadow: true, markerHighlight: true, doodleUnderline: true, handdrawnCircle: true, watercolorBrush: false, stickerRotate: false },
    sectionGap: 50, chipFg: "#fff"
  },

  // ── 3. 可爱便签纸风 ──
  {
    id: "cute-paper-note",
    name: "可爱便签",
    description: "粉蓝黄配色 + 贴纸元素，适合轻松分享",
    preview: "🌸",
    background: { type: "paper", color: "#fef9ef" },
    typography: { titleFontSize: 50, bodyFontSize: 28, labelFontSize: 26, highlightFontSize: 34, subtitleFontSize: 26, fontFamily: 1 },
    colors: {
      ink: "#4a4a4a", primary: "#e91e63", secondary: "#9c27b0",
      danger: "#f44336", success: "#4caf50",
      highlight: ["#fce4ec", "#e8f5e9", "#fff3e0", "#e3f2fd"],
      labelBg: "#fce4ec", boxBg: "#ffffff", boxStroke: "#e91e63"
    },
    border: { type: "paper-card", width: 2, radius: 20, roughness: 1.5, strokeStyle: "solid" },
    decorations: { enabled: true, density: "high", items: ["star", "flower", "smile", "heart", "sparkle", "tape", "sticker"] },
    effects: { paperShadow: true, markerHighlight: true, doodleUnderline: false, handdrawnCircle: false, watercolorBrush: true, stickerRotate: false },
    sectionGap: 48, chipFg: "#fff"
  },

  // ── 4. 横线纸清爽笔记 ──
  {
    id: "lined-paper-clean",
    name: "横线纸笔记",
    description: "大留白横线纸，适合长文字和口播稿",
    preview: "📝",
    background: { type: "lined", color: "#fffff8", lineColor: "#b8c6d4", lineOpacity: 25, lineGap: 44 },
    typography: { titleFontSize: 48, bodyFontSize: 26, labelFontSize: 24, highlightFontSize: 32, subtitleFontSize: 24, fontFamily: 1 },
    colors: {
      ink: "#333333", primary: "#333333", secondary: "#888888",
      danger: "#d32f2f", success: "#388e3c",
      highlight: ["#fff9c4"],
      labelBg: "#f5f5f5", boxBg: "transparent", boxStroke: "#cccccc"
    },
    border: { type: "none", width: 1, radius: 8, roughness: 1, strokeStyle: "solid" },
    decorations: { enabled: true, density: "low", items: ["star", "underline", "circle"] },
    effects: { paperShadow: false, markerHighlight: false, doodleUnderline: true, handdrawnCircle: true, watercolorBrush: false, stickerRotate: false },
    sectionGap: 44, chipFg: "#fff"
  },

  // ── 5. 马克笔重点风 ──
  {
    id: "marker-highlight",
    name: "马克笔重点",
    description: "荧光笔高亮 + 粗字，强结果导向",
    preview: "🖍️",
    background: { type: "plain", color: "#fffef5" },
    typography: { titleFontSize: 58, bodyFontSize: 30, labelFontSize: 28, highlightFontSize: 38, subtitleFontSize: 28, fontFamily: 1 },
    colors: {
      ink: "#1a1a1a", primary: "#1a1a1a", secondary: "#555555",
      danger: "#d32f2f", success: "#2e7d32",
      highlight: ["#fff176", "#f48fb1", "#81d4fa", "#a5d6a7"],
      labelBg: "#fff9c4", boxBg: "#ffffff", boxStroke: "#1a1a1a"
    },
    border: { type: "sketch", width: 3, radius: 12, roughness: 2, strokeStyle: "solid" },
    decorations: { enabled: true, density: "medium", items: ["marker-bar", "underline", "circle", "arrow"] },
    effects: { paperShadow: false, markerHighlight: true, doodleUnderline: true, handdrawnCircle: true, watercolorBrush: false, stickerRotate: false },
    sectionGap: 52, chipFg: "#fff"
  },

  // ── 6. 贴纸拼贴风 ──
  {
    id: "scrapbook-sticker",
    name: "贴纸拼贴",
    description: "便签贴纸 + 胶带，生活化知识分享",
    preview: "🏷️",
    background: { type: "scrapbook", color: "#f5f0e8" },
    typography: { titleFontSize: 52, bodyFontSize: 28, labelFontSize: 26, highlightFontSize: 34, subtitleFontSize: 26, fontFamily: 1 },
    colors: {
      ink: "#3e2723", primary: "#5d4037", secondary: "#8d6e63",
      danger: "#c62828", success: "#33691e",
      highlight: ["#fff9c4", "#ffccbc", "#b3e5fc", "#c8e6c9"],
      labelBg: "#fff8e1", boxBg: "#fffde7", boxStroke: "#8d6e63"
    },
    border: { type: "paper-card", width: 2, radius: 8, roughness: 1.8, strokeStyle: "solid" },
    decorations: { enabled: true, density: "high", items: ["tape", "sticker", "label", "arrow", "pin", "star"] },
    effects: { paperShadow: true, markerHighlight: false, doodleUnderline: false, handdrawnCircle: false, watercolorBrush: false, stickerRotate: true },
    sectionGap: 50, chipFg: "#fff"
  }
];

// ============================================================
//  工具
// ============================================================

export function getPreset(id: string): StylePreset {
  return stylePresets.find((p) => p.id === id) || stylePresets[0];
}
