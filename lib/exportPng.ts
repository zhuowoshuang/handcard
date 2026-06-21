import type {
  AppState,
  BinaryFiles
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

type ExportOpts = {
  elements: readonly ExcalidrawElement[];
  files: BinaryFiles | null;
  fileName: string;
  width?: number;
  height?: number;
};

/**
 * 导出 Excalidraw 场景为 PNG。
 * 指定 width/height 时严格按该尺寸导出。
 */
export async function exportSceneToPng({
  elements,
  files,
  fileName,
  width,
  height
}: ExportOpts) {
  const excalidraw = await import("@excalidraw/excalidraw");

  const commonAppState = {
    viewBackgroundColor: "#ffffff",
    exportBackground: true,
    exportWithDarkMode: false
  } as Partial<AppState>;

  const hasDims = width && height;

  // 始终用 exportToCanvas，它对尺寸控制更可靠
  let canvas: HTMLCanvasElement;
  try {
    canvas = await excalidraw.exportToCanvas({
      elements,
      files,
      appState: commonAppState,
      exportPadding: 0,
      ...(hasDims
        ? { getDimensions: () => ({ width: width!, height: height!, scale: 1 }) }
        : {})
    });
  } catch (err) {
    throw new Error(`PNG 导出失败: ${err instanceof Error ? err.message : String(err)}`);
  }

  // canvas → blob
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b: Blob | null) => resolve(b), "image/png");
  });

  if (!blob) {
    throw new Error("PNG 导出失败：无法生成图片数据");
  }

  // 触发下载
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitize(fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitize(name: string) {
  const clean = name.replace(/[\\/:*?"<>|]+/g, "-").trim();
  return clean.endsWith(".png") ? clean : `${clean || "knowledge-card"}.png`;
}
