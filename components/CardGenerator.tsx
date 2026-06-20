"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  templates,
  mockParseToCardData,
  type CardData,
  type TemplateId
} from "@/lib/mockParser";
import { cardStyles, type StyleId } from "@/lib/cardStyles";
import { buildExcalidrawScene, type ExcalidrawSceneData } from "@/lib/excalidrawElements";
import { exportSceneToPng } from "@/lib/exportPng";

import "@excalidraw/excalidraw/index.css";

const ExcalidrawCanvas = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

const W = 1080;
const H = 1920;
type SceneUpdate = Parameters<ExcalidrawImperativeAPI["updateScene"]>[0];

// ── 单张幻灯片 ──
type Slide = {
  id: string;
  card: CardData | null;
  scene: ExcalidrawSceneData;
  templateId: TemplateId;
  styleId: StyleId;
  input: string;
};

const defaultTemplateId: TemplateId = "pain-point";
const defaultStyleId: StyleId = "sketch";
const defaultTpl = templates.find((t) => t.id === defaultTemplateId)!;

// 用 ref 代替模块级变量，避免 SSR 水合不一致
let _counter = 0;
const newSlideId = () => `s${++_counter}-${Math.random().toString(36).slice(2, 6)}`;

function createEmptySlide(): Slide {
  return {
    id: newSlideId(),
    card: null,
    scene: { elements: [], appState: { viewBackgroundColor: "#ffffff", currentItemFontFamily: 1, currentItemStrokeColor: "#111111" } },
    templateId: defaultTemplateId,
    styleId: defaultStyleId,
    input: defaultTpl.defaultInput
  };
}

// 风格背景色缓存
const styleBgMap = Object.fromEntries(cardStyles.map((s) => [s.id, s.background]));

// ============================================================

export function CardGenerator() {
  const [slides, setSlides] = useState<Slide[]>([createEmptySlide()]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [busy, setBusy] = useState<null | "gen" | "export">(null);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [zoom, setZoom] = useState(50);
  const carouselRef = useRef<HTMLDivElement>(null);

  // BUG-2 修复: 用 ref 存 apis，避免闭包捕获过期引用
  const apisRef = useRef<Record<string, ExcalidrawImperativeAPI>>({});
  // 用于触发依赖 apis 的回调重建
  const [apisVersion, setApisVersion] = useState(0);

  const active = slides[activeIdx] || slides[0];
  const currentTemplate = templates.find((t) => t.id === active.templateId) || templates[0];

  // ── 注册 Excalidraw API ──
  const handleApi = useCallback((slideId: string, api: ExcalidrawImperativeAPI) => {
    apisRef.current[slideId] = api;
    setApisVersion((v) => v + 1);
  }, []);

  // ── 更新活动 slide ──
  const updateActive = useCallback((patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)));
  }, [activeIdx]);

  // ── 切换模板 ──
  const handleSelectTemplate = useCallback((id: TemplateId) => {
    const tpl = templates.find((t) => t.id === id)!;
    updateActive({ templateId: id, input: tpl.defaultInput, card: null });
    setError(null);
  }, [updateActive]);

  // ── 切换风格 ──
  const handleSelectStyle = useCallback((id: StyleId) => {
    updateActive({ styleId: id });
  }, [updateActive]);

  // ── 生成当前卡片 ──
  const handleGenerate = useCallback(() => {
    setBusy("gen");
    setError(null);
    try {
      const data = mockParseToCardData(active.input, active.templateId);
      updateActive({ card: data });
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析失败");
    } finally {
      setBusy(null);
    }
  }, [active.input, active.templateId, updateActive]);

  // ── 同步场景（card / styleId / apis 变化时）──
  useEffect(() => {
    if (!active.card) return;
    const slideId = active.id;
    let cancelled = false;

    (async () => {
      try {
        const next = await buildExcalidrawScene(active.card!, { width: W, height: H }, active.styleId);
        if (cancelled) return;

        setSlides((prev) => prev.map((s) => (s.id === slideId ? { ...s, scene: next } : s)));

        const api = apisRef.current[slideId];
        if (api) {
          api.updateScene({ elements: next.elements, appState: next.appState as SceneUpdate["appState"] } as SceneUpdate);
          requestAnimationFrame(() => {
            if (!cancelled) {
              try { api.scrollToContent(api.getSceneElements(), { fitToContent: true }); } catch {}
            }
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "预览生成失败");
      }
    })();

    return () => { cancelled = true; };
    // apisVersion 确保 API 注册后也能触发
  }, [active.card, active.styleId, active.id, apisVersion]);

  // ── 缩放（读 apisRef，无过期闭包）──
  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
    const api = apisRef.current[active.id];
    if (!api) return;
    const z = 0.1 * Math.pow(30, value / 100);
    api.updateScene({ appState: { zoom: { value: z as any } } } as SceneUpdate);
  }, [active.id, apisVersion]);

  const handleFit = useCallback(() => {
    const api = apisRef.current[active.id];
    if (!api) return;
    try { api.scrollToContent(api.getSceneElements(), { fitToContent: true }); } catch {}
  }, [active.id, apisVersion]);

  // ── 导出 ──
  const handleExport = useCallback(async () => {
    const api = apisRef.current[active.id];
    if (!api) return;
    setBusy("export");
    setError(null);
    try {
      await exportSceneToPng({
        elements: api.getSceneElements(),
        files: api.getFiles() ?? null,
        fileName: `${active.card?.title || "knowledge-card"}.png`
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "导出失败");
    } finally {
      setBusy(null);
    }
  }, [active.id, active.card?.title, apisVersion]);

  // ── 新增幻灯片 ──
  const handleAddSlide = useCallback(() => {
    setSlides((prev) => {
      const next = [...prev, createEmptySlide()];
      // 滚动到最后一个
      requestAnimationFrame(() => {
        const el = carouselRef.current;
        if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      });
      return next;
    });
  }, []);

  // ── 删除当前幻灯片（清理 apis ref）──
  const handleDeleteSlide = useCallback(() => {
    if (slides.length <= 1) return;
    const deletedId = slides[activeIdx].id;
    delete apisRef.current[deletedId];
    setSlides((prev) => prev.filter((_, i) => i !== activeIdx));
    setActiveIdx((prev) => Math.max(0, prev - 1));
  }, [slides.length, activeIdx, slides]);

  // ── 导航 ──
  const scrollToSlide = useCallback((idx: number) => {
    setActiveIdx(idx);
    const el = carouselRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement;
    if (card) el.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
  }, []);

  const handlePrev = useCallback(() => {
    if (activeIdx > 0) scrollToSlide(activeIdx - 1);
  }, [activeIdx, scrollToSlide]);

  const handleNext = useCallback(() => {
    if (activeIdx < slides.length - 1) scrollToSlide(activeIdx + 1);
  }, [activeIdx, slides.length, scrollToSlide]);

  // ── 滚动检测 ──
  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / 452);
    if (idx !== activeIdx && idx >= 0 && idx < slides.length) setActiveIdx(idx);
  }, [activeIdx, slides.length]);

  // ── 键盘左右箭头（UX-3: 忽略 textarea 内的按键）──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); handleNext(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePrev, handleNext]);

  // ── 辅助：获取某个 slide 的模板信息 ──
  const getSlideTemplate = (tid: TemplateId) => templates.find((t) => t.id === tid) || templates[0];

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <span className="header-icon">✏️</span>
          <h1 className="header-title">HandCard</h1>
          <span className="header-badge">Beta</span>
        </div>
        <p className="header-subtitle">中文文案 → 知识卡片生成器</p>
      </header>

      <main className="app-main">
        {/* ─── 左侧面板 ─── */}
        <aside className="sidebar">
          <section className="sidebar-section">
            <h2 className="sidebar-heading">内容模板</h2>
            <div className="template-grid">
              {templates.map((tpl) => (
                <button type="button" key={tpl.id}
                  className={`template-card ${active.templateId === tpl.id ? "template-card--active" : ""}`}
                  onClick={() => handleSelectTemplate(tpl.id)}>
                  <span className="template-icon">{tpl.icon}</span>
                  <span className="template-name">{tpl.name}</span>
                  <span className="template-desc">{tpl.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-section">
            <h2 className="sidebar-heading">视觉风格</h2>
            <div className="style-strip">
              {cardStyles.map((s) => (
                <button type="button" key={s.id}
                  className={`style-chip ${active.styleId === s.id ? "style-chip--active" : ""}`}
                  onClick={() => handleSelectStyle(s.id)}
                  title={s.description}
                  style={active.styleId === s.id ? { background: s.accent, color: s.chipFg } : undefined}>
                  <span className="style-chip-icon">{s.preview}</span>
                  <span className="style-chip-name">{s.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-section sidebar-section--grow">
            <h2 className="sidebar-heading">输入文案</h2>
            <textarea className="input-area" value={active.input}
              onChange={(e) => updateActive({ input: e.target.value })}
              placeholder={currentTemplate.placeholder} spellCheck={false} />
          </section>

          <div className="action-bar">
            <button type="button" className="btn btn--primary" onClick={handleGenerate} disabled={busy !== null}>
              {busy === "gen" ? <><span className="spinner" /> 生成中…</> : <><span className="btn-icon">⚡</span> 生成预览</>}
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleExport} disabled={!apisRef.current[active.id] || busy !== null}>
              {busy === "export" ? <><span className="spinner" /> 导出中…</> : <><span className="btn-icon">📥</span> 导出 PNG</>}
            </button>
          </div>

          {error && <p className="error-msg">{error}</p>}

          {active.card && (
            <div className="json-panel">
              <button type="button" className="json-toggle" onClick={() => setShowJson(!showJson)}>
                <span>结构化 JSON</span>
                <span className={`json-arrow ${showJson ? "json-arrow--open" : ""}`}>▸</span>
              </button>
              {showJson && <pre className="json-body">{JSON.stringify(active.card, null, 2)}</pre>}
            </div>
          )}
        </aside>

        {/* ─── 右侧 PPT 预览 ─── */}
        <section className="preview-area">
          <div className="preview-toolbar">
            <button type="button" className="zoom-btn" onClick={handlePrev} disabled={activeIdx === 0} title="上一页">◀</button>
            <span className="page-indicator">{activeIdx + 1} / {slides.length}</span>
            <button type="button" className="zoom-btn" onClick={handleNext} disabled={activeIdx === slides.length - 1} title="下一页">▶</button>
            <span className="toolbar-divider" />
            <button type="button" className="zoom-btn" onClick={() => handleZoomChange(Math.max(0, zoom - 15))} title="缩小">−</button>
            <input type="range" className="zoom-slider" min={0} max={100} step={1} value={zoom}
              aria-label="缩放比例" onChange={(e) => handleZoomChange(Number(e.target.value))} />
            <button type="button" className="zoom-btn" onClick={() => handleZoomChange(Math.min(100, zoom + 15))} title="放大">+</button>
            <button type="button" className="zoom-btn zoom-btn--fit" onClick={handleFit} title="适配画面">⊞</button>
            <span className="toolbar-divider" />
            <button type="button" className="zoom-btn" onClick={handleAddSlide} title="新增页面">＋</button>
            <button type="button" className="zoom-btn" onClick={handleDeleteSlide} disabled={slides.length <= 1} title="删除页面">🗑</button>
          </div>

          <div className="carousel-wrapper">
            <div className="carousel" ref={carouselRef} onScroll={handleScroll}>
              {slides.map((slide, idx) => {
                const stpl = getSlideTemplate(slide.templateId);
                return (
                  <div key={slide.id} className={`carousel-card ${idx === activeIdx ? "carousel-card--active" : ""}`}
                    onClick={() => scrollToSlide(idx)}>
                    <div className="carousel-canvas" style={{ background: styleBgMap[slide.styleId] || "#fff" }}>
                      {slide.card ? (
                        <ExcalidrawCanvas
                          excalidrawAPI={(api) => handleApi(slide.id, api)}
                          initialData={slide.scene}
                          viewModeEnabled zenModeEnabled gridModeEnabled={false}
                          theme="light" langCode="zh-CN"
                          UIOptions={{
                            canvasActions: {
                              loadScene: false, saveToActiveFile: false, saveAsImage: false,
                              export: false, clearCanvas: false, toggleTheme: false,
                              changeViewBackgroundColor: false
                            },
                            tools: { image: false }
                          }}
                        />
                      ) : (
                        <div className="carousel-empty">
                          <span>📄</span>
                          <p>点击「生成预览」</p>
                        </div>
                      )}
                    </div>
                    <div className="carousel-footer">
                      <span className="carousel-page">{idx + 1}</span>
                      <span className="carousel-title">{slide.card?.title || "未生成"}</span>
                      <span className="carousel-meta">{stpl.icon} {stpl.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="page-dots">
            {slides.map((_, idx) => (
              <button key={idx} type="button"
                className={`page-dot ${idx === activeIdx ? "page-dot--active" : ""}`}
                onClick={() => scrollToSlide(idx)}
                aria-label={`第 ${idx + 1} 页`} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
