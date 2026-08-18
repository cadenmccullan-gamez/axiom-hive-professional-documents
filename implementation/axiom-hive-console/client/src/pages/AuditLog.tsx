/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Fingerprint, Link2, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuditLog() {
  const projects = trpc.governance.projects.list.useQuery();
  const [projectId, setProjectId] = useState("");
  const [requestId, setRequestId] = useState("");
  useEffect(() => { if (!projectId && projects.data?.[0]) setProjectId(projects.data[0].id); }, [projects.data, projectId]);
  const requests = trpc.governance.requests.list.useQuery({ projectId }, { enabled: Boolean(projectId) });
  useEffect(() => { if (!requestId && requests.data?.[0]) setRequestId(requests.data[0].id); }, [requests.data, requestId]);
  const events = trpc.governance.audit.byRequest.useQuery({ requestId }, { enabled: Boolean(requestId) });
  return <div className="mx-auto max-w-6xl space-y-7">
    <section className="flex flex-col gap-5 rounded-3xl border border-[#d8e5dd] bg-[#f0f8f2] p-7 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Integrity-linked event records</p><h1 className="mt-2 font-serif text-4xl text-[#1d3026]">Audit visibility for every material workflow transition.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#506158]">Each event references the preceding project event hash. This supports a reviewable chain within the prototype; it is not presented as immutable storage or as legal evidence by itself.</p></div><Fingerprint className="size-10 text-emerald-700" /></section>
    <section className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-sm"><div className="grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Workspace<select value={projectId} onChange={event => { setProjectId(event.target.value); setRequestId(""); }} className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">{projects.data?.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Drafting request<select value={requestId} onChange={event => setRequestId(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">{requests.data?.map(request => <option key={request.id} value={request.id}>{request.title}</option>)}</select></label></div>
      <div className="mt-6 space-y-3">{events.isLoading ? <p className="py-8 text-sm text-[#66746c]">Loading authorized audit records…</p> : events.data?.length ? events.data.map((event, index) => <article key={event.id} className="grid gap-4 rounded-xl border border-[#e1e7e2] p-4 md:grid-cols-[auto_1fr_auto]"><div className="grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-800"><ScrollText className="size-4" /></div><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-[#213027]">{event.eventType.replaceAll("_", " ")}</p>{event.toState ? <Badge variant="outline">{event.toState.replaceAll("_", " ")}</Badge> : null}</div><p className="mt-1 text-xs text-[#6b7870]">{event.createdAt.toLocaleString()} · Actor #{event.actorUserId}</p><p className="mt-3 break-all font-mono text-[10px] leading-4 text-[#63736a]">integrity: {event.integrityHash}</p>{index < (events.data?.length ?? 0) - 1 ? <p className="mt-1 flex items-center gap-1 text-[10px] text-[#7c8a82]"><Link2 className="size-3" /> linked to prior project event hash</p> : null}</div><div className="text-right text-[10px] uppercase tracking-[0.12em] text-[#7c8a82]">{event.fromState ? `${event.fromState} →` : ""}<br />{event.toState ?? "recorded"}</div></article>) : <p className="rounded-xl bg-[#f6f8f6] p-5 text-sm leading-6 text-[#66746c]">No audit records are available for the selected request.</p>}</div>
    </section>
  </div>;
}
