import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { CardData, CardSection } from "@/lib/mockParser";
import type { CardStyle } from "@/lib/cardStyles";
import { getStyle } from "@/lib/cardStyles";

export type ExcalidrawSceneData = {
  elements: ExcalidrawElement[];
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
  styleId?: string
): Promise<ExcalidrawSceneData> {
  const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
  const S = getStyle(styleId as any);

  const sk: any[] = [];
  const px = 110;
  const cw = size.width - px * 2;
  let y = 120;
  const isHandDrawn = S.roughness >= 2;

  // ---- 手绘风格：整张卡片的涂鸦边框 ----
  if (isHandDrawn) {
    sk.push({
      type: "rectangle",
      x: 40, y: 40,
      width: size.width - 80,
      height: size.height - 80,
      roundness: { type: 3 },
      strokeColor: S.primary,
      backgroundColor: "transparent",
      strokeWidth: S.strokeWidth,
      roughness: S.roughness,
      fillStyle: "hachure"
    });
    // 四角装饰小圆
    const dots = [[55, 55], [size.width - 55, 55], [55, size.height - 55], [size.width - 55, size.height - 55]];
    for (const [dx, dy] of dots) {
      sk.push({
        type: "ellipse",
        x: dx - 10, y: dy - 10,
        width: 20, height: 20,
        strokeColor: S.accent,
        backgroundColor: S.accent,
        strokeWidth: 2,
        roughness: S.roughness,
        fillStyle: "solid"
      });
    }
  }

  // ---- 笔记本横线背景 ----
  if (S.id === "notebook") {
    for (let ly = 200; ly < size.height - 60; ly += 48) {
      sk.push({
        type: "line",
        x: px - 30, y: ly,
        points: [[0, 0], [cw + 60, 0]],
        strokeColor: "#b0c4de",
        strokeWidth: 1,
        roughness: 0.5,
        opacity: 40
      });
    }
    sk.push({
      type: "line",
      x: px - 10, y: 100,
      points: [[0, 0], [0, size.height - 200]],
      strokeColor: "#e8a0a0",
      strokeWidth: 2,
      roughness: 0.5,
      opacity: 50
    });
  }

  // ---- 标题 ----
  sk.push({
    type: "text",
    x: size.width / 2, y,
    text: wrap(card.title, 11),
    fontSize: S.fontSize.title,
    fontFamily: S.fontFamily,
    strokeColor: S.primary,
    textAlign: "center",
    verticalAlign: "middle"
  });
  y += estHeight(card.title, S.fontSize.title, 11) + 24;

  // ---- 装饰线（手绘风格用双线 + 波浪感）----
  const lineW = isHandDrawn ? 450 : 500;
  const lineX = size.width / 2 - lineW / 2;
  sk.push({
    type: "line",
    x: lineX, y,
    points: [[0, 0], [lineW, 8]],
    strokeColor: S.primary,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness
  });
  if (isHandDrawn) {
    // 第二条装饰线，稍微偏移
    sk.push({
      type: "line",
      x: lineX + 20, y: y + 8,
      points: [[0, 0], [lineW - 40, -5]],
      strokeColor: S.accent,
      strokeWidth: S.strokeWidth - 1,
      roughness: S.roughness,
      opacity: 60
    });
  }
  y += isHandDrawn ? 52 : 44;

  // ---- 副标题 ----
  if (card.subtitle) {
    sk.push({
      type: "text",
      x: size.width / 2, y,
      text: wrap(card.subtitle, 18),
      fontSize: S.fontSize.subtitle,
      fontFamily: S.fontFamily,
      strokeColor: S.secondary,
      textAlign: "center",
      verticalAlign: "middle"
    });
    y += estHeight(card.subtitle, S.fontSize.subtitle, 18) + (isHandDrawn ? 80 : 70);
  } else {
    y += isHandDrawn ? 40 : 30;
  }

  // ---- sections ----
  for (let si = 0; si < card.sections.length; si++) {
    const section = card.sections[si];
    const h = renderSection(sk, section, px, cw, y, size.width, S);
    y += h;

    // 手绘风格：section 之间加小装饰线
    if (isHandDrawn && si < card.sections.length - 1 && section.type !== "flow") {
      sk.push({
        type: "line",
        x: size.width / 2 - 30, y: y - S.sectionGap / 2 + 5,
        points: [[0, 0], [60, 3]],
        strokeColor: S.secondary,
        strokeWidth: 1,
        roughness: S.roughness,
        opacity: 35
      });
    }
  }

  const elements = convertToExcalidrawElements(sk, { regenerateIds: true });

  return {
    elements,
    appState: {
      viewBackgroundColor: S.background,
      currentItemFontFamily: S.fontFamily,
      currentItemStrokeColor: S.primary,
      currentItemBackgroundColor: S.boxFill,
      currentItemRoughness: S.roughness,
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
//  Section 渲染分发
// ============================================================

function renderSection(sk: any[], section: CardSection, px: number, cw: number, y: number, canvasW: number, S: CardStyle): number {
  switch (section.type) {
    case "tag":          return renderTag(sk, section, px, cw, y, S);
    case "box":          return renderBox(sk, section, px, cw, y, S);
    case "flow":         return renderFlow(sk, section, px, cw, y, S);
    case "highlight":    return renderHighlight(sk, section, px, cw, y, S);
    case "circle":       return renderCircle(sk, section, px, y, S);
    case "strikethrough": return renderStrikethrough(sk, section, px, cw, y, S);
    case "comparison":   return renderComparison(sk, section, px, cw, y, S);
    case "annotation":   return renderAnnotation(sk, section, px, cw, y, S);
    default:             return 0;
  }
}

// ============================================================
//  各类型渲染器
// ============================================================

function renderTag(sk: any[], s: { label: string; text: string }, px: number, cw: number, y: number, S: CardStyle) {
  const labelW = 180;
  const gap = 30;
  const boxW = cw - labelW - gap;
  const wrapped = wrap(s.text, 14);
  const boxH = Math.max(120, estHeight(s.text, S.fontSize.body, 14) + 42);

  sk.push({
    type: "rectangle",
    x: px, y: y + 20,
    width: labelW, height: 72,
    roundness: { type: 3 },
    strokeColor: S.accent,
    backgroundColor: S.labelFill,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness,
    fillStyle: S.fillStyle,
    label: {
      text: wrap(s.label, 5),
      fontSize: S.fontSize.label,
      fontFamily: S.fontFamily,
      textAlign: "center", verticalAlign: "middle",
      strokeColor: S.accent
    }
  });

  sk.push({
    type: "rectangle",
    x: px + labelW + gap, y,
    width: boxW, height: boxH,
    roundness: { type: 3 },
    strokeColor: S.primary,
    backgroundColor: S.boxFill,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness,
    fillStyle: S.fillStyle,
    label: {
      text: wrapped,
      fontSize: S.fontSize.body,
      fontFamily: S.fontFamily,
      textAlign: "left", verticalAlign: "middle",
      strokeColor: S.textOnLight
    }
  });

  return boxH + S.sectionGap;
}

function renderBox(sk: any[], s: { text: string }, px: number, cw: number, y: number, S: CardStyle) {
  const wrapped = wrap(s.text, 18);
  const h = Math.max(140, estHeight(s.text, S.fontSize.body, 18) + 54);

  sk.push({
    type: "rectangle",
    x: px, y,
    width: cw, height: h,
    roundness: { type: 3 },
    strokeColor: S.primary,
    backgroundColor: S.boxFill,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness,
    fillStyle: S.fillStyle,
    label: {
      text: wrapped,
      fontSize: S.fontSize.body,
      fontFamily: S.fontFamily,
      textAlign: "left", verticalAlign: "middle",
      strokeColor: S.textOnLight
    }
  });

  return h + S.sectionGap - 8;
}

function renderFlow(sk: any[], s: { items: string[] }, px: number, cw: number, y: number, S: CardStyle) {
  const n = Math.max(s.items.length, 1);
  const gap = 24;
  const itemW = (cw - gap * (n - 1)) / n;
  let maxH = 0;
  let lx = px;

  s.items.forEach((item, i) => {
    const wrapped = wrap(item, 6);
    const h = Math.max(110, estHeight(item, S.fontSize.label, 6) + 38);
    maxH = Math.max(maxH, h);

    sk.push({
      id: `flow-${i}-${item}`,
      type: "rectangle",
      x: lx, y,
      width: itemW, height: h,
      roundness: { type: 3 },
      strokeColor: S.primary,
      backgroundColor: S.boxFill,
      strokeWidth: S.strokeWidth,
      roughness: S.roughness,
      fillStyle: S.fillStyle,
      label: {
        text: wrapped,
        fontSize: S.fontSize.label,
        fontFamily: S.fontFamily,
        textAlign: "center", verticalAlign: "middle",
        strokeColor: S.textOnLight
      }
    });

    if (i < n - 1) {
      sk.push({
        type: "arrow",
        x: lx + itemW, y: y + maxH / 2,
        points: [[0, 0], [gap, 0]],
        strokeColor: S.accent,
        strokeWidth: S.strokeWidth,
        roughness: S.roughness,
        endArrowhead: "triangle"
      });
    }

    lx += itemW + gap;
  });

  return maxH + S.sectionGap;
}

function renderHighlight(sk: any[], s: { text: string }, px: number, cw: number, y: number, S: CardStyle) {
  const wrapped = wrap(s.text, 16);
  const h = estHeight(s.text, S.fontSize.highlight, 16);

  sk.push({
    type: "text",
    x: px, y,
    text: wrapped,
    fontSize: S.fontSize.highlight,
    fontFamily: S.fontFamily,
    strokeColor: S.accent,
    textAlign: "left", verticalAlign: "middle"
  });

  // 强调下划线
  sk.push({
    type: "line",
    x: px, y: y + h + 10,
    points: [[0, 0], [cw * 0.86, 10]],
    strokeColor: S.accent,
    strokeWidth: S.strokeWidth + 1,
    roughness: S.roughness + 0.3
  });

  return h + 62;
}

function renderCircle(sk: any[], s: { text: string }, px: number, y: number, S: CardStyle) {
  const size = 72;

  sk.push({
    type: "ellipse",
    x: px, y,
    width: size, height: size,
    strokeColor: S.accent,
    backgroundColor: S.labelFill,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness,
    fillStyle: S.fillStyle,
    label: {
      text: s.text,
      fontSize: S.fontSize.subtitle,
      fontFamily: S.fontFamily,
      textAlign: "center", verticalAlign: "middle",
      strokeColor: S.accent
    }
  });

  return size + 20;
}

function renderStrikethrough(sk: any[], s: { text: string }, px: number, cw: number, y: number, S: CardStyle) {
  const wrapped = wrap(s.text, 18);
  const h = estHeight(s.text, S.fontSize.body, 18);

  sk.push({
    type: "text",
    x: px, y,
    text: wrapped,
    fontSize: S.fontSize.body,
    fontFamily: S.fontFamily,
    strokeColor: S.secondary,
    textAlign: "left", verticalAlign: "middle"
  });

  sk.push({
    type: "line",
    x: px - 8, y: y + h / 2,
    points: [[0, 0], [cw + 16, -4]],
    strokeColor: S.accent,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness + 0.2
  });

  return h + 48;
}

function renderComparison(
  sk: any[],
  s: { left: { label: string; text: string }; right: { label: string; text: string } },
  px: number, cw: number, y: number, S: CardStyle
) {
  const gap = 20;
  const halfW = (cw - gap) / 2;
  const fs = S.fontSize.label;
  const leftH = Math.max(140, estHeight(s.left.text, fs, 9) + 60);
  const rightH = Math.max(140, estHeight(s.right.text, fs, 9) + 60);
  const boxH = Math.max(leftH, rightH);

  sk.push({
    type: "rectangle",
    x: px, y,
    width: halfW, height: boxH,
    roundness: { type: 3 },
    strokeColor: S.accent,
    backgroundColor: S.labelFill,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness,
    fillStyle: S.fillStyle,
    label: {
      text: `${s.left.label}\n${wrap(s.left.text, 9)}`,
      fontSize: fs, fontFamily: S.fontFamily,
      textAlign: "center", verticalAlign: "middle",
      strokeColor: S.accent
    }
  });

  sk.push({
    type: "rectangle",
    x: px + halfW + gap, y,
    width: halfW, height: boxH,
    roundness: { type: 3 },
    strokeColor: S.primary,
    backgroundColor: S.boxFill,
    strokeWidth: S.strokeWidth,
    roughness: S.roughness,
    fillStyle: S.fillStyle,
    label: {
      text: `${s.right.label}\n${wrap(s.right.text, 9)}`,
      fontSize: fs, fontFamily: S.fontFamily,
      textAlign: "center", verticalAlign: "middle",
      strokeColor: S.textOnLight
    }
  });

  return boxH + S.sectionGap - 8;
}

function renderAnnotation(sk: any[], s: { text: string }, px: number, cw: number, y: number, S: CardStyle) {
  const wrapped = wrap(s.text, 20);
  const fs = S.fontSize.label;
  const h = estHeight(s.text, fs, 20);

  sk.push({
    type: "arrow",
    x: px + cw - 10, y: y + h / 2,
    points: [[0, 0], [60, -h / 2 - 10]],
    strokeColor: S.accent,
    strokeWidth: 2, roughness: S.roughness,
    endArrowhead: "arrow"
  });

  sk.push({
    type: "text",
    x: px, y,
    text: `💡 ${wrapped}`,
    fontSize: fs,
    fontFamily: S.fontFamily,
    strokeColor: S.secondary,
    textAlign: "left", verticalAlign: "middle"
  });

  return h + 40;
}

// ============================================================
//  工具函数
// ============================================================

function wrap(text: string, maxPerLine: number): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, "");
  const lines: string[] = [];
  let cur = "";
  for (const ch of clean) {
    cur += ch;
    if (cur.length >= maxPerLine) { lines.push(cur); cur = ""; }
  }
  if (cur) lines.push(cur);
  return lines.join("\n");
}

function estHeight(text: string, fontSize: number, maxPerLine: number): number {
  const n = Math.max(1, Math.ceil(text.replace(/\s+/g, "").length / maxPerLine));
  return n * (fontSize * 1.45);
}
