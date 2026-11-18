import { NextResponse } from 'next/server';
export const revalidate = 45;
const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; AgrofinanzasMagoia/1.0)' };
async function getJson(url: string) { const r = await fetch(url, { headers, next: { revalidate: 45 }, signal: AbortSignal.timeout(15000) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function safe<T>(name: string, fn: () => Promise<T>, fallback: T, status: Record<string,string>): Promise<T> { try { const x = await fn(); status[name] = 'Disponible'; return x; } catch (e) { status[name] = 'Sin conexión'; return fallback; } }
export async function GET() {
 const status: Record<string,string> = {};
 const [dollars, notes, bonds, ons, risk, inflation, bcraVars] = await Promise.all([
  safe('Dólares', () => getJson('https://dolarapi.com/v1/dolares'), [], status),
  safe('Letras', () => getJson('https://data912.com/live/arg_notes'), [], status),
  safe('Bonos', () => getJson('https://data912.com/live/arg_bonds'), [], status),
  safe('Obligaciones negociables', () => getJson('https://data912.com/live/arg_corp'), [], status),
  safe('Riesgo país', () => getJson('https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais'), [], status),
  safe('Inflación', () => getJson('https://api.argentinadatos.com/v1/finanzas/indices/inflacion'), [], status),
  safe('BCRA', () => getJson('https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias?limit=3000'), {results:[]}, status)
 ]);
 const vars = (bcraVars as any)?.results ?? [];
 const findVar = (parts: string[]) => { const hit = vars.filter((v:any) => parts.every(p => String(v.descripcion ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(p))).sort((a:any,b:any)=>String(a.descripcion).length-String(b.descripcion).length)[0]; return hit?.idVariable; };
 const ids = { a3500: findVar(['mayorista','3500']) ?? 5, cer: findVar(['cer','base']) ?? 30, tamar: findVar(['tamar','n.a.']) ?? 44, badlar: findVar(['badlar','n.a.']) ?? 7 };
 async function series(id:number, days=400) { const to = new Date(); const from = new Date(Date.now()-days*86400000); const fmt=(d:Date)=>d.toISOString().slice(0,10); const j=await getJson(`https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${id}?desde=${fmt(from)}&hasta=${fmt(to)}&limit=1000`); return j?.results?.[0]?.detalle ?? []; }
 const [fx, cer, tamar, badlar] = await Promise.all([
  safe('Tipo de cambio BCRA',()=>series(ids.a3500,90),[],status), safe('CER',()=>series(ids.cer,400),[],status), safe('TAMAR',()=>series(ids.tamar,120),[],status), safe('BADLAR',()=>series(ids.badlar,120),[],status)
 ]);
 const today = new Date();
 const ymd = (d:Date) => d.toISOString().slice(0,10);
 async function a3Segment(segment:string) {
  for(let back=0; back<8; back++) { const d=new Date(Date.now()-back*86400000); if(d.getUTCDay()===0||d.getUTCDay()===6) continue;
   const url=`https://apicem.matbarofex.com.ar/api/v2/closing-prices?segment=${segment}&type=FUT&excludeEmptyVol=false&from=${ymd(d)}&to=${ymd(d)}&page=1&pageSize=100&sortDir=ASC&market=ROFX`;
   try { const j=await getJson(url); if(j?.data?.length) return {date:ymd(d),rows:j.data}; } catch {}
  } return {date:null,rows:[]};
 }
 const [agroFutures, currencyFutures] = await Promise.all([
  safe('Futuros agro A3',()=>a3Segment('Agropecuario'),{date:null,rows:[]},status),
  safe('Futuros dólar A3',()=>a3Segment('Monedas'),{date:null,rows:[]},status)
 ]);
 const [chicago, gold, sp500] = await Promise.all([
  safe('Chicago',()=>getJson(`https://query1.finance.yahoo.com/v8/finance/chart/ZS=F?range=1y&interval=1d`),null,status),
  safe('Oro internacional',()=>getJson(`https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1y&interval=1d`),null,status),
  safe('S&P 500',()=>getJson(`https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1y&interval=1d`),null,status)
 ]);
 const yahooSeries=(j:any)=>{const r=j?.chart?.result?.[0];if(!r)return[];const q=r.indicators?.quote?.[0];return (r.timestamp||[]).map((t:number,i:number)=>({fecha:new Date(t*1000).toISOString().slice(0,10),valor:q?.close?.[i]})).filter((x:any)=>x.valor!=null)};
 const world={soja:yahooSeries(chicago),oro:yahooSeries(gold),sp500:yahooSeries(sp500)};
 return NextResponse.json({ updatedAt: new Date().toISOString(), dollars, notes, bonds, ons, risk, inflation, fx, cer, tamar, badlar, agroFutures, currencyFutures, world, status });
}
