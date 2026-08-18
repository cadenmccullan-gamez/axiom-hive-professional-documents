/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FileOutput, ShieldAlert, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ReviewQueue() {
  const utils = trpc.useUtils();
  const queue = trpc.governance.review.queue.useQuery();
  const [rationale, setRationale] = useState<Record<string, string>>({});
  const [artifact, setArtifact] = useState<{ requestId: string; content: string; format: "markdown" | "json"; digest: string } | null>(null);
  const authorizeGeneration = trpc.governance.review.authorizeGeneration.useMutation({
    onSuccess: async () => { await utils.governance.review.queue.invalidate(); toast.success("Pre-generation reviewer authorization recorded. The author may now generate a controlled draft."); },
    onError: error => toast.error(error.message),
  });
  const decide = trpc.governance.review.decide.useMutation({
    onSuccess: async result => { await utils.governance.review.queue.invalidate(); toast.success(result.state === "APPROVED" ? "Reviewer approval recorded. A controlled release can now be created." : "Reviewer rejection recorded; the request is closed."); },
    onError: error => toast.error(error.message),
  });
  const release = trpc.governance.artifacts.release.useMutation({
    onSuccess: async result => { await utils.governance.review.queue.invalidate(); setArtifact({ requestId: result.artifactId, content: result.content, format: result.format, digest: result.digest }); toast.success("Controlled artifact released with provenance metadata and a digest."); },
    onError: error => toast.error(error.message),
  });

  return <div className="mx-auto max-w-6xl space-y-7">
    <section className="grid gap-5 rounded-3xl bg-[#452e18] p-7 text-white md:grid-cols-[1.2fr_0.8fr] md:p-9"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/70">Human authority gate</p><h1 className="mt-3 font-serif text-4xl leading-tight">Reviewers authorize high-impact generation and every release.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-amber-50/75">High-impact or restricted requests require a reviewer authorization before drafting. All draft outputs require a separate reviewer decision before release.</p></div><div className="rounded-2xl border border-white/10 bg-black/10 p-5"><ShieldAlert className="size-6 text-amber-200" /><p className="mt-4 text-sm font-medium">Protected procedure enforcement</p><p className="mt-2 text-xs leading-5 text-amber-50/65">The generation and release procedures independently verify their required approvals.</p></div></section>
    <section className="space-y-4">{queue.isLoading ? <p className="py-12 text-sm text-[#66746c]">Loading authorized review items…</p> : queue.data?.length ? queue.data.map(request => { const isPreGenerationGate = request.state === "AWAITING_PRE_GENERATION_APPROVAL" && request.requiresPreGenerationApproval; return <article key={request.id} className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><div className="flex items-center gap-2"><Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">{isPreGenerationGate ? "Pre-generation authorization" : "Awaiting release review"}</Badge><span className="text-xs text-[#6b7870]">{request.sensitivity} · {request.actionCategory.replaceAll("_", " ")}</span></div><h2 className="mt-3 font-serif text-2xl text-[#1d2a23]">{request.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#66746c]">{request.intendedUse}</p></div><p className="text-xs uppercase tracking-[0.12em] text-[#77857d]">Request {request.id.slice(0, 8)}</p></div>
      <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Decision rationale<Textarea value={rationale[request.id] ?? ""} onChange={event => setRationale(previous => ({ ...previous, [request.id]: event.target.value }))} className="mt-2 min-h-24" placeholder="Record the review basis, limitations, and any conditions." minLength={12} maxLength={2000} /></label>
      <div className="mt-4 flex flex-wrap items-center gap-3">{isPreGenerationGate ? <Button disabled={(rationale[request.id] ?? "").trim().length < 12 || authorizeGeneration.isPending} onClick={() => authorizeGeneration.mutate({ requestId: request.id, rationale: rationale[request.id] })} className="bg-amber-700 hover:bg-amber-800"><CheckCircle2 className="mr-1.5 size-4" />Authorize generation</Button> : <><Button disabled={(rationale[request.id] ?? "").trim().length < 12 || decide.isPending} onClick={() => decide.mutate({ requestId: request.id, decision: "APPROVED", rationale: rationale[request.id] })} className="bg-emerald-700 hover:bg-emerald-800"><CheckCircle2 className="mr-1.5 size-4" />Record approval</Button><Button disabled={(rationale[request.id] ?? "").trim().length < 12 || decide.isPending} onClick={() => decide.mutate({ requestId: request.id, decision: "REJECTED", rationale: rationale[request.id] })} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50"><XCircle className="mr-1.5 size-4" />Record rejection</Button></>}<span className="text-xs text-[#77857d]">The decision is retained with reviewer identity and timestamp.</span></div>
    </article>; }) : <div className="rounded-2xl border border-dashed border-[#cdd8cf] bg-white p-10 text-center"><CheckCircle2 className="mx-auto size-8 text-emerald-700" /><h2 className="mt-3 font-serif text-xl">No requests currently need your review.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#66746c]">Requests enter this queue for high-impact authorization or after drafting and output validation.</p></div>}</section>
    <section className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><FileOutput className="size-5 text-emerald-800" /><h2 className="font-serif text-xl">Release an approved artifact</h2></div><p className="mt-2 text-sm leading-5 text-[#66746c]">The server will reject this request unless the workflow is approved and a reviewer approval decision is on record.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={artifact?.requestId ?? ""} onChange={() => undefined} className="hidden" /><p className="rounded-lg bg-[#f6f8f6] px-3 py-2 text-sm text-[#66746c]">Select a request from its detail record after approval. The current queue intentionally does not show already approved items.</p></div>{artifact ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-900">Released {artifact.format} artifact</p><p className="mt-1 break-all font-mono text-xs text-emerald-800">SHA-256: {artifact.digest}</p><Textarea readOnly value={artifact.content} className="mt-3 min-h-48 bg-white font-mono text-xs" /></div> : null}</section>
  </div>;
}
