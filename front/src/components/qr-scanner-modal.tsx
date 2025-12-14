"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState } from "react";
import { isAddress } from "viem";

export type QrScanError = {
  type: "camera_permission" | "invalid_address" | "scan_failed";
  message: string;
};

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (address: string) => void;
  onError: (error: QrScanError) => void;
}

export function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  onError,
}: QrScannerModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const qrCodeRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    let isScanning = false;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const qrCodeSuccessCallback = (decodedText: string) => {
      const address = decodedText.trim();
      if (isAddress(address)) {
        // スキャン成功時にカメラを停止
        if (isScanning) {
          isScanning = false;
          html5QrCode
            .stop()
            .then(() => {
              onScanSuccess(address);
            })
            .catch(() => {
              // カメラ停止エラーは無視して、成功コールバックは実行
              onScanSuccess(address);
            });
        } else {
          onScanSuccess(address);
        }
      } else {
        onError({
          type: "invalid_address",
          message: "有効なウォレットアドレスではありません",
        });
      }
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        () => {
          // スキャンエラー（QRコードが見つからない等）は無視
          // 連続スキャン中は常に呼ばれるため、ログは出さない
        },
      )
      .then(() => {
        isScanning = true;
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          onError({
            type: "camera_permission",
            message: "カメラアクセスが拒否されました",
          });
        } else {
          onError({
            type: "scan_failed",
            message: "カメラの起動に失敗しました",
          });
        }
      });

    return () => {
      // クリーンアップ時、まだスキャン中の場合のみカメラを停止
      if (isScanning) {
        isScanning = false;
        html5QrCode.stop().catch(() => {
          // クリーンアップエラーは無視
        });
      }
    };
  }, [isOpen, onScanSuccess, onError]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        aria-label="スキャナーを閉じる"
      />

      {/* Dialog Content */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="閉じる"
        >
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>閉じる</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            QRコードをスキャン
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            ウォレットアドレスのQRコードをカメラにかざしてください
          </p>

          {/* QR Scanner Container */}
          <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
            <div id="qr-reader" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
