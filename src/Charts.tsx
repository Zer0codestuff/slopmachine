import { useEffect, useRef, useState } from 'react';
import { frontier, identity, money, number, shortName } from './data';
import type { Leaderboard, Model } from './types';

function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 580 });
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, ...size };
}

interface Props {
  models: Model[];
  board: Leaderboard;
  log: boolean;
  pareto: boolean;
  labels: boolean;
  confidence: boolean;
  onInspect: (model: Model) => void;
}

export function ScatterChart({ models, board, log, pareto, labels, confidence, onInspect }: Props) {
  const { ref, width, height } = useSize();
  const [hovered, setHovered] = useState<string | null>(null);
  const data = models.filter(m => m.price !== null && (log ? m.price > 0 : m.price >= 0));
  const compact = width < 640;
  const left = compact ? 43 : 64;
  const right = labels ? compact ? 132 : Math.min(230, width * 0.25) : 24;
  const top = 40;
  const bottom = height - 62;
  const plotRight = width - right;
  const prices = data.map(m => m.price!);
  const minimum = Math.min(...prices, Infinity);
  const maximum = Math.max(...prices, 0);
  const xmin = log ? minimum * 0.65 : 0;
  const xmax = Math.max(maximum * (log ? 1.6 : 1.15), 0.001);
  const scores = data.flatMap(m => [confidence ? m.confidenceLow ?? m.score : m.score, confidence ? m.confidenceHigh ?? m.score : m.score]);
  const minScore = Math.min(...scores, 1000);
  const maxScore = Math.max(...scores, 1000);
  const step = maxScore - minScore > 600 ? 200 : maxScore - minScore > 300 ? 100 : 50;
  const ymin = Math.floor((minScore - step * 0.4) / step) * step;
  const ymax = Math.ceil((maxScore + step * 0.4) / step) * step;
  const x = (v: number) => left + ((log ? Math.log(v) - Math.log(xmin) : v - xmin) / (log ? Math.log(xmax) - Math.log(xmin) : xmax - xmin)) * (plotRight - left);
  const y = (v: number) => bottom - ((v - ymin) / (ymax - ymin)) * (bottom - top);
  const yticks = Array.from({ length: Math.round((ymax - ymin) / step) + 1 }, (_, i) => ymin + i * step);
  let xticks = log ? [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].filter(v => v >= xmin && v <= xmax) : Array.from({ length: 6 }, (_, i) => xmax * i / 5);
  const maxTicks = compact ? 3 : 9;
  if (xticks.length > maxTicks) xticks = Array.from({ length: maxTicks }, (_, index) => xticks[Math.round(index * (xticks.length - 1) / (maxTicks - 1))]);
  const labelData = [...data].sort((a, b) => b.score - a.score).slice(0, Math.max(1, Math.floor((bottom - top) / 23)));
  const labelY = new Map<string, number>();
  let previousY = top - 24;
  labelData.forEach(m => { const pos = Math.max(y(m.score), previousY + 23); labelY.set(m.id, pos); previousY = pos; });
  let nextY = bottom + 23;
  [...labelData].reverse().forEach(m => { const pos = Math.min(labelY.get(m.id)!, nextY - 23); labelY.set(m.id, pos); nextY = pos; });
  const frontierModels = frontier(data);
  const current = data.find(m => m.id === hovered);
  const active = (m: Model) => !hovered || hovered === m.id;

  return <div className="scatter-container" ref={ref}>
    {data.length ? <svg className="chart-svg" data-export-chart="true" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${board.scoreType} versus cost in USD per ${board.priceUnit}`}>
      <text x={left} y={17} className="axis-title">{board.scoreType} <tspan className="axis-hint">↑ better</tspan></text>
      {yticks.map(t => <g key={t}><line className="gridline" x1={left} x2={plotRight} y1={y(t)} y2={y(t)} /><text className="axis-tick" x={left - 16} y={y(t) + 4} textAnchor="end">{number(t)}</text></g>)}
      <line className="axis-line" x1={left} x2={plotRight} y1={bottom} y2={bottom} />
      {xticks.map(t => <g key={t}><line className="axis-line" x1={x(t)} x2={x(t)} y1={bottom} y2={bottom + 5} /><text className="axis-tick" x={x(t)} y={bottom + 24} textAnchor="middle">{money(t)}</text></g>)}
      <text className="axis-title" x={(left + plotRight) / 2} y={height - 9} textAnchor="middle">Cost per {board.priceUnit} (USD{log ? ', log scale' : ''})</text>
      {pareto && <polyline data-testid="pareto-line" points={frontierModels.map(m => `${x(m.price!)},${y(m.score)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 5" opacity={0.7} />}
      {data.map(m => {
        const [color] = identity(m.provider);
        const px = x(m.price!); const py = y(m.score);
        return <g key={m.id} opacity={active(m) ? 1 : 0.2} className="chart-series">
          {confidence && m.confidenceLow !== null && m.confidenceHigh !== null && <g stroke={color} opacity={0.4}><line x1={px} x2={px} y1={y(m.confidenceLow)} y2={y(m.confidenceHigh)} /><line x1={px - 3} x2={px + 3} y1={y(m.confidenceLow)} y2={y(m.confidenceLow)} /><line x1={px - 3} x2={px + 3} y1={y(m.confidenceHigh)} y2={y(m.confidenceHigh)} /></g>}
          {labels && labelY.has(m.id) && <path d={`M${px + 6},${py} L${plotRight + (compact ? 7 : 14)},${labelY.get(m.id)}`} fill="none" stroke={color} strokeWidth={0.6} opacity={hovered === m.id ? 0.8 : 0.22} />}
          <g role="button" tabIndex={0} aria-label={`${m.name}, ${board.scoreType} ${m.score}, ${money(m.price!)} per ${board.priceUnit}`} onMouseEnter={() => setHovered(m.id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(m.id)} onBlur={() => setHovered(null)} onClick={() => onInspect(m)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onInspect(m); } }} className="chart-point">
            <circle cx={px} cy={py} r={13} fill="transparent" />
            <circle cx={px} cy={py} r={hovered === m.id ? 6 : 4.5} fill={color} stroke="var(--bg)" strokeWidth={1.5} />
            {hovered === m.id && <circle cx={px} cy={py} r={10} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />}
          </g>
          {labels && labelY.has(m.id) && <g className={`series-label ${compact ? 'compact-label' : ''}`} role="button" tabIndex={0} aria-label={`Inspect ${m.name}`} onMouseEnter={() => setHovered(m.id)} onMouseLeave={() => setHovered(null)} onClick={() => onInspect(m)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onInspect(m); } }}>
            <text className="provider-mark" fill={color} x={plotRight + (compact ? 13 : 26)} y={labelY.get(m.id)! + 4}>{identity(m.provider)[1]}</text>
            <text className="model-label" fill={color} x={plotRight + (compact ? 29 : 49)} y={labelY.get(m.id)! + 4}>{(() => { const name = shortName(m.name).replace(/^GPT Image /, compact ? 'GPT Img ' : 'GPT Image '); const max = compact ? 18 : width < 950 ? 22 : 27; return name.length > max ? `${name.slice(0, max - 1)}…` : name; })()}</text>
          </g>}
        </g>;
      })}
    </svg> : <div className="empty-state"><strong>No priced models selected</strong><span>Choose models in the sidebar, or explore the quality ranking.</span></div>}
    {current && <div className="chart-tooltip" role="status"><strong><span className="color-dot" style={{ background: identity(current.provider)[0] }} />{current.name}</strong><div><span>{board.scoreType}</span><b>{number(current.score)}</b></div><div><span>USD / {board.priceUnit}</span><b>{money(current.price!)}</b></div><small>Click for source and pricing details</small></div>}
  </div>;
}

interface BarProps { models: Model[]; board: Leaderboard; cost: boolean; confidence: boolean; quantity: number; onInspect: (m: Model) => void }
export function BarChart({ models, board, cost, confidence, quantity, onInspect }: BarProps) {
  const { ref, width, height } = useSize();
  const data = [...models].filter(m => !cost || m.price !== null).sort((a, b) => cost ? a.price! - b.price! : b.score - a.score);
  const compact = width < 640;
  const labelWidth = compact ? Math.min(156, width * 0.44) : Math.min(250, width * 0.31);
  const left = labelWidth; const right = width - (compact ? 56 : 85);
  const totalHeight = Math.max(height, data.length * (compact ? 38 : 34) + 55);
  const row = (totalHeight - 55) / Math.max(data.length, 1);
  const min = cost ? 0 : Math.floor((Math.min(...data.map(m => m.confidenceLow ?? m.score)) - 50) / 100) * 100;
  const max = cost ? Math.max(...data.map(m => m.price! * quantity), 0.01) * 1.04 : Math.ceil((Math.max(...data.map(m => m.confidenceHigh ?? m.score)) + 30) / 100) * 100;
  const x = (v: number) => left + (v - min) / (max - min) * (right - left);
  return <div className="bars-container" ref={ref}>
    {data.length ? <svg className="bar-svg" data-export-chart="true" viewBox={`0 0 ${width} ${totalHeight}`} style={{ height: totalHeight }} role="img" aria-label={cost ? `Cost per ${quantity} ${board.priceUnit}` : `${board.scoreType} ranking`}>
      {Array.from({ length: 5 }, (_, i) => min + (max - min) * i / 4).map(t => <g key={t}><line className="gridline" x1={x(t)} x2={x(t)} y1={29} y2={totalHeight - 10} /><text className="axis-tick" x={x(t)} y={15} textAnchor="middle">{cost ? money(t) : number(t)}</text></g>)}
      {data.map((m, i) => { const cy = 43 + i * row; const value = cost ? m.price! * quantity : m.score; const [color, mark] = identity(m.provider); return <g role="button" tabIndex={0} aria-label={`Inspect ${m.name}`} className="bar-row" key={m.id} onClick={() => onInspect(m)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onInspect(m); } }}>
        <rect className="bar-hover" x={0} y={cy - 16} width={width} height={row - 2} rx={3} fill="transparent" />
        <text className="rank-number" x={compact ? 0 : 8} y={cy + 4}>{cost ? i + 1 : m.rank}</text>
        {!compact && <text className="provider-mark" x={32} y={cy + 4} fill={color}>{mark}</text>}
        <text className="bar-label" x={compact ? 23 : 58} y={cy + 4}>{shortName(m.name).slice(0, compact ? 20 : 29)}</text>
        <rect x={left} y={cy - 5} width={Math.max(2, x(value) - left)} height={10} rx={1} fill={color} opacity={0.72} />
        {!cost && confidence && m.confidenceLow !== null && m.confidenceHigh !== null && <g stroke={color} strokeWidth={1.5}><line x1={x(m.confidenceLow)} x2={x(m.confidenceHigh)} y1={cy} y2={cy} /><line x1={x(m.confidenceLow)} x2={x(m.confidenceLow)} y1={cy - 6} y2={cy + 6} /><line x1={x(m.confidenceHigh)} x2={x(m.confidenceHigh)} y1={cy - 6} y2={cy + 6} /></g>}
        <text className="bar-value" x={right + 12} y={cy + 4} fill={color}>{cost ? money(value) : number(value)}</text>
      </g>; })}
    </svg> : <div className="empty-state"><strong>No models selected</strong><span>Choose models from the sidebar.</span></div>}
  </div>;
}
