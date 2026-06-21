import type {
  AppState,
  BinaryFiles
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

type ExportOpts = {
  elements: readonly ExcalidrawElement[];
  files: BinaryFiles | null;
  fileName: string;
  /** 可选：指定导出尺寸（保持画幅比例） */
  width?: number;
  height?: number;
};

/**
 * 导出 Excalidraw 场景为 PNG。
 * 指定 width/height 时按该比例导出；否则自动根据元素边界裁切。
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

  let blob: Blob | null = null;

  // 方式一：exportToBlob
  try {
    blob = await excalidraw.exportToBlob({
      elements,
      files,
      mimeType: "image/png",
      exportPadding: hasDims ? 0 : 60,
      appState: commonAppState,
      ...(hasDims ? { getDimensions: () => ({ width: width!, height: height!, scale: 1 }) } : {})
    });
  } catch {
    // 方式二：exportToCanvas → toBlob
    try {
      const canvas = await excalidraw.exportToCanvas({
        elements,
        files,
        appState: commonAppState,
        exportPadding: hasDims ? 0 : 60,
        ...(hasDims ? { getDimensions: () => ({ width: width!, height: height!, scale: 1 }) } : {})
      });

      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b: Blob | null) => resolve(b), "image/png");
      });
    } catch (err) {
      throw new Error(`PNG 导出失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

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
