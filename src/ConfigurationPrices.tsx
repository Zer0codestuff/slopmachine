import { useState } from 'react';
import { ArrowUpRight, Download } from 'lucide-react';
import { download, identity, number } from './data';
import type { Media } from './types';

export interface PricingFamily {
  id: string;
  media: Media;
  name: string;
  provider: string;
  dimension: 'quality' | 'resolution' | 'mode';
  context: string;
  unit: 'image' | 'second';
  sourceUrl: string;
  observedAt: string;
  note: string;
  points: { label: string; price: number }[];
}

export function ConfigurationPrices({ families, media }: { families: PricingFamily[]; media: Media }) {
  const available = families.filter(family => family.media === media);
  const [id, setId] = useState(available[0]?.id);
  const family = available.find(candidate => candidate.id === id) ?? available[0];
  if (!family) return <p className="intro">No provider configuration quotes are available for this media type.</p>;
  const maximum = Math.max(...family.points.map(point => point.price));
  const price = (value: number) => `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(value)}`;
  const exportCsv = () => {
    const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [['model', 'provider', 'dimension', 'setting', 'priceUsd', 'unit', 'configuration', 'note', 'sourceUrl', 'observedAt', 'benchmarkScore'], ...family.points.map(point => [family.name, family.provider, family.dimension, point.label, point.price, family.unit, family.context, family.note, family.sourceUrl, family.observedAt, 'Unavailable'])];
    download(new Blob([rows.map(row => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `slop-machine-pricing-${family.id}.csv`);
  };
  return <>
    <p className="intro">Published provider configuration prices, shown separately from benchmark observations. These quotes have no attached quality ranking.</p>
    <label className="task-select"><span>Model and pricing configuration</span><select aria-label="Provider pricing configuration" value={family.id} onChange={event => setId(event.target.value)}>{available.map(option => <option key={option.id} value={option.id}>{option.name} · {option.context}</option>)}</select></label>
    <div className="pricing-chart" role="img" aria-label={`${family.name}, USD per ${family.unit}, ${family.context}. ${family.points.map(point => `${point.label}: ${price(point.price)}`).join('; ')}`}>
      <div className="configuration-summary"><span>{family.dimension} setting</span><span>USD / {family.unit}</span></div>
      {family.points.map(point => <div className="pricing-row" key={point.label}><span>{point.label}</span><div><i style={{ width: `${maximum ? point.price / maximum * 100 : 0}%`, background: identity(family.provider)[0] }} /></div><b>{price(point.price)}</b></div>)}
    </div>
    <p className="intro">{family.context}. {family.note}</p>
    <p className="fineprint">Observed {new Date(family.observedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}. {number(family.points.length)} quoted settings.</p>
    <a className="text-link" href={family.sourceUrl} target="_blank" rel="noreferrer">{family.provider} pricing source <ArrowUpRight size={12} /></a>
    <button className="text-link pricing-export" onClick={exportCsv}><Download size={12} />Download quoted settings CSV</button>
  </>;
}
