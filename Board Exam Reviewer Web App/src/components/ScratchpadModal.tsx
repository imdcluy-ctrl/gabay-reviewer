import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';
import './ScratchpadModal.css';

interface ScratchpadModalProps {
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#0D7377');
  const [lineWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust resolution for high-DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? 16 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="scratchpad-overlay" onClick={onClose}>
      <div className="scratchpad-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="scratchpad-header">
          <div className="scratchpad-title">
            <span className="scratchpad-icon">📝</span>
            <h3>Math & Computation Scratchpad</h3>
          </div>
          <button className="scratchpad-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="scratchpad-toolbar">
          <div className="color-picker-group">
            <button
              className={`color-btn ${!isEraser && color === '#0D7377' ? 'active' : ''}`}
              style={{ backgroundColor: '#0D7377' }}
              onClick={() => { setColor('#0D7377'); setIsEraser(false); }}
              title="Teal Pen"
            />
            <button
              className={`color-btn ${!isEraser && color === '#1E293B' ? 'active' : ''}`}
              style={{ backgroundColor: '#1E293B' }}
              onClick={() => { setColor('#1E293B'); setIsEraser(false); }}
              title="Dark Pen"
            />
            <button
              className={`color-btn ${!isEraser && color === '#F5A623' ? 'active' : ''}`}
              style={{ backgroundColor: '#F5A623' }}
              onClick={() => { setColor('#F5A623'); setIsEraser(false); }}
              title="Gold Pen"
            />
            <button
              className={`color-btn ${!isEraser && color === '#EF4444' ? 'active' : ''}`}
              style={{ backgroundColor: '#EF4444' }}
              onClick={() => { setColor('#EF4444'); setIsEraser(false); }}
              title="Red Pen"
            />
          </div>

          <div className="tool-btn-group">
            <Button
              variant={isEraser ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsEraser(!isEraser)}
            >
              {isEraser ? '✏️ Pen Mode' : '🧹 Eraser'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleClear}>
              🗑️ Clear Canvas
            </Button>
          </div>
        </div>

        {/* Canvas Work Area */}
        <div className="scratchpad-canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="scratchpad-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};
