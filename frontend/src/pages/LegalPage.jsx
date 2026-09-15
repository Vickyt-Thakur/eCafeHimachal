import { useEffect, useState } from 'react';

export default function LegalPage({ title, source }) {
  const [content, setContent] = useState('Loading document…');
  useEffect(() => { fetch(source).then((response) => response.text()).then(setContent).catch(() => setContent('The requested document could not be loaded.')); }, [source]);
  return <main className="mx-auto max-w-4xl px-5 py-14"><p className="text-sm font-bold uppercase tracking-wider text-[#276052]">E CAFE HIMACHAL</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">{title}</h1><p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><strong>Important notice:</strong> eCafeHimachal is a private digital service platform and is not an official government website.</p><article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">{content.split(/\r?\n/).map((line, index) => { const text = line.trim(); if (!text) return <div key={index} className="h-4"/>; const heading = /^([0-9]+\.\s|[A-Z][A-Z &?]{5,}$|What |Why |How |Where |Do |Controls )/.test(text) || text === title.toUpperCase(); return heading ? <h2 key={index} className="mt-7 text-lg font-bold text-slate-950 first:mt-0">{text}</h2> : <p key={index} className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{text}</p>; })}</article></main>;
}
