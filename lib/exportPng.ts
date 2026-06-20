import type {
  AppState,
  BinaryFiles
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

type ExportOpts = {
  elements: readonly ExcalidrawElement[];
  files: BinaryFiles | null;
  fileName: string;
};

/**
 * 导出 Excalidraw 场景为 PNG。
 * 不指定 getDimensions，让 Excalidraw 自动根据元素边界计算画布大小。
 */
export async function exportSceneToPng({
  elements,
  files,
  fileName
}: ExportOpts) {
  const excalidraw = await import("@excalidraw/excalidraw");

  const commonAppState = {
    viewBackgroundColor: "#ffffff",
    exportBackground: true,
    exportWithDarkMode: false
  } as Partial<AppState>;

  let blob: Blob | null = null;

  // 方式一：exportToBlob
  try {
    blob = await excalidraw.exportToBlob({
      elements,
      files,
      mimeType: "image/png",
      exportPadding: 60,
      appState: commonAppState
    });
  } catch {
    // 方式二：exportToCanvas → toBlob
    try {
      const canvas = await excalidraw.exportToCanvas({
        elements,
        files,
        appState: commonAppState,
        exportPadding: 60
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
