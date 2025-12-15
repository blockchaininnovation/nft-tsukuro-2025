import { useEffect, useRef, useState } from 'react';
import { BaseRenderer } from '../renderers/BaseRenderer';
import { Team0Renderer } from '../renderers/Team0Renderer';
import { Team1Renderer } from '../renderers/Team1Renderer';
import { Team2Renderer } from '../renderers/Team2Renderer';
import { Team3Renderer } from '../renderers/Team3Renderer';
import { isRevealed } from '../utils/constants';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';

interface NFTCanvasProps {
  team: number;
  variant?: number;
  serial?: string;
  revealed?: boolean;
}

function createRenderer(
  canvas: HTMLCanvasElement,
  team: number,
  variant?: number,
  serial?: string,
  revealed?: boolean
): BaseRenderer {
  const config = {
    canvas,
    team,
    variant,
    serial,
    isRevealed: revealed !== undefined ? revealed : isRevealed(),
  };

  switch (team) {
    case 0:
      return new Team0Renderer(config);
    case 1:
      return new Team1Renderer(config);
    case 2:
      return new Team2Renderer(config);
    case 3:
      return new Team3Renderer(config);
    default:
      throw new Error(`Invalid team: ${team}`);
  }
}

export function NFTCanvas({ team, variant, serial, revealed }: NFTCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError(null);

    const renderer = createRenderer(canvas, team, variant, serial, revealed);

    renderer
      .loadAndRender()
      .then(() => {
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error('Rendering error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [team, variant, serial, revealed]);

  return (
    <div className="viewer-container">
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      <canvas
        ref={canvasRef}
        className="nft-canvas"
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
}
