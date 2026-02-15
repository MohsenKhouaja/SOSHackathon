import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  type CameraDevice,
  Html5Qrcode,
  type Html5QrcodeCameraScanConfig,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VIBRATION_DURATION_MS = 100;

type BarcodeScannerProps = {
  onBarcodeScanned: (barcode: string) => void;
  scanDelay?: number;
  className?: string;
  /** Size of the scanner in pixels (width = height). If not provided, use className for sizing */
  size?: number;
};

export function BarcodeScanner({
  onBarcodeScanned,
  scanDelay = 800,
  className = "",
  size,
}: BarcodeScannerProps) {
  const [cameraNumber, setCameraNumber] = useState<number>(0);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isWaitCompleteRef = useRef(true);
  const qrRegionRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const onBarcodeScannedRef = useRef(onBarcodeScanned);

  useEffect(() => {
    onBarcodeScannedRef.current = onBarcodeScanned;
  }, [onBarcodeScanned]);

  useEffect(() => {
    if (!qrRegionRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const scannerId = "qr-reader";
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.EAN_13,
    ];
    const html5QrCode = new Html5Qrcode(scannerId, {
      formatsToSupport,
      verbose: false,
    });
    html5QrCodeRef.current = html5QrCode;

    let isMounted = true;
    let isRunning = false;

    Html5Qrcode.getCameras()
      .then((availableDevices) => {
        if (!isMounted) return;
        // Sort cameras to prioritize back/environment facing cameras
        const sortedDevices = availableDevices.sort((a, b) => {
          const aLabel = a.label.toLowerCase();
          const bLabel = b.label.toLowerCase();
          const isBackA =
            aLabel.includes("back") || aLabel.includes("environment");
          const isBackB =
            bLabel.includes("back") || bLabel.includes("environment");
          if (isBackA && !isBackB) return -1;
          if (!isBackA && isBackB) return 1;
          return 0;
        });
        setDevices(sortedDevices);
        if (availableDevices.length === 0) {
          setError("No cameras found");
          setIsLoading(false);
          return;
        }

        const cameraIndex = Math.min(cameraNumber, availableDevices.length - 1);
        const cameraId = availableDevices[cameraIndex]?.id;
        if (!cameraId) {
          setError("Camera not available");
          setIsLoading(false);
          return;
        }

        // Use a large scan area (85% of size) for easy detection without precise angling
        const scannerSize = size || 180;
        const scanRegionSize = Math.floor(scannerSize * 0.85);
        const qrboxSize = { width: scanRegionSize, height: scanRegionSize };

        const config: Html5QrcodeCameraScanConfig = {
          fps: 10,
          qrbox: qrboxSize,
        };

        return html5QrCode.start(
          cameraId,
          config,
          (decodedText) => {
            if (!(isMounted && isWaitCompleteRef.current)) return;
            isWaitCompleteRef.current = false;

            if (navigator.vibrate) {
              navigator.vibrate(VIBRATION_DURATION_MS);
            }

            if (onBarcodeScannedRef.current) {
              onBarcodeScannedRef.current(decodedText);
            }

            setTimeout(() => {
              if (isMounted) {
                isWaitCompleteRef.current = true;
              }
            }, scanDelay);
          },
          () => {} // Silent non-match
        );
      })
      .then(() => {
        if (isMounted) {
          isRunning = true;
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Camera error:", err);
          const errStr = err?.toString() || "";
          if (errStr.includes("NotAllowedError")) {
            setError("Camera permission denied");
          } else if (
            errStr.includes("NotFoundError") ||
            errStr.includes("secure context")
          ) {
            setError("Camera requires HTTPS");
          } else {
            setError("Camera error");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current && isRunning) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear())
          .catch(() => {
            // Ignore cleanup errors
          });
      } else if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.clear();
        } catch {
          // Ignore
        }
      }
    };
  }, [cameraNumber, scanDelay, size]);

  const toggleCamera = () => {
    setCameraNumber((prev) => (prev + 1) % Math.max(devices.length, 1));
  };

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-black", className)}
      style={size ? { width: size, height: size } : {}}
    >
      {/* Camera view */}
      <div className="h-full w-full" id="qr-reader" ref={qrRegionRef} />

      {/* Scan Region Overlay - Removed as per user request */}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/80">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="text-white text-xs">Starting camera...</span>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/90 p-2">
          <AlertCircle className="h-5 w-5 text-white" />
          <span className="text-center text-white text-xs">{error}</span>
          <Button
            className="mt-1 h-6 px-2 text-xs"
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
            size="sm"
            variant="secondary"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Camera switch button */}
      {devices.length > 1 && !isLoading && !error && (
        <Button
          className="absolute top-1 right-1 h-6 w-6 p-0"
          onClick={toggleCamera}
          size="icon"
          variant="secondary"
        >
          <Camera className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
