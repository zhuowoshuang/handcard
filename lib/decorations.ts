/**
 * decorations.ts
 * 为每种风格生成装饰性 Excalidraw 元素（背景、doodle、高亮等）。
 * 所有元素通过 Excalidraw 渲染，PNG 导出自然包含。
 */

import type { StylePreset } from "./stylePresets";

// ============================================================
//  确定性随机数
// ============================================================

class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return this.seed / 2147483647;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length)];
  }
}

// ============================================================
//  生成入口
// ============================================================

export function generateDecorations(
  preset: StylePreset,
  canvasW: number,
  canvasH: number,
  seed: number
): any[] {
  const rng = new SeededRandom(seed);
  const els: any[] = [];

  // 1) 背景层
  els.push(...generateBackground(preset, canvasW, canvasH, rng));

  // 2) 装饰层
  if (preset.decorations.enabled) {
    els.push(...generateDoodles(preset, canvasW, canvasH, rng));
  }

  return els;
}

// ============================================================
//  背景
// ============================================================

function generateBackground(p: StylePreset, w: number, h: number, rng: SeededRandom): any[] {
  const els: any[] = [];
  const bg = p.background;

  // 纸张底色（同时作为导出边界锚点，strokeColor 不能是 transparent）
  els.push({
    type: "rectangle",
    x: 0, y: 0, width: w, height: h,
    strokeColor: bg.color,
    backgroundColor: bg.color,
    fillStyle: "solid",
    strokeWidth: 1, roughness: 0, opacity: 100,
    roundness: null, groupIds: [], seed: rng.int(1, 999999)
  });

  // 横线（notebook / lined）
  if (bg.type === "notebook" || bg.type === "lined") {
    const gap = bg.lineGap || 44;
    const lineColor = bg.lineColor || "#c8d8e8";
    const opacity = bg.lineOpacity || 25;
    for (let ly = gap + 80; ly < h - 40; ly += gap) {
      els.push({
        type: "line",
        x: 60, y: ly,
        points: [[0, 0], [w - 120, 0]],
        strokeColor: lineColor,
        strokeWidth: 1,
        roughness: 0.3,
        opacity,
        groupIds: [], seed: rng.int(1, 999999)
      });
    }
  }

  // 装订线（notebook）
  if (bg.showBinding && bg.bindingColor) {
    // 左侧竖线
    els.push({
      type: "line",
      x: 80, y: 60,
      points: [[0, 0], [0, h - 120]],
      strokeColor: bg.bindingColor,
      strokeWidth: 2.5,
      roughness: 0.5,
      opacity: 60,
      groupIds: [], seed: rng.int(1, 999999)
    });
    // 装订孔
    for (let py = 140; py < h - 100; py += 200) {
      els.push({
        type: "ellipse",
        x: 70, y: py,
        width: 20, height: 20,
        strokeColor: bg.bindingColor,
        backgroundColor: p.background.color,
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 1.5,
        opacity: 50,
        groupIds: [], seed: rng.int(1, 999999)
      });
    }
  }

  return els;
}

// ============================================================
//  Doodle 装饰
// ============================================================

function generateDoodles(p: StylePreset, w: number, h: number, rng: SeededRandom): any[] {
  const els: any[] = [];
  const items = p.decorations.items;
  const density = p.decorations.density;
  const count = density === "high" ? 12 : density === "medium" ? 7 : 3;

  // 四角区域 + 标题附近区域
  const zones = [
    { x1: 20, y1: 20, x2: 90, y2: 100 },          // 左上（内容区 px=110 之外）
    { x1: w - 90, y1: 20, x2: w - 20, y2: 100 },   // 右上
    { x1: 20, y1: h - 120, x2: 90, y2: h - 20 },   // 左下
    { x1: w - 90, y1: h - 120, x2: w - 20, y2: h - 20 }, // 右下
    { x1: w / 2 - 180, y1: 15, x2: w / 2 + 180, y2: 80 }, // 标题上方
    { x1: 15, y1: 200, x2: 80, y2: h - 200 },      // 左侧边栏（< px=110）
    { x1: w - 80, y1: 200, x2: w - 15, y2: h - 200 }, // 右侧边栏
  ];

  for (let i = 0; i < count; i++) {
    const zone = zones[i % zones.length];
    const cx = rng.range(zone.x1, zone.x2);
    const cy = rng.range(zone.y1, zone.y2);
    const item = items[i % items.length];
    const deco = createDoodleItem(item, cx, cy, p, rng);
    if (deco) {
      if (Array.isArray(deco)) els.push(...deco);
      else els.push(deco);
    }
  }

  return els;
}

function createDoodleItem(type: string, cx: number, cy: number, p: StylePreset, rng: SeededRandom): any | any[] | null {
  const sc = rng.range(0.7, 1.2); // 随机缩放
  const rot = rng.range(-15, 15);  // 随机旋转角度（度）
  const col = rng.pick([p.colors.primary, p.colors.secondary, p.colors.danger]);
  const seed = rng.int(1, 999999);

  switch (type) {
    case "star":
    case "sparkle":
      return makeStar(cx, cy, 18 * sc, col, seed);

    case "bulb":
      return makeBulb(cx, cy, 20 * sc, col, seed);

    case "cloud":
      return makeCloud(cx, cy, 30 * sc, col, seed);

    case "gear":
      return makeGear(cx, cy, 18 * sc, col, seed);

    case "arrow":
      return makeArrowDeco(cx, cy, 50 * sc, col, rot, seed);

    case "dashed-circle":
      return makeDashedCircle(cx, cy, 22 * sc, col, seed);

    case "pencil":
      return makePencil(cx, cy, 24 * sc, col, rot, seed);

    case "flower":
      return makeFlower(cx, cy, 16 * sc, col, seed);

    case "smile":
      return makeSmiley(cx, cy, 16 * sc, col, seed);

    case "heart":
      return makeHeart(cx, cy, 14 * sc, col, seed);

    case "tape":
      return makeTape(cx, cy, 60 * sc, col, rot, seed);

    case "sticker":
      return makeSticker(cx, cy, 40 * sc, rng.pick(p.colors.highlight), seed);

    case "label":
      return makeLabelTag(cx, cy, 35 * sc, col, seed);

    case "pin":
      return makePin(cx, cy, 14 * sc, col, seed);

    case "marker-bar":
      return makeMarkerBar(cx, cy, 80 * sc, rng.pick(p.colors.highlight), rot, seed);

    case "underline":
      return makeDoodleUnderline(cx, cy, 60 * sc, col, seed);

    case "circle":
      return makeDoodleCircle(cx, cy, 20 * sc, col, seed);

    case "title-underline":
      return makeTitleUnderline(cx, cy, 200 * sc, p.colors.danger, seed);

    case "corner-dot":
      return makeCornerDot(cx, cy, 6 * sc, p.colors.danger, seed);

    default:
      return null;
  }
}

// ============================================================
//  Doodle 图标工厂（纯 Excalidraw 元素）
// ============================================================

function makeStar(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  // 用 4 条线画一个四角星
  const pts: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    pts.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  pts.push(pts[0]); // 闭合
  return [{
    type: "line", x: cx, y: cy,
    points: pts,
    strokeColor: color, strokeWidth: 2, roughness: 2,
    opacity: 60, groupIds: [], seed
  }];
}

function makeBulb(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  return [
    // 灯泡圆形
    { type: "ellipse", x: cx - r, y: cy - r * 1.2, width: r * 2, height: r * 2, strokeColor: color, backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 2, roughness: 2, opacity: 50, groupIds: [], seed },
    // 底座
    { type: "line", x: cx - r * 0.4, y: cy + r * 0.8, points: [[0, 0], [r * 0.8, 0], [r * 0.6, r * 0.5], [r * 0.2, r * 0.5], [0, 0]], strokeColor: color, strokeWidth: 2, roughness: 2, opacity: 50, groupIds: [], seed: seed + 1 },
    // 光线
    { type: "line", x: cx, y: cy - r * 1.6, points: [[0, 0], [0, -r * 0.5]], strokeColor: color, strokeWidth: 1.5, roughness: 2, opacity: 40, groupIds: [], seed: seed + 2 },
    { type: "line", x: cx + r * 0.8, y: cy - r * 0.8, points: [[0, 0], [r * 0.4, -r * 0.3]], strokeColor: color, strokeWidth: 1.5, roughness: 2, opacity: 40, groupIds: [], seed: seed + 3 },
    { type: "line", x: cx - r * 0.8, y: cy - r * 0.8, points: [[0, 0], [-r * 0.4, -r * 0.3]], strokeColor: color, strokeWidth: 1.5, roughness: 2, opacity: 40, groupIds: [], seed: seed + 4 },
  ];
}

function makeCloud(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  return [
    { type: "ellipse", x: cx - r, y: cy - r * 0.4, width: r * 1.2, height: r * 0.8, strokeColor: color, backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 1.5, roughness: 2.5, opacity: 40, roundness: { type: 3 }, groupIds: [], seed },
    { type: "ellipse", x: cx - r * 0.3, y: cy - r * 0.8, width: r * 1.0, height: r * 0.9, strokeColor: color, backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 1.5, roughness: 2.5, opacity: 40, roundness: { type: 3 }, groupIds: [], seed: seed + 1 },
    { type: "ellipse", x: cx + r * 0.2, y: cy - r * 0.3, width: r * 1.1, height: r * 0.7, strokeColor: color, backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 1.5, roughness: 2.5, opacity: 40, roundness: { type: 3 }, groupIds: [], seed: seed + 2 },
  ];
}

function makeGear(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  const els: any[] = [];
  // 外圈
  els.push({ type: "ellipse", x: cx - r, y: cy - r, width: r * 2, height: r * 2, strokeColor: color, backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 2, roughness: 2, opacity: 45, groupIds: [], seed });
  // 内圈
  els.push({ type: "ellipse", x: cx - r * 0.4, y: cy - r * 0.4, width: r * 0.8, height: r * 0.8, strokeColor: color, backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 1.5, roughness: 2, opacity: 45, groupIds: [], seed: seed + 1 });
  // 齿
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    els.push({
      type: "line",
      x: cx + Math.cos(a) * r * 0.8, y: cy + Math.sin(a) * r * 0.8,
      points: [[0, 0], [Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5]],
      strokeColor: color, strokeWidth: 3, roughness: 2, opacity: 45, groupIds: [], seed: seed + 2 + i
    });
  }
  return els;
}

function makeArrowDeco(cx: number, cy: number, len: number, color: string, rot: number, seed: number): any {
  const rad = (rot * Math.PI) / 180;
  const dx = Math.cos(rad) * len;
  const dy = Math.sin(rad) * len;
  return {
    type: "arrow", x: cx, y: cy,
    points: [[0, 0], [dx, dy]],
    strokeColor: color, strokeWidth: 2, roughness: 2.2,
    endArrowhead: "arrow", opacity: 50, groupIds: [], seed
  };
}

function makeDashedCircle(cx: number, cy: number, r: number, color: string, seed: number): any {
  return {
    type: "ellipse", x: cx - r, y: cy - r, width: r * 2, height: r * 2,
    strokeColor: color, backgroundColor: "transparent",
    fillStyle: "hachure", strokeWidth: 2, roughness: 2.5,
    strokeStyle: "dashed", opacity: 45, groupIds: [], seed
  };
}

function makePencil(cx: number, cy: number, len: number, color: string, rot: number, seed: number): any[] {
  const rad = (rot * Math.PI) / 180;
  const dx = Math.cos(rad) * len;
  const dy = Math.sin(rad) * len;
  return [
    { type: "line", x: cx, y: cy, points: [[0, 0], [dx, dy]], strokeColor: color, strokeWidth: 3, roughness: 2, opacity: 50, groupIds: [], seed },
    { type: "line", x: cx + dx, y: cy + dy, points: [[0, 0], [Math.cos(rad + 0.5) * 6, Math.sin(rad + 0.5) * 6]], strokeColor: color, strokeWidth: 2, roughness: 2, opacity: 50, groupIds: [], seed: seed + 1 },
  ];
}

function makeFlower(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  const els: any[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    els.push({
      type: "ellipse",
      x: cx + Math.cos(a) * r * 0.6 - r * 0.3,
      y: cy + Math.sin(a) * r * 0.6 - r * 0.3,
      width: r * 0.6, height: r * 0.6,
      strokeColor: color, backgroundColor: "transparent",
      fillStyle: "hachure", strokeWidth: 1.5, roughness: 2,
      opacity: 40, groupIds: [], seed: seed + i
    });
  }
  // 花心
  els.push({
    type: "ellipse", x: cx - r * 0.2, y: cy - r * 0.2, width: r * 0.4, height: r * 0.4,
    strokeColor: color, backgroundColor: color,
    fillStyle: "solid", strokeWidth: 1, roughness: 2, opacity: 35, groupIds: [], seed: seed + 10
  });
  return els;
}

function makeSmiley(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  return [
    // 脸
    { type: "ellipse", x: cx - r, y: cy - r, width: r * 2, height: r * 2, strokeColor: color, backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 2, roughness: 2, opacity: 50, groupIds: [], seed },
    // 左眼
    { type: "ellipse", x: cx - r * 0.35, y: cy - r * 0.3, width: r * 0.2, height: r * 0.25, strokeColor: color, backgroundColor: color, fillStyle: "solid", strokeWidth: 1, roughness: 1.5, opacity: 50, groupIds: [], seed: seed + 1 },
    // 右眼
    { type: "ellipse", x: cx + r * 0.15, y: cy - r * 0.3, width: r * 0.2, height: r * 0.25, strokeColor: color, backgroundColor: color, fillStyle: "solid", strokeWidth: 1, roughness: 1.5, opacity: 50, groupIds: [], seed: seed + 2 },
    // 嘴（弧线用一条线模拟）
    { type: "line", x: cx - r * 0.35, y: cy + r * 0.15, points: [[0, 0], [r * 0.2, r * 0.25], [r * 0.5, r * 0.25], [r * 0.7, 0]], strokeColor: color, strokeWidth: 2, roughness: 2, opacity: 50, groupIds: [], seed: seed + 3 },
  ];
}

function makeHeart(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  // 简化心形用两条弧线
  return [
    { type: "line", x: cx, y: cy + r * 0.5, points: [[0, 0], [-r * 0.5, -r * 0.4], [-r * 0.3, -r * 0.8], [0, -r * 0.4]], strokeColor: color, strokeWidth: 2, roughness: 2, opacity: 50, groupIds: [], seed },
    { type: "line", x: cx, y: cy + r * 0.5, points: [[0, 0], [r * 0.5, -r * 0.4], [r * 0.3, -r * 0.8], [0, -r * 0.4]], strokeColor: color, strokeWidth: 2, roughness: 2, opacity: 50, groupIds: [], seed: seed + 1 },
  ];
}

function makeTape(cx: number, cy: number, w: number, color: string, rot: number, seed: number): any {
  return {
    type: "rectangle",
    x: cx - w / 2, y: cy - 10,
    width: w, height: 20,
    strokeColor: "transparent",
    backgroundColor: color,
    fillStyle: "solid",
    strokeWidth: 0, roughness: 1.5,
    opacity: 35,
    angle: (rot * Math.PI) / 180,
    roundness: { type: 3 },
    groupIds: [], seed
  };
}

function makeSticker(cx: number, cy: number, size: number, color: string, seed: number): any {
  return {
    type: "rectangle",
    x: cx - size / 2, y: cy - size / 2,
    width: size, height: size,
    strokeColor: color,
    backgroundColor: color,
    fillStyle: "solid",
    strokeWidth: 1, roughness: 2,
    opacity: 30,
    roundness: { type: 3 },
    angle: (((seed % 8) - 4) * Math.PI) / 180,
    groupIds: [], seed
  };
}

function makeLabelTag(cx: number, cy: number, size: number, color: string, seed: number): any {
  return {
    type: "rectangle",
    x: cx - size * 0.8, y: cy - size * 0.3,
    width: size * 1.6, height: size * 0.6,
    strokeColor: color,
    backgroundColor: color,
    fillStyle: "solid",
    strokeWidth: 1.5, roughness: 1.8,
    opacity: 30,
    roundness: { type: 3 },
    groupIds: [], seed
  };
}

function makePin(cx: number, cy: number, r: number, color: string, seed: number): any[] {
  return [
    { type: "ellipse", x: cx - r, y: cy - r * 2, width: r * 2, height: r * 2, strokeColor: color, backgroundColor: color, fillStyle: "solid", strokeWidth: 1.5, roughness: 2, opacity: 55, groupIds: [], seed },
    { type: "line", x: cx, y: cy, points: [[0, 0], [0, r * 0.8]], strokeColor: color, strokeWidth: 2, roughness: 2, opacity: 55, groupIds: [], seed: seed + 1 },
  ];
}

function makeMarkerBar(cx: number, cy: number, w: number, color: string, rot: number, seed: number): any {
  return {
    type: "rectangle",
    x: cx - w / 2, y: cy - 8,
    width: w, height: 16,
    strokeColor: "transparent",
    backgroundColor: color,
    fillStyle: "solid",
    strokeWidth: 0, roughness: 1,
    opacity: 40,
    angle: (rot * Math.PI) / 180,
    roundness: { type: 3 },
    groupIds: [], seed
  };
}

function makeDoodleUnderline(cx: number, cy: number, w: number, color: string, seed: number): any {
  return {
    type: "line",
    x: cx - w / 2, y: cy,
    points: [[0, 0], [w * 0.3, 4], [w * 0.6, -2], [w, 3]],
    strokeColor: color, strokeWidth: 2.5, roughness: 2.5,
    opacity: 55, groupIds: [], seed
  };
}

function makeDoodleCircle(cx: number, cy: number, r: number, color: string, seed: number): any {
  return {
    type: "ellipse",
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    strokeColor: color, backgroundColor: "transparent",
    fillStyle: "hachure", strokeWidth: 2.5, roughness: 2.8,
    opacity: 50, groupIds: [], seed
  };
}

function makeTitleUnderline(cx: number, cy: number, w: number, color: string, seed: number): any[] {
  return [
    { type: "line", x: cx - w / 2, y: cy, points: [[0, 0], [w, 6]], strokeColor: color, strokeWidth: 3, roughness: 2.5, opacity: 70, groupIds: [], seed },
    { type: "line", x: cx - w / 2 + 15, y: cy + 10, points: [[0, 0], [w - 30, -4]], strokeColor: color, strokeWidth: 1.5, roughness: 2.5, opacity: 40, groupIds: [], seed: seed + 1 },
  ];
}

function makeCornerDot(cx: number, cy: number, r: number, color: string, seed: number): any {
  return {
    type: "ellipse",
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    strokeColor: color, backgroundColor: color,
    fillStyle: "solid", strokeWidth: 1, roughness: 2,
    opacity: 60, groupIds: [], seed
  };
}

// ============================================================
//  关键词高亮标记（供 renderer 使用）
// ============================================================

export function highlightKeywords(text: string): { text: string; keywords: string[] } {
  const patterns = [
    /\d+[%％倍步天年个月万]/g,
    /(?:提升|增长|变现|成交|效率|转化|爆款|赚钱|省钱|暴增|翻倍|逆袭)/g,
    /(?:步骤|方法|公式|模型|框架|技巧|秘诀|攻略|指南|干货)/g,
    /(?:焦虑|迷茫|痛点|避坑|后悔|踩坑|亏|错|失败)/g,
  ];
  const keywords: string[] = [];
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) keywords.push(...matches);
  }
  return { text, keywords: [...new Set(keywords)] };
}
