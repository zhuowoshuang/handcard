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
import { stylePresets, getPreset, type PresetId } from "@/lib/stylePresets";
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

type Slide = {
  id: string;
  card: CardData | null;
  scene: ExcalidrawSceneData;
  templateId: TemplateId;
  presetId: PresetId;
  input: string;
};

const defaultTemplateId: TemplateId = "pain-point";
const defaultPresetId: PresetId = "classic-handdrawn";
const defaultTpl = templates.find((t) => t.id === defaultTemplateId)!;

let _counter = 0;
const newSlideId = () => `s${++_counter}-${Math.random().toString(36).slice(2, 6)}`;

function createEmptySlide(): Slide {
  return {
    id: newSlideId(),
    card: null,
    scene: { elements: [], appState: { viewBackgroundColor: "#ffffff", currentItemFontFamily: 1, currentItemStrokeColor: "#111111" } },
    templateId: defaultTemplateId,
    presetId: defaultPresetId,
    input: defaultTpl.defaultInput
  };
}

// 背景色缓存
const presetBgMap = Object.fromEntries(stylePresets.map((p) => [p.id, p.background.color]));

// zoom 值 → slider 值 的反向映射
const zoomToSlider = (z: number) => Math.min(100, Math.max(0, 100 * Math.log(z / 0.1) / Math.log(30)));
const sliderToZoom = (v: number) => 0.1 * Math.pow(30, v / 100);

export function CardGenerator() {
  const [slides, setSlides] = useState<Slide[]>([createEmptySlide()]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [busy, setBusy] = useState<null | "gen" | "export">(null);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [zoom, setZoom] = useState(70);
  const carouselRef = useRef<HTMLDivElement>(null);

  const apisRef = useRef<Record<string, ExcalidrawImperativeAPI>>({});
  // 每张 slide 的 zoom 值（slider 值，0-100）
  const zoomsRef = useRef<Record<string, number>>({});
  const [apisVersion, setApisVersion] = useState(0);
  // 上一次 activeIdx，用于检测切换
  const prevIdxRef = useRef(0);

  const active = slides[activeIdx] || slides[0];
  const currentTemplate = templates.find((t) => t.id === active.templateId) || templates[0];

  const handleApi = useCallback((slideId: string, api: ExcalidrawImperativeAPI) => {
    apisRef.current[slideId] = api;
    setApisVersion((v) => v + 1);
  }, []);

  const updateActive = useCallback((patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)));
  }, [activeIdx]);

  const handleSelectTemplate = useCallback((id: TemplateId) => {
    const tpl = templates.find((t) => t.id === id)!;
    updateActive({ templateId: id, input: tpl.defaultInput, card: null });
    setError(null);
  }, [updateActive]);

  const handleSelectPreset = useCallback((id: PresetId) => {
    updateActive({ presetId: id });
  }, [updateActive]);

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

  // ── 生成后同步场景 + 自动居中到可读 zoom ──
  useEffect(() => {
    if (!active.card) return;
    const slideId = active.id;
    let cancelled = false;

    (async () => {
      try {
        const next = await buildExcalidrawScene(active.card!, { width: W, height: H }, active.presetId);
        if (cancelled) return;
        setSlides((prev) => prev.map((s) => (s.id === slideId ? { ...s, scene: next } : s)));
        const api = apisRef.current[slideId];
        if (api) {
          api.updateScene({ elements: next.elements, appState: next.appState as SceneUpdate["appState"] } as SceneUpdate);
          // 设置可读 zoom 并居中到内容
          requestAnimationFrame(() => {
            if (cancelled) return;
            try {
              const targetZoom = 0.65;
              api.updateScene({ appState: { zoom: { value: targetZoom as any } } } as SceneUpdate);
              api.scrollToContent(api.getSceneElements(), { fitToContent: false });
              const sliderVal = zoomToSlider(targetZoom);
              zoomsRef.current[slideId] = sliderVal;
              if (slides[activeIdx]?.id === slideId) {
                setZoom(sliderVal);
              }
            } catch {}
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "预览生成失败");
      }
    })();

    return () => { cancelled = true; };
  }, [active.card, active.presetId, active.id]);

  // ── 切换 slide 时恢复该 slide 的 zoom ──
  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return;
    prevIdxRef.current = activeIdx;

    const slideId = slides[activeIdx]?.id;
    if (!slideId) return;

    const savedZoom = zoomsRef.current[slideId];
    const api = apisRef.current[slideId];

    if (savedZoom !== undefined) {
      // 有保存的 zoom，恢复它
      setZoom(savedZoom);
      if (api) {
        const z = sliderToZoom(savedZoom);
        api.updateScene({ appState: { zoom: { value: z as any } } } as SceneUpdate);
      }
    } else if (api) {
      // 没有保存的 zoom（新 slide），自动适配
      try {
        api.scrollToContent(api.getSceneElements(), { fitToContent: true });
        const currentZoom = api.getAppState().zoom.value;
        const sliderVal = zoomToSlider(currentZoom);
        zoomsRef.current[slideId] = sliderVal;
        setZoom(sliderVal);
      } catch {}
    }
  }, [activeIdx, slides]);

  // ── 缩放 ──
  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
    const slideId = slides[activeIdx]?.id;
    if (slideId) zoomsRef.current[slideId] = value;
    const api = apisRef.current[active.id];
    if (!api) return;
    const z = sliderToZoom(value);
    api.updateScene({ appState: { zoom: { value: z as any } } } as SceneUpdate);
  }, [active.id, activeIdx, slides]);

  // ── 设置指定 zoom 并居中 ──
  const applyZoom = useCallback((targetZoom: number) => {
    const api = apisRef.current[active.id];
    if (!api) return;
    api.updateScene({ appState: { zoom: { value: targetZoom as any } } } as SceneUpdate);
    api.scrollToContent(api.getSceneElements(), { fitToContent: false });
    const sliderVal = zoomToSlider(targetZoom);
    zoomsRef.current[active.id] = sliderVal;
    setZoom(sliderVal);
  }, [active.id]);

  // ── 适配全部内容（zoom out）──
  const handleFit = useCallback(() => {
    const api = apisRef.current[active.id];
    if (!api) return;
    try {
      api.scrollToContent(api.getSceneElements(), { fitToContent: true });
      const currentZoom = api.getAppState().zoom.value;
      const sliderVal = zoomToSlider(currentZoom);
      zoomsRef.current[active.id] = sliderVal;
      setZoom(sliderVal);
    } catch {}
  }, [active.id]);

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
  }, [active.id, active.card?.title]);

  // ── 新增/删除 slide ──
  const handleAddSlide = useCallback(() => {
    setSlides((prev) => {
      const next = [...prev, createEmptySlide()];
      requestAnimationFrame(() => {
        const el = carouselRef.current;
        if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      });
      return next;
    });
  }, []);

  const handleDeleteSlide = useCallback(() => {
    if (slides.length <= 1) return;
    const deletedId = slides[activeIdx].id;
    delete apisRef.current[deletedId];
    delete zoomsRef.current[deletedId];
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

  const handlePrev = useCallback(() => { if (activeIdx > 0) scrollToSlide(activeIdx - 1); }, [activeIdx, scrollToSlide]);
  const handleNext = useCallback(() => { if (activeIdx < slides.length - 1) scrollToSlide(activeIdx + 1); }, [activeIdx, slides.length, scrollToSlide]);

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / 452);
    if (idx !== activeIdx && idx >= 0 && idx < slides.length) setActiveIdx(idx);
  }, [activeIdx, slides.length]);

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

  const getSlidePreset = (pid: PresetId) => getPreset(pid);

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
        <aside className="sidebar">
          {/* ── 模板 ── */}
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

          {/* ── 视觉风格 ── */}
          <section className="sidebar-section">
            <h2 className="sidebar-heading">视觉风格</h2>
            <div className="style-strip">
              {stylePresets.map((p) => (
                <button type="button" key={p.id}
                  className={`style-chip ${active.presetId === p.id ? "style-chip--active" : ""}`}
                  onClick={() => handleSelectPreset(p.id)}
                  title={p.description}
                  style={active.presetId === p.id ? { background: p.colors.danger, color: p.chipFg } : undefined}>
                  <span className="style-chip-icon">{p.preview}</span>
                  <span className="style-chip-name">{p.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── 输入 ── */}
          <section className="sidebar-section sidebar-section--grow">
            <h2 className="sidebar-heading">输入文案</h2>
            <textarea className="input-area" value={active.input}
              onChange={(e) => updateActive({ input: e.target.value })}
              placeholder={currentTemplate.placeholder} spellCheck={false} />
          </section>

          {/* ── 按钮 ── */}
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
            <span className="zoom-value">{Math.round(sliderToZoom(zoom) * 100)}%</span>
            <button type="button" className="zoom-btn zoom-btn--fit" onClick={handleFit} title="适配全部">⊞</button>
            <button type="button" className={`zoom-preset ${Math.abs(zoom - zoomToSlider(0.5)) < 3 ? "zoom-preset--active" : ""}`} onClick={() => applyZoom(0.5)} title="50%">50%</button>
            <button type="button" className={`zoom-preset ${Math.abs(zoom - zoomToSlider(0.65)) < 3 ? "zoom-preset--active" : ""}`} onClick={() => applyZoom(0.65)} title="阅读">📖</button>
            <button type="button" className={`zoom-preset ${Math.abs(zoom - zoomToSlider(1.0)) < 3 ? "zoom-preset--active" : ""}`} onClick={() => applyZoom(1.0)} title="100%">100%</button>
            <button type="button" className={`zoom-preset ${Math.abs(zoom - zoomToSlider(1.5)) < 3 ? "zoom-preset--active" : ""}`} onClick={() => applyZoom(1.5)} title="150%">150%</button>
            <span className="toolbar-divider" />
            <button type="button" className="zoom-btn" onClick={handleAddSlide} title="新增页面">＋</button>
            <button type="button" className="zoom-btn" onClick={handleDeleteSlide} disabled={slides.length <= 1} title="删除页面">🗑</button>
          </div>

          <div className="carousel-wrapper">
            <div className="carousel" ref={carouselRef} onScroll={handleScroll}>
              {slides.map((slide, idx) => {
                const spreset = getSlidePreset(slide.presetId);
                return (
                  <div key={slide.id} className={`carousel-card ${idx === activeIdx ? "carousel-card--active" : ""}`}
                    onClick={() => scrollToSlide(idx)}>
                    <div className="carousel-canvas" style={{ background: presetBgMap[slide.presetId] || "#fff" }}>
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
                      <span className="carousel-meta">{spreset.preview} {spreset.name}</span>
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
