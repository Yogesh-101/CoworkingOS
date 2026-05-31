import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  className?: string;
  height?: number;
}

export function SignaturePad({ onChange, className, height = 140 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.strokeStyle = '#fafafa';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [height]);

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, [syncCanvasSize]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const exportSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) {
      onChange(null);
      return;
    }
    onChange(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onChange(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative rounded-xl border border-zinc-805 bg-zinc-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ height }}
          className="w-full touch-none cursor-crosshair block"
          onPointerDown={(e) => {
            drawing.current = true;
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx) return;
            const p = pos(e);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx) return;
            const p = pos(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            setHasStroke(true);
          }}
          onPointerUp={() => {
            drawing.current = false;
            exportSignature();
          }}
          onPointerLeave={() => {
            if (drawing.current) {
              drawing.current = false;
              exportSignature();
            }
          }}
        />
        {!hasStroke && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-600 pointer-events-none">
            Draw signature here
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 cursor-pointer"
      >
        <Eraser className="w-3.5 h-3.5" />
        Clear signature
      </button>
    </div>
  );
}
