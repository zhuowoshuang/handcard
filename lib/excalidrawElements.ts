/**
 * excalidrawElements.ts
 * 根据 CardData + StylePreset 生成 Excalidraw 元素。
 * 包含背景层、装饰层、内容层。
 */

import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { CardData, CardSection } from "@/lib/mockParser";
import { getPreset, presetToCardStyle, type StylePreset } from "@/lib/stylePresets";
import { generateDecorations, highlightKeywords } from "@/lib/decorations";

export type ExcalidrawSceneData = {
  elements: any[];
  appState: Partial<AppState>;
  files?: BinaryFiles;
};

type SceneSize = { width: number; height: number };

// ============================================================
//  主入口
// ============================================================

export async function buildExcalidrawScene(
  card: CardData,
  size: SceneSize,
  presetId?: string
): Promise<ExcalidrawSceneData> {
  const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
  const preset = getPreset(presetId || "classic-handdrawn");
  const sk: any[] = [];
  const px = 110;
  const cw = size.width - px * 2;

  // ── 1) 背景层 + 装饰层 ──
  sk.push(...generateDecorations(preset, size.width, size.height, hashStr(card.title)));

  // ── 2) 内容层 ──
  let y = 120;

  // 标题
  y = renderTitle(sk, card.title, size.width, y, preset);

  // 副标题
  if (card.subtitle) {
    y = renderSubtitle(sk, card.subtitle, size.width, y, preset);
  } else {
    y += preset.effects.handdrawnCircle ? 30 : 20;
  }

  // sections
  for (let i = 0; i < card.sections.length; i++) {
    const section = card.sections[i];
    const h = renderSection(sk, section, px, cw, y, size.width, preset, i);
    y += h;
  }

  const elements = convertToExcalidrawElements(sk, { regenerateIds: true });

  return {
    elements,
    appState: {
      viewBackgroundColor: preset.background.color,
      currentItemFontFamily: preset.typography.fontFamily,
      currentItemStrokeColor: preset.colors.primary,
      currentItemBackgroundColor: preset.colors.boxBg,
      currentItemRoughness: preset.border.roughness,
      currentItemRoundness: "round",
      exportBackground: true,
      exportWithDarkMode: false,
      exportEmbedScene: false,
      zoom: { value: 0.36 as any },
      scrollX: 0,
      scrollY: 0
    }
  };
}

// ============================================================
//  标题
// ============================================================

function renderTitle(sk: any[], title: string, w: number, y: number, p: StylePreset): number {
  const fs = p.typography.titleFontSize;
  const wrapped = wrap(title, 11);
  const h = estHeight(title, fs, 11);

  // 标题文字
  sk.push({
    type: "text", x: w / 2, y,
    text: wrapped,
    fontSize: fs, fontFamily: p.typography.fontFamily,
    strokeColor: p.colors.primary,
    textAlign: "center", verticalAlign: "middle"
  });

  y += h + 20;

  // 标题下方装饰线
  if (p.effects.doodleUnderline) {
    const lineW = 400;
    sk.push({
      type: "line", x: w / 2 - lineW / 2, y,
      points: [[0, 0], [lineW, 8]],
      strokeColor: p.colors.primary,
      strokeWidth: p.border.width,
      roughness: p.border.roughness + 0.3
    });
    // 第二条装饰线（彩色）
    if (p.decorations.density !== "low") {
      sk.push({
        type: "line", x: w / 2 - lineW / 2 + 20, y: y + 10,
        points: [[0, 0], [lineW - 40, -5]],
        strokeColor: p.colors.danger,
        strokeWidth: p.border.width - 1,
        roughness: p.border.roughness + 0.3,
        opacity: 50
      });
    }
    y += 30;
  }

  // 马克笔风格：标题下方大块高亮
  if (p.effects.markerHighlight && p.colors.highlight.length > 0) {
    sk.push({
      type: "rectangle",
      x: w / 2 - 220, y: y - h - 30,
      width: 440, height: h + 20,
      strokeColor: "transparent",
      backgroundColor: p.colors.highlight[0],
      fillStyle: "solid", strokeWidth: 0, roughness: 1,
      opacity: 35, roundness: { type: 3 },
      groupIds: []
    });
  }

  return y + 30;
}

// ============================================================
//  副标题
// ============================================================

function renderSubtitle(sk: any[], text: string, w: number, y: number, p: StylePreset): number {
  const fs = p.typography.subtitleFontSize;
  sk.push({
    type: "text", x: w / 2, y,
    text: wrap(text, 18),
    fontSize: fs, fontFamily: p.typography.fontFamily,
    strokeColor: p.colors.secondary,
    textAlign: "center", verticalAlign: "middle"
  });
  return y + estHeight(text, fs, 18) + (p.effects.handdrawnCircle ? 70 : 50);
}

// ============================================================
//  Section 渲染
// ============================================================

function renderSection(sk: any[], s: CardSection, px: number, cw: number, y: number, w: number, p: StylePreset, idx: number): number {
  switch (s.type) {
    case "tag": return renderTag(sk, s, px, cw, y, p);
    case "box": return renderBox(sk, s, px, cw, y, p, idx);
    case "flow": return renderFlow(sk, s, px, cw, y, p);
    case "highlight": return renderHighlight(sk, s, px, cw, y, p);
    case "circle": return renderCircle(sk, s, px, y, p);
    case "strikethrough": return renderStrikethrough(sk, s, px, cw, y, p);
    case "comparison": return renderComparison(sk, s, px, cw, y, p);
    case "annotation": return renderAnnotation(sk, s, px, cw, y, p);
    default: return 0;
  }
}

function renderTag(sk: any[], s: { label: string; text: string }, px: number, cw: number, y: number, p: StylePreset) {
  const lw = 180, gap = 24, bw = cw - lw - gap;
  const wrapped = wrap(s.text, 14);
  const bh = Math.max(110, estHeight(s.text, p.typography.bodyFontSize, 14) + 42);
  const rot = p.effects.stickerRotate ? randAngle(y) : 0;

  // 标签框
  sk.push({
    type: "rectangle", x: px, y: y + 16,
    width: lw, height: 68,
    roundness: { type: 3 },
    strokeColor: p.colors.danger,
    backgroundColor: p.colors.labelBg,
    strokeWidth: p.border.width, roughness: p.border.roughness,
    fillStyle: "hachure",
    label: { text: wrap(s.label, 5), fontSize: p.typography.labelFontSize, fontFamily: p.typography.fontFamily, textAlign: "center", verticalAlign: "middle", strokeColor: p.colors.danger }
  });

  // 内容框
  sk.push({
    type: "rectangle", x: px + lw + gap, y,
    width: bw, height: bh,
    roundness: { type: 3 },
    strokeColor: p.colors.boxStroke,
    backgroundColor: p.colors.boxBg,
    strokeWidth: p.border.width, roughness: p.border.roughness,
    fillStyle: p.border.type === "paper-card" ? "solid" : "hachure",
    angle: rot,
    label: { text: wrapped, fontSize: p.typography.bodyFontSize, fontFamily: p.typography.fontFamily, textAlign: "left", verticalAlign: "middle", strokeColor: p.colors.ink }
  });

  return bh + p.sectionGap;
}

function renderBox(sk: any[], s: { text: string }, px: number, cw: number, y: number, p: StylePreset, idx: number) {
  const wrapped = wrap(s.text, 18);
  const h = Math.max(130, estHeight(s.text, p.typography.bodyFontSize, 18) + 54);
  const rot = p.effects.stickerRotate ? randAngle(idx * 17) : 0;

  sk.push({
    type: "rectangle", x: px, y,
    width: cw, height: h,
    roundness: { type: 3 },
    strokeColor: p.colors.boxStroke,
    backgroundColor: p.colors.boxBg,
    strokeWidth: p.border.width, roughness: p.border.roughness,
    fillStyle: p.border.type === "paper-card" ? "solid" : "hachure",
    angle: rot,
    label: { text: wrapped, fontSize: p.typography.bodyFontSize, fontFamily: p.typography.fontFamily, textAlign: "left", verticalAlign: "middle", strokeColor: p.colors.ink }
  });

  // marker-highlight：关键词高亮
  if (p.effects.markerHighlight) {
    const { keywords } = highlightKeywords(s.text);
    if (keywords.length > 0) {
      sk.push({
        type: "rectangle",
        x: px + 10, y: y + h / 2 - 14,
        width: Math.min(cw - 20, keywords.join("").length * p.typography.bodyFontSize * 0.6 + 40),
        height: 28,
        strokeColor: "transparent",
        backgroundColor: p.colors.highlight[idx % p.colors.highlight.length],
        fillStyle: "solid", strokeWidth: 0, roughness: 1,
        opacity: 40, roundness: { type: 3 },
        groupIds: []
      });
    }
  }

  return h + p.sectionGap - 8;
}

function renderFlow(sk: any[], s: { items: string[] }, px: number, cw: number, y: number, p: StylePreset) {
  const n = Math.max(s.items.length, 1);
  const gap = 20;
  const iw = (cw - gap * (n - 1)) / n;
  let maxH = 0;
  let lx = px;

  s.items.forEach((item, i) => {
    const wrapped = wrap(item, 6);
    const h = Math.max(100, estHeight(item, p.typography.labelFontSize, 6) + 36);
    maxH = Math.max(maxH, h);

    sk.push({
      type: "rectangle", x: lx, y,
      width: iw, height: h,
      roundness: { type: 3 },
      strokeColor: p.colors.boxStroke,
      backgroundColor: p.colors.boxBg,
      strokeWidth: p.border.width, roughness: p.border.roughness,
      fillStyle: "hachure",
      label: { text: wrapped, fontSize: p.typography.labelFontSize, fontFamily: p.typography.fontFamily, textAlign: "center", verticalAlign: "middle", strokeColor: p.colors.ink }
    });

    if (i < n - 1) {
      sk.push({
        type: "arrow", x: lx + iw, y: y + maxH / 2,
        points: [[0, 0], [gap, 0]],
        strokeColor: p.colors.primary,
        strokeWidth: p.border.width, roughness: p.border.roughness + 0.2,
        endArrowhead: "arrow"
      });
    }
    lx += iw + gap;
  });

  return maxH + p.sectionGap;
}

function renderHighlight(sk: any[], s: { text: string }, px: number, cw: number, y: number, p: StylePreset) {
  const wrapped = wrap(s.text, 16);
  const fs = p.typography.highlightFontSize;
  const h = estHeight(s.text, fs, 16);

  // 荧光笔背景
  if (p.effects.markerHighlight) {
    sk.push({
      type: "rectangle",
      x: px - 8, y: y - 8,
      width: Math.min(cw + 16, s.text.length * fs * 0.55 + 40),
      height: h + 16,
      strokeColor: "transparent",
      backgroundColor: p.colors.highlight[0],
      fillStyle: "solid", strokeWidth: 0, roughness: 1,
      opacity: 40, roundness: { type: 3 },
      groupIds: []
    });
  }

  // 文字
  sk.push({
    type: "text", x: px, y,
    text: wrapped,
    fontSize: fs, fontFamily: p.typography.fontFamily,
    strokeColor: p.colors.danger,
    textAlign: "left", verticalAlign: "middle"
  });

  // 下划线
  if (p.effects.doodleUnderline) {
    sk.push({
      type: "line", x: px, y: y + h + 8,
      points: [[0, 0], [cw * 0.8, 8]],
      strokeColor: p.colors.danger,
      strokeWidth: p.border.width + 1,
      roughness: p.border.roughness + 0.3
    });
  }

  // 手绘圈选
  if (p.effects.handdrawnCircle) {
    sk.push({
      type: "ellipse",
      x: px - 12, y: y - 12,
      width: Math.min(cw + 24, s.text.length * fs * 0.55 + 50),
      height: h + 24,
      strokeColor: p.colors.danger,
      backgroundColor: "transparent",
      fillStyle: "hachure", strokeWidth: 2.5, roughness: 2.8,
      opacity: 60, groupIds: []
    });
  }

  return h + 62;
}

function renderCircle(sk: any[], s: { text: string }, px: number, y: number, p: StylePreset) {
  const size = 68;
  sk.push({
    type: "ellipse", x: px, y,
    width: size, height: size,
    strokeColor: p.colors.danger,
    backgroundColor: p.colors.labelBg,
    strokeWidth: p.border.width, roughness: p.border.roughness,
    fillStyle: "hachure",
    label: { text: s.text, fontSize: p.typography.subtitleFontSize, fontFamily: p.typography.fontFamily, textAlign: "center", verticalAlign: "middle", strokeColor: p.colors.danger }
  });
  return size + 20;
}

function renderStrikethrough(sk: any[], s: { text: string }, px: number, cw: number, y: number, p: StylePreset) {
  const wrapped = wrap(s.text, 18);
  const h = estHeight(s.text, p.typography.bodyFontSize, 18);

  sk.push({
    type: "text", x: px, y,
    text: wrapped,
    fontSize: p.typography.bodyFontSize, fontFamily: p.typography.fontFamily,
    strokeColor: p.colors.secondary,
    textAlign: "left", verticalAlign: "middle"
  });

  sk.push({
    type: "line", x: px - 8, y: y + h / 2,
    points: [[0, 0], [cw + 16, -4]],
    strokeColor: p.colors.danger,
    strokeWidth: p.border.width, roughness: p.border.roughness + 0.2
  });

  return h + 48;
}

function renderComparison(sk: any[], s: { left: { label: string; text: string }; right: { label: string; text: string } }, px: number, cw: number, y: number, p: StylePreset) {
  const gap = 16;
  const hw = (cw - gap) / 2;
  const fs = p.typography.labelFontSize;
  const lh = Math.max(130, estHeight(s.left.text, fs, 9) + 56);
  const rh = Math.max(130, estHeight(s.right.text, fs, 9) + 56);
  const bh = Math.max(lh, rh);

  sk.push({
    type: "rectangle", x: px, y,
    width: hw, height: bh,
    roundness: { type: 3 },
    strokeColor: p.colors.danger,
    backgroundColor: p.colors.labelBg,
    strokeWidth: p.border.width, roughness: p.border.roughness,
    fillStyle: "hachure",
    label: { text: `${s.left.label}\n${wrap(s.left.text, 9)}`, fontSize: fs, fontFamily: p.typography.fontFamily, textAlign: "center", verticalAlign: "middle", strokeColor: p.colors.danger }
  });

  sk.push({
    type: "rectangle", x: px + hw + gap, y,
    width: hw, height: bh,
    roundness: { type: 3 },
    strokeColor: p.colors.boxStroke,
    backgroundColor: p.colors.boxBg,
    strokeWidth: p.border.width, roughness: p.border.roughness,
    fillStyle: "hachure",
    label: { text: `${s.right.label}\n${wrap(s.right.text, 9)}`, fontSize: fs, fontFamily: p.typography.fontFamily, textAlign: "center", verticalAlign: "middle", strokeColor: p.colors.ink }
  });

  return bh + p.sectionGap - 8;
}

function renderAnnotation(sk: any[], s: { text: string }, px: number, cw: number, y: number, p: StylePreset) {
  const wrapped = wrap(s.text, 20);
  const fs = p.typography.labelFontSize;
  const h = estHeight(s.text, fs, 20);

  sk.push({
    type: "arrow", x: px + cw - 10, y: y + h / 2,
    points: [[0, 0], [50, -h / 2 - 10]],
    strokeColor: p.colors.danger, strokeWidth: 2, roughness: p.border.roughness,
    endArrowhead: "arrow"
  });

  sk.push({
    type: "text", x: px, y,
    text: `💡 ${wrapped}`,
    fontSize: fs, fontFamily: p.typography.fontFamily,
    strokeColor: p.colors.secondary,
    textAlign: "left", verticalAlign: "middle"
  });

  return h + 40;
}

// ============================================================
//  工具
// ============================================================

function wrap(text: string, max: number): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, "");
  const lines: string[] = [];
  let cur = "";
  for (const ch of clean) { cur += ch; if (cur.length >= max) { lines.push(cur); cur = ""; } }
  if (cur) lines.push(cur);
  return lines.join("\n");
}

function estHeight(text: string, fs: number, max: number): number {
  return Math.max(1, Math.ceil(text.replace(/\s+/g, "").length / max)) * (fs * 1.45);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function randAngle(seed: number): number {
  return (((seed * 7 + 13) % 5) - 2) * (Math.PI / 180); // -2° 到 +2°
}
