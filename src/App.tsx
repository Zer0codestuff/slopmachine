import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowDownToLine, ArrowUpRight, Check, ChevronDown, Download, Film, ImageIcon, Info, Moon, MoreHorizontal, RotateCcw, Search, SlidersHorizontal, Sun, X } from 'lucide-react';
import { BarChart, ScatterChart } from './Charts';
import { ConfigurationPrices } from './ConfigurationPrices';
import type { PricingFamily } from './ConfigurationPrices';
import configurationPrices from '../research/configuration-prices.json';
import { audioCondition, defaultSelection, download, identity, matchesModelQuery, money, number, preferredMediaBoard, taskFamily } from './data';
import { configurationFor, configurationOptions, modelGroups, settingKey, unclassifiedSetting } from './configurations';
import type { Catalog, Leaderboard, Media, Model, View } from './types';

const views: [View, string][] = [['scatter', 'Cost vs quality'], ['quality', 'Quality ranking'], ['cost', 'Generation cost'], ['table', 'All data']];
const date = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const external = { target: '_blank', rel: 'noreferrer' };

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="modal" aria-label={title} onClose={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></div>
    {children}
  </dialog>;
}

function ModelDetail({ model, board, onClose, onInspect }: { model: Model; board: Leaderboard; onClose: () => void; onInspect: (model: Model) => void }) {
  const [color, mark] = identity(model.provider);
  const configuration = configurationFor(board, model.id);
  return <Modal title={model.name} onClose={onClose}>
    <p className="detail-provider"><span className="provider-mark" style={{ color }}>{mark}</span>{model.provider}<span className="tag">{board.shortTask}</span></p>
    <div className="detail-stats"><div><span>{board.scoreType}</span><strong>{number(model.score)}</strong></div><div><span>Source rank</span><strong>#{model.rank}</strong></div><div><span>USD / {board.priceUnit}</span><strong>{model.price !== null ? money(model.price) : 'N/A'}</strong></div></div>
    <dl className="detail-list"><div><dt>Confidence interval</dt><dd>{model.confidenceLow !== null && model.confidenceHigh !== null ? `${number(model.confidenceLow)} to ${number(model.confidenceHigh)}` : 'Not reported'}</dd></div><div><dt>Votes / samples</dt><dd>{model.votes !== null ? number(model.votes) : 'Not reported'}</dd></div><div><dt>Source</dt><dd><a href={board.sourceUrl} {...external}>{board.sourceName}<ArrowUpRight size={12} /></a></dd></div><div><dt>Observed</dt><dd>{date(board.observedAt)}</dd></div>{board.sourceUpdatedAt && <div><dt>Leaderboard published</dt><dd>{date(board.sourceUpdatedAt)}</dd></div>}</dl>
    {configuration && <div className="configuration-table"><h3>{configuration.series.name} · {configuration.series.dimension}</h3><div className="configuration-summary"><span>Setting</span><span>{board.scoreType} / USD per {board.priceUnit}</span></div>{[...configuration.series.points].sort((a, b) => a.order - b.order).map(point => { const entry = board.entries.find(candidate => candidate.id === point.modelId)!; return <button className={entry.id === model.id ? 'current' : ''} key={point.modelId} onClick={() => onInspect(entry)}><span>{point.label}</span><span>{number(entry.score)}</span><span>{entry.price === null ? 'N/A' : money(entry.price)}</span></button>; })}<p className="fineprint">{configuration.series.note}</p>{configuration.series.sourceUrls.map(url => <a className="text-link" href={url} {...external} key={url}>Configuration source <ArrowUpRight size={11} /></a>)}</div>}
    <div className="method-note"><h3>Pricing conditions</h3><p>{model.priceNote || (model.price === null ? 'This source does not report a matched price for this model. It is excluded from cost charts.' : `Price reported by ${board.sourceName}, normalized to one ${board.priceUnit}.`)}</p>{model.priceSourceUrl && <a href={model.priceSourceUrl} {...external}>View price source <ArrowUpRight size={12} /></a>}</div>
    <p className="fineprint">Elo measures preference within this benchmark. Scores from other tasks or arenas use different scales.</p>
    {model.modelUrl && <a className="text-link" href={model.modelUrl} {...external}>Model details <ArrowUpRight size={13} /></a>}
  </Modal>;
}

function Sources({ catalog, board, onClose }: { catalog: Catalog; board: Leaderboard; onClose: () => void }) {
  return <Modal title="Sources & methodology" onClose={onClose}>
    <p className="intro">Public leaderboard snapshots, collected from the source websites. Every chart uses one source, one task, and one benchmark pool.</p>
    <div className="source-list">{catalog.leaderboards.map(b => <a key={b.id} href={b.sourceUrl} {...external}><div><strong>{b.sourceName}</strong><span>{b.task}</span></div><div><b>{b.entries.length} models</b>{b.sourceUpdatedAt && <span>Published {date(b.sourceUpdatedAt)}</span>}<span>Observed {date(b.observedAt)}</span></div><ArrowUpRight size={14} /></a>)}</div>
    <div className="method-note"><h3>Reading this chart</h3><p>Higher Elo means stronger human preference in this particular arena. Confidence intervals describe rating uncertainty. Overlapping intervals mean the order may be uncertain.</p><p>Solid lines connect explicitly documented configurations of the same model, in setting order. Each point has its own measured score and price. Lines are visual guides, with no measured result between points. Quality, resolution, and generation mode are separate dimensions. Unspecified means no configuration metadata is attached.</p><p>The Pareto line connects the selected models for which no other selected model is both cheaper and at least as highly rated. It uses point estimates, without adjusting for rating uncertainty.</p><p>Image prices are per image. Video prices are per second of generated video. Published prices are normalized to those units, and the original generation settings remain attached to each model.</p><p>Unavailable prices stay unavailable. Cost estimates multiply a listed unit price by a quantity; minimum billing, input charges, retries, and provider-specific discounts may change your bill.</p>{board.notes.map((note, i) => <p key={i}>{note}</p>)}<a href={board.methodologyUrl} {...external}>{board.sourceName} methodology <ArrowUpRight size={12} /></a></div>
    <p className="fineprint">Independent project. Not affiliated with the benchmark providers or Slopalytics. Visual direction inspired by <a href="https://slopalytics.com/" {...external}>Slopalytics</a>. The <a href="https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset" {...external}>Arena Leaderboard Dataset</a> is attributed under <a href="https://creativecommons.org/licenses/by/4.0/" {...external}>CC BY 4.0</a>, filtered and reformatted here. Source data retains its original terms.</p>
  </Modal>;
}

function DataTable({ models, board, onInspect }: { models: Model[]; board: Leaderboard; onInspect: (m: Model) => void }) {
  const [sort, setSort] = useState<'rank' | 'name' | 'score' | 'price' | 'votes'>('rank');
  const [ascending, setAscending] = useState(true);
  const sorted = [...models].sort((a, b) => {
    if (sort === 'price' || sort === 'votes') { if (a[sort] === null && b[sort] === null) return 0; if (a[sort] === null) return 1; if (b[sort] === null) return -1; }
    const value = sort === 'name' ? a.name.localeCompare(b.name) : (a[sort] ?? 0) as number - ((b[sort] ?? 0) as number);
    return ascending ? value : -value;
  });
  function changeSort(key: typeof sort) { if (key === sort) setAscending(!ascending); else { setSort(key); setAscending(key !== 'score' && key !== 'votes'); } }
  const head = (key: typeof sort, label: string) => <button onClick={() => changeSort(key)}>{label}{sort === key && <ArrowDown size={11} style={{ transform: ascending ? 'none' : 'rotate(180deg)' }} />}</button>;
  return <div className="table-wrap"><table><thead><tr><th>{head('rank', '#')}</th><th>{head('name', 'Model')}</th><th>{head('score', board.scoreType)}</th><th>CI</th><th>{head('votes', 'Votes / samples')}</th><th>{head('price', `USD / ${board.priceUnit}`)}</th></tr></thead><tbody>{sorted.map(m => <tr key={m.id}><td className="muted">{m.rank}</td><td><button className="table-model" onClick={() => onInspect(m)}><span className="provider-mark" style={{ color: identity(m.provider)[0] }}>{identity(m.provider)[1]}</span><span>{m.name}<small>{m.provider}{configurationFor(board, m.id) ? ` · ${configurationFor(board, m.id)!.point.label}` : ''}</small></span></button></td><td className="score-cell">{number(m.score)}</td><td className="muted">{m.confidenceLow !== null && m.confidenceHigh !== null ? `${number(m.confidenceLow)} to ${number(m.confidenceHigh)}` : 'N/A'}</td><td className="muted">{m.votes !== null ? number(m.votes) : 'N/A'}</td><td>{m.price !== null ? money(m.price) : <span className="muted">Unavailable</span>}</td></tr>)}</tbody></table>{!models.length && <div className="empty-state"><strong>No models selected</strong><span>Choose models in the sidebar.</span></div>}</div>;
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [boardId, setBoardId] = useState(() => new URLSearchParams(location.search).get('board') || '');
  const [view, setView] = useState<View>(() => { const v = new URLSearchParams(location.search).get('view'); return views.some(([key]) => key === v) ? v as View : 'scatter'; });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [log, setLog] = useState(true);
  const [pareto, setPareto] = useState(false);
  const [labels, setLabels] = useState(true);
  const [confidence, setConfidence] = useState(false);
  const [connected, setConnected] = useState(true);
  const [enabledSettings, setEnabledSettings] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('slop-theme') || 'dark'; } catch { return 'dark'; } });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => matchMedia('(max-width: 900px)').matches);
  const [showSources, setShowSources] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [inspected, setInspected] = useState<Model | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState('');
  const [retry, setRetry] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDetailsElement>(null);
  const pendingModelRef = useRef<string | null>(null);
  const mediaHistoryRef = useRef<Partial<Record<Media, string>>>({});
  const sourceHistoryRef = useRef(new Map<string, string>());
  const board = catalog?.leaderboards.find(b => b.id === boardId) ?? catalog?.leaderboards[0];

  useEffect(() => {
    const controller = new AbortController();
    setLoadError(false);
    fetch(`${import.meta.env.BASE_URL}data/catalog.json`, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Snapshot unavailable'); return response.json(); }).then((data: Catalog) => { if (!data.leaderboards?.length) throw new Error('No leaderboards'); setCatalog(data); }).catch(error => { if (error.name !== 'AbortError') setLoadError(true); });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('slop-theme', theme); } catch { /* Storage can be disabled. */ } }, [theme]);
  useEffect(() => {
    const mediaQuery = matchMedia('(max-width: 900px)');
    const change = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', change);
    return () => mediaQuery.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!isMobile || !filtersOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    searchRef.current?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = [...document.querySelectorAll<HTMLElement>('.sidebar button, .sidebar input, .sidebar select')].filter(item => !item.hasAttribute('disabled') && item.getBoundingClientRect().width > 0);
      const first = items[0]; const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); previous?.focus(); };
  }, [isMobile, filtersOpen]);
  useEffect(() => {
    if (!board) return;
    const requested = pendingModelRef.current;
    const initial = requested ? new Set([requested]) : view === 'table' ? new Set(board.entries.map(model => model.id)) : defaultSelection(board.entries, board.series);
    mediaHistoryRef.current[board.media] = board.id;
    sourceHistoryRef.current.set(`${board.sourceName}:${taskFamily(board)}`, board.id);
    if (requested) configurationFor(board, requested)?.series.points.forEach(point => initial.add(point.modelId));
    pendingModelRef.current = null;
    setSelected(initial);
    setEnabledSettings(new Set(configurationOptions(board).map(option => option.key)));
    setQuery(''); setInspected(null); setQuantity(1);
    if (!board.entries.some(m => m.price !== null)) setView(v => v === 'scatter' || v === 'cost' ? 'quality' : v);
  }, [board?.id]);
  useEffect(() => { if (!board) return; const url = new URL(location.href); url.searchParams.set('board', board.id); url.searchParams.set('view', view); history.replaceState(null, '', url); }, [board?.id, view]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setFiltersOpen(true); requestAnimationFrame(() => searchRef.current?.focus()); }
      if (e.key === 'Escape') { setFiltersOpen(false); settingsRef.current?.removeAttribute('open'); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { const close = (e: MouseEvent) => { if (!settingsRef.current?.contains(e.target as Node)) settingsRef.current?.removeAttribute('open'); }; document.addEventListener('click', close); return () => document.removeEventListener('click', close); }, []);

  if (!catalog || !board) return <div className="loading-screen"><a className="brand" href="./"><span>slop</span>machine</a><div><strong>{loadError ? 'The benchmark snapshot could not be loaded.' : 'Loading benchmark snapshot...'}</strong>{loadError && <button className="text-link" onClick={() => setRetry(retry + 1)}>Try again</button>}</div></div>;

  const boards = catalog.leaderboards.filter(b => b.media === board.media);
  const sources = [...new Set(boards.map(b => b.sourceName))];
  const sourceBoards = boards.filter(b => b.sourceName === board.sourceName);
  const options = configurationOptions(board);
  const settingFor = (model: Model) => { const configuration = configurationFor(board, model.id); return configuration ? settingKey(configuration.point.label) : unclassifiedSetting; };
  const models = board.entries.filter(model => selected.has(model.id) && enabledSettings.has(settingFor(model)));
  const priced = models.filter(m => m.price !== null);
  const availablePrices = board.entries.some(m => m.price !== null);
  const sourceQualification = board.sourceName === 'Artificial Analysis' && board.media === 'image'
    ? 'Representative API price quotes; evaluated image resolution can differ.'
    : board.id === 'aa-video-i2v-silent-v1-0'
      ? 'Kling 3.0 AA quotes differ from the creator list. Open a point for pricing conditions.'
      : board.sourceName === 'Design Arena'
    ? 'Pricing quotes have unspecified resolution and generation settings.'
    : board.sourceName === 'World Model Arena'
      ? 'First-person world models. Small battle counts; no reported confidence intervals.'
      : board.sourceName === 'Video Arena (MemeBench)'
        ? 'Silent Chinese meme clips. Source 720p pricing with model-specific exceptions.'
        : board.sourceName === 'Arena' && board.media === 'video'
          ? 'Arena overall pool; the source does not specify an audio policy.'
          : '';
  const matching = board.entries.filter(m => matchesModelQuery(`${m.name} ${m.provider} ${configurationFor(board, m.id)?.series.name ?? ''}`, query));
  const otherPools = query.trim() ? catalog.leaderboards.filter(pool => pool.id !== board.id).flatMap(pool => { const entries = pool.entries.filter(model => matchesModelQuery(`${model.name} ${model.provider}`, query)); return entries.length ? [{ pool, entries }] : []; }) : [];
  const providers = [...new Set(matching.map(m => m.provider))];
  const zeroPricesOnLog = view === 'scatter' && log ? priced.filter(model => model.price === 0).length : 0;
  const shown = view === 'scatter' || view === 'cost' ? priced.length - zeroPricesOnLog : models.length;
  const unpriced = (view === 'scatter' || view === 'cost') ? models.length - priced.length : 0;
  const allSelected = board.entries.every(m => selected.has(m.id));
  const selectedFamilies = modelGroups(board.entries.filter(model => selected.has(model.id)), board.series).length;
  const visibleCurves = modelGroups(priced.filter(model => !log || model.price! > 0), board.series).filter(group => group.series && group.models.length >= 2).length;
  const chooseMedia = (media: Media) => { if (media === board.media) return; const remembered = catalog.leaderboards.find(candidate => candidate.id === mediaHistoryRef.current[media]); const next = remembered ?? preferredMediaBoard(catalog.leaderboards, media, board.sourceName); if (next) setBoardId(next.id); };
  const revealModel = (pool: Leaderboard, model: Model) => {
    pendingModelRef.current = model.id;
    if (model.price === null && (view === 'scatter' || view === 'cost')) setView('quality');
    if (model.price === 0) setLog(false);
    setBoardId(pool.id);
    setFiltersOpen(false);
    setToast(`${model.name} · ${pool.sourceName} · ${pool.shortTask}`);
  };
  const chooseSource = (sourceName: string) => {
    const candidates = boards.filter(candidate => candidate.sourceName === sourceName);
    const matchingTask = candidates.filter(candidate => taskFamily(candidate) === taskFamily(board));
    const remembered = matchingTask.find(candidate => candidate.id === sourceHistoryRef.current.get(`${sourceName}:${taskFamily(board)}`));
    const next = remembered ?? matchingTask.find(candidate => audioCondition(candidate) === audioCondition(board)) ?? matchingTask[0] ?? candidates[0];
    if (next) setBoardId(next.id);
  };
  const chooseView = (next: View) => { if (next === 'table') { setSelected(new Set(board.entries.map(model => model.id))); setEnabledSettings(new Set(options.map(option => option.key))); setQuery(''); } setView(next); };
  const toggleGroup = (provider: string) => setSelected(prev => { const group = matching.filter(m => m.provider === provider); const next = new Set(prev); const on = group.every(m => next.has(m.id)); group.forEach(m => on ? next.delete(m.id) : next.add(m.id)); return next; });
  const reset = () => { setSelected(defaultSelection(board.entries, board.series)); setEnabledSettings(new Set(options.map(option => option.key))); setQuery(''); };
  const toggleSetting = (key: string) => setEnabledSettings(previous => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  const toggleFamily = (entries: Model[]) => setSelected(previous => { const next = new Set(previous); const enabled = entries.every(entry => next.has(entry.id)); entries.forEach(entry => enabled ? next.delete(entry.id) : next.add(entry.id)); return next; });
  const exportCsv = () => {
    const fields: (keyof Model)[] = ['rank', 'name', 'provider', 'score', 'confidenceLow', 'confidenceHigh', 'votes', 'price', 'priceUnit', 'priceNote', 'priceSourceUrl'];
    const metadata = ['sourceName', 'sourceUrl', 'task', 'scoreType', 'observedAt', 'sourceUpdatedAt'] as const;
    const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const attribution = board.sourceName === 'Arena'
      ? ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 'Source columns filtered and reformatted; scores unchanged.']
      : ['', '', 'Source columns reformatted; quoted prices normalized to the stated unit.'];
    const csv = [[...metadata, ...fields, 'configurationSeries', 'configurationSetting', 'configurationDimension', 'configurationNote', 'configurationSources', 'dataLicense', 'dataLicenseUrl', 'changes'].join(','), ...models.map(model => [...metadata.map(field => quote(board[field])), ...fields.map(field => quote(model[field])), ...(() => { const configuration = configurationFor(board, model.id); return [configuration?.series.name, configuration?.point.label, configuration?.series.dimension, configuration?.series.note, configuration?.series.sourceUrls.join(' ')].map(quote); })(), ...attribution.map(quote)].join(','))].join('\r\n');
    download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `slop-machine-${board.id}.csv`);
    setToast('CSV downloaded');
  };
  const exportPng = async () => {
    const original = document.querySelector<SVGSVGElement>('[data-export-chart]');
    if (!original) { exportCsv(); return; }
    try {
      const clone = original.cloneNode(true) as SVGSVGElement;
      const originals = [original, ...original.querySelectorAll('*')];
      const clones = [clone, ...clone.querySelectorAll('*')];
      originals.forEach((el, i) => { const computed = getComputedStyle(el); for (const prop of ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity', 'font-size', 'font-weight', 'font-family', 'paint-order', 'stroke-linejoin']) (clones[i] as SVGElement).style.setProperty(prop, computed.getPropertyValue(prop)); });
      const box = original.viewBox.baseVal;
      clone.setAttribute('width', String(box.width)); clone.setAttribute('height', String(box.height)); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(blob);
      try {
        const img = new Image(); img.src = svgUrl; await img.decode();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const wrap = (text: string, font: string) => {
          ctx.font = font;
          const lines: string[] = [];
          let line = '';
          for (const character of text) {
            if (ctx.measureText(line + character).width > box.width - 48 && line) {
              const space = line.lastIndexOf(' ');
              if (space > line.length / 2) { lines.push(line.slice(0, space)); line = line.slice(space + 1); }
              else { lines.push(line); line = ''; }
            }
            line += character;
          }
          if (line) lines.push(line);
          return lines;
        };
        const titleFont = '500 17px "DM Sans Variable", sans-serif';
        const bodyFont = '11px "DM Sans Variable", sans-serif';
        const quantityUnit = board.priceUnit === 'image' ? quantity === 1 ? 'image' : 'images' : quantity === 1 ? 'second' : 'seconds';
        const title = `slopmachine / ${views.find(([key]) => key === view)![1]}${view === 'cost' ? ` / ${number(quantity)} ${quantityUnit}` : ''}`;
        const titleLines = wrap(title, titleFont);
        const contextLines = wrap(`${board.sourceName} | ${board.task} | ${board.scoreType}`, bodyFont);
        const qualificationLines = [
          ...(sourceQualification ? wrap(sourceQualification, bodyFont) : []),
          ...(board.series?.length ? wrap(`Settings: ${options.filter(option => enabledSettings.has(option.key)).map(option => option.label).join(', ') || 'none'}${view === 'scatter' && connected ? ' | Solid lines connect measured configurations of one model; no interpolation is benchmarked.' : ''}`, bodyFont) : []),
        ];
        const footerLines = [
          ...wrap(`Observed ${date(board.observedAt)}${board.sourceUpdatedAt ? ` | published ${date(board.sourceUpdatedAt)}` : ''}`, bodyFont),
          ...wrap(`Source: ${board.sourceUrl}`, bodyFont),
          ...(board.sourceName === 'Arena' ? wrap('Arena (lmarena-ai), CC BY 4.0. Filtered and reformatted. https://creativecommons.org/licenses/by/4.0/', bodyFont) : []),
        ];
        const chartTop = 24 + titleLines.length * 24 + (contextLines.length + qualificationLines.length) * 16 + 14;
        const totalHeight = chartTop + box.height + 25 + footerLines.length * 16;
        canvas.width = Math.ceil(box.width * 2); canvas.height = Math.ceil(totalHeight * 2);
        ctx.scale(2, 2);
        const styles = getComputedStyle(document.documentElement);
        ctx.fillStyle = styles.getPropertyValue('--bg'); ctx.fillRect(0, 0, box.width, totalHeight);
        let lineY = 28;
        ctx.fillStyle = styles.getPropertyValue('--fg'); ctx.font = titleFont;
        titleLines.forEach(line => { ctx.fillText(line, 24, lineY); lineY += 24; });
        ctx.fillStyle = styles.getPropertyValue('--fg2'); ctx.font = bodyFont;
        [...contextLines, ...qualificationLines].forEach(line => { ctx.fillText(line, 24, lineY); lineY += 16; });
        ctx.drawImage(img, 0, chartTop);
        lineY = chartTop + box.height + 15;
        ctx.fillStyle = styles.getPropertyValue('--fg3'); ctx.font = bodyFont;
        footerLines.forEach(line => { ctx.fillText(line, 24, lineY); lineY += 16; });
        canvas.toBlob(result => { if (result) { download(result, `slop-machine-${board.id}-${view}${view === 'cost' ? `-${quantity}` : ''}.png`); setToast('Chart downloaded'); } else setToast('Export failed. Try CSV from the menu.'); }, 'image/png');
      } finally { URL.revokeObjectURL(svgUrl); }
    } catch { setToast('Export failed. Try CSV from the menu.'); }
  };

  return <div className="app">
    <header className="app-header">
      <a href="./" className="brand" aria-label="Slop Machine home"><span>slop</span>machine</a>
      <nav className="media-tabs" aria-label="Media type"><button className={board.media === 'image' ? 'active' : ''} aria-pressed={board.media === 'image'} onClick={() => chooseMedia('image')}><ImageIcon size={13} />Images</button><button className={board.media === 'video' ? 'active' : ''} aria-pressed={board.media === 'video'} onClick={() => chooseMedia('video')}><Film size={13} />Video</button></nav>
      <nav className="view-tabs" aria-label="Chart views">{views.map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} aria-pressed={view === key} disabled={(key === 'scatter' || key === 'cost') && !availablePrices} title={(key === 'scatter' || key === 'cost') && !availablePrices ? 'This source does not report prices' : undefined} onClick={() => chooseView(key)}>{label}</button>)}</nav>
      <div className="header-actions"><button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button><button className="icon-button desktop-export" aria-label={view === 'table' ? 'Download CSV' : 'Download PNG'} title="Download chart" onClick={exportPng}><ArrowDownToLine size={16} /></button><details ref={settingsRef} className="settings"><summary aria-label="Chart settings"><MoreHorizontal size={19} /></summary><div className="settings-popover"><span className="control-label">Chart display</span><button className="check-button" role="checkbox" aria-checked={labels} onClick={() => setLabels(!labels)}><span className={`checkbox ${labels ? 'checked' : ''}`}>{labels && <Check size={10} />}</span>Model labels</button><button className="check-button" role="checkbox" aria-checked={confidence} onClick={() => setConfidence(!confidence)}><span className={`checkbox ${confidence ? 'checked' : ''}`}>{confidence && <Check size={10} />}</span>Confidence intervals</button><button className="check-button" role="checkbox" aria-checked={connected} onClick={() => setConnected(!connected)}><span className={`checkbox ${connected ? 'checked' : ''}`}>{connected && <Check size={10} />}</span>Connect configurations</button><button className="check-button" role="checkbox" aria-checked={pareto} onClick={() => setPareto(!pareto)}><span className={`checkbox ${pareto ? 'checked' : ''}`}>{pareto && <Check size={10} />}</span>Pareto line</button><div className="menu-divider" /><button onClick={exportCsv}><Download size={13} />Download selected CSV</button><button onClick={() => { download(new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' }), 'slop-machine-catalog.json'); setToast('Catalog downloaded'); }}><Download size={13} />Download full dataset</button><button onClick={() => { setShowSources(true); settingsRef.current?.removeAttribute('open'); }}><Info size={13} />Sources & methodology</button><a href="https://github.com/Zer0codestuff/slopmachine" {...external}>GitHub repository <ArrowUpRight size={13} /></a></div></details><button className="mobile-filter-button" aria-expanded={filtersOpen} aria-controls="model-sidebar" aria-label="Open model filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={15} /><span>Models</span><small>{selectedFamilies}</small></button></div>
    </header>
    <div className="body-layout">
      <main inert={isMobile && filtersOpen}>
        <section className="chart-section" aria-label={views.find(([key]) => key === view)![1]}>
          <div className="chart-heading"><div className="heading-stack"><h1>{views.find(([key]) => key === view)![1]}</h1><div className="benchmark-picker"><label className="benchmark-task"><select aria-label="Benchmark task" value={board.id} onChange={event => setBoardId(event.target.value)}>{sourceBoards.map(pool => <option key={pool.id} value={pool.id}>{pool.shortTask}</option>)}</select><ChevronDown size={13} /></label><button className="benchmark-context" onClick={() => setShowSources(true)}>{board.sourceName}<ArrowUpRight size={12} /></button></div></div><div className="chart-controls">{view === 'scatter' && <><button className="check-button pareto-control" role="checkbox" aria-checked={pareto} onClick={() => setPareto(!pareto)}><span className={`checkbox ${pareto ? 'checked' : ''}`}>{pareto && <Check size={10} />}</span>Pareto line</button><div className="chart-scale" role="group" aria-label="Cost axis scale"><button aria-pressed={!log} onClick={() => setLog(false)}>Linear</button><button aria-pressed={log} onClick={() => setLog(true)}>Log</button></div></>}{view === 'quality' && <button className="check-button" role="checkbox" aria-checked={confidence} onClick={() => setConfidence(!confidence)}><span className={`checkbox ${confidence ? 'checked' : ''}`}>{confidence && <Check size={10} />}</span>CI</button>}{view === 'cost' && <label className="quantity-control">Cost for <input aria-label="Generation quantity" type="number" min="1" max="1000000" step="1" value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(1000000, Number(e.target.value) || 1)))} /><span>{board.priceUnit === 'image' ? quantity === 1 ? 'image' : 'images' : quantity === 1 ? 'second' : 'seconds'}</span></label>}{view === 'table' && <button className="text-link" onClick={exportCsv}><Download size={12} />CSV</button>}</div></div>
          {sourceQualification && <button className="source-qualification" onClick={() => setShowSources(true)}><Info size={11} />{sourceQualification}</button>}
          {unpriced > 0 && <button className="unpriced-notice" onClick={() => setView('quality')}><Info size={13} /><span><strong>{unpriced} {unpriced === 1 ? 'model' : 'models'}</strong> without a reported price.</span><span>Quality ranking <ArrowUpRight size={12} /></span></button>}
          {view === 'scatter' && <ScatterChart models={models} board={board} log={log} pareto={pareto} labels={labels} confidence={confidence} connected={connected} onInspect={setInspected} />}
          {(view === 'quality' || view === 'cost') && <BarChart models={models} board={board} cost={view === 'cost'} confidence={confidence} quantity={quantity} onInspect={setInspected} />}
          {view === 'table' && <DataTable models={models} board={board} onInspect={setInspected} />}
          <div className="chart-caption"><span>{shown} of {board.entries.length} shown{view === 'scatter' && connected && visibleCurves ? ` · ${visibleCurves} model ${visibleCurves === 1 ? 'curve' : 'curves'}` : ''}{unpriced ? ` · ${unpriced} without prices` : ''}{zeroPricesOnLog ? ` · ${zeroPricesOnLog} zero-price hidden on log` : ''}{view === 'quality' ? ' · higher is better' : view === 'scatter' ? ' · upper left is better value' : ''}</span><button onClick={() => setShowSources(true)}>{board.sourceUpdatedAt ? `Published ${date(board.sourceUpdatedAt)}` : `Observed ${date(board.observedAt)}`}<Info size={11} /></button></div>
        </section>
        <footer><span>Data from <a href={board.sourceUrl} {...external}>{board.sourceName}</a><span className="footer-task"> · {board.shortTask}</span></span><div><button onClick={() => setShowSources(true)}>Sources & methodology</button><a href="https://github.com/Zer0codestuff/slopmachine" {...external}>Feed the machine <ArrowUpRight size={10} /></a></div></footer>
      </main>
      {filtersOpen && <button className="sidebar-scrim" aria-label="Close model filters" onClick={() => setFiltersOpen(false)} />}
      <aside id="model-sidebar" className={`sidebar ${filtersOpen ? 'open' : ''}`} aria-label="Model filters" role={isMobile && filtersOpen ? 'dialog' : undefined} aria-modal={isMobile && filtersOpen ? true : undefined} inert={isMobile && !filtersOpen}>
        <div className="side-heading"><h2>Models <span>{selectedFamilies}</span></h2><button className="icon-button reset-button" aria-label="Reset model selection" title="Reset model selection" onClick={reset}><RotateCcw size={13} /></button><button className="icon-button mobile-close" aria-label="Close model filters" onClick={() => setFiltersOpen(false)}><X size={17} /></button></div>
        <label className="search"><Search size={13} /><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find any model" aria-label="Find models" /><kbd>/</kbd></label>
        <div className="filter-group"><h3>Benchmark source</h3><div className="source-switch">{sources.map(source => <button key={source} aria-pressed={source === board.sourceName} onClick={() => chooseSource(source)}>{source === 'Artificial Analysis' ? 'Artificial Analysis' : source}</button>)}</div></div>

        <div className="configuration-filters" hidden={!board.series?.length}><h3>Configurations</h3><div>{options.map(option => <button key={option.key} aria-pressed={enabledSettings.has(option.key)} onClick={() => toggleSetting(option.key)}>{option.label}</button>)}</div></div>
        <div className="selection-actions"><button onClick={() => setSelected(allSelected ? new Set() : new Set(board.entries.map(m => m.id)))}>{allSelected ? 'Clear all' : 'Select all'}</button><span>{board.entries.length} in this pool</span></div>
        <div className="model-groups">{providers.map(provider => <section key={provider} className="model-group"><div className="group-heading"><h3>{provider}</h3><button aria-label={`Toggle all ${provider} models`} onClick={() => toggleGroup(provider)}>{matching.filter(m => m.provider === provider).every(m => selected.has(m.id)) ? 'None' : 'All'}</button></div>{modelGroups(matching.filter(m => m.provider === provider), board.series).map(group => { const [color, mark] = identity(provider); const enabled = group.models.every(model => selected.has(model.id)); const partial = !enabled && group.models.some(model => selected.has(model.id)); return <button className={`model-row ${enabled || partial ? 'selected' : ''}`} key={group.id} aria-pressed={partial ? 'mixed' : enabled} title={group.series ? `${group.name}: ${group.series.points.map(point => point.label).join(', ')}` : `${group.name}${group.models[0].price === null ? ' · No reported price' : ''}`} onClick={() => toggleFamily(group.models)}><span className="provider-mark" style={{ color }}>{mark}</span><span className="model-name">{group.name}</span>{group.series && <span className="configuration-count">{group.models.length > 1 ? `${group.models.length} cfg` : configurationFor(board, group.models[0].id)!.point.label}</span>}<span className="model-dot" style={{ borderColor: color, background: enabled ? color : 'transparent' }} /></button>; })}</section>)}{!matching.length && <div className="search-empty">No matches in this pool.<button onClick={() => setQuery('')}>Clear search</button></div>}</div>
        {otherPools.length > 0 && <section className="cross-pool-results" aria-label="Models in other pools"><h3>Found in other pools</h3>{otherPools.map(({ pool, entries }) => <section key={pool.id}><h4>{pool.sourceName}<span>{pool.shortTask}</span></h4>{entries.map(model => <button key={model.id} onClick={() => revealModel(pool, model)}><span>{model.name}</span><ArrowUpRight size={13} /></button>)}</section>)}</section>}
        <div className="sidebar-bottom"><button onClick={() => setShowPrices(true)}>Unscored settings & prices <ArrowUpRight size={11} /></button><button onClick={() => chooseView('table')}>Explore all data <ArrowUpRight size={11} /></button><span>The price of pixels.</span></div>
      </aside>
    </div>
    {inspected && <ModelDetail model={inspected} board={board} onClose={() => setInspected(null)} onInspect={setInspected} />}
    {showPrices && <Modal title="Unscored settings & prices" onClose={() => setShowPrices(false)}><ConfigurationPrices families={configurationPrices.families as PricingFamily[]} media={board.media} /></Modal>}
    {showSources && <Sources catalog={catalog} board={board} onClose={() => setShowSources(false)} />}
    {toast && <div className="toast" role="status"><Check size={13} />{toast}</div>}
  </div>;
}
