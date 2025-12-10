"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_TEAM = "c";

const formatCode = (raw: string | null) => {
  const digitsOnly = (raw ?? "").replace(/\D/g, "").slice(0, 3);
  return digitsOnly.padStart(3, "0");
};

export default function TokenPage() {
  const searchParams = useSearchParams();
  const team = (searchParams.get("team") ?? DEFAULT_TEAM).toLowerCase();
  const code = useMemo(
    () => formatCode(searchParams.get("id")),
    [searchParams],
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    setLoadError(null);

    const img = new window.Image();
    img.src = `/img/base-${team}.png`;
    img.onload = () => {
      const width = img.naturalWidth || 1200;
      const height = img.naturalHeight || 1200;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Render the 3-digit code with a subtle shadow for visibility
      const fontSize = Math.floor(width * 0.18);
      ctx.font = `${fontSize}px "Geist", "Inter", system-ui, sans-serif`;
      ctx.fillStyle = "#ffffff";
      const padding = Math.max(width, height) * 0.05;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.shadowBlur = Math.max(8, Math.floor(fontSize / 10));
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.max(4, Math.floor(fontSize / 30));
      ctx.fillText(code, width - padding, height - padding);
      ctx.shadowColor = "transparent";
    };

    img.onerror = () => {
      setLoadError(`背景画像 /img/base-${team}.png の読み込みに失敗しました`);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [team, code]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 text-gray-900 dark:bg-black dark:text-gray-50">
        <div className="mx-auto w-full max-w-5xl animate-pulse rounded-2xl border border-gray-200 bg-gray-100 p-8 dark:border-gray-800 dark:bg-gray-950" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-gray-900 dark:bg-black dark:text-gray-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Token Preview
          </p>
          <h1 className="text-3xl font-bold">Token Canvas</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            クエリパラメーターで指定した背景と3桁コードをCanvas上に描画します。
            `?team=c&id=123` のように指定してください。
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
            team: <span className="font-mono">{team}</span>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
            code: <span className="font-mono">{code}</span>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
            背景: <span className="font-mono">/img/base-{team}.png</span>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            {loadError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <canvas
            ref={canvasRef}
            className="h-auto w-full"
            aria-label="Token canvas"
          />
        </div>
      </div>
    </div>
  );
}
