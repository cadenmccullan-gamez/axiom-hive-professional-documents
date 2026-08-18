/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, FileCheck2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const states = ["DRAFT_REQUEST", "INTAKE_VALIDATED", "POLICY_DECIDED", "AWAITING_PRE_GENERATION_APPROVAL", "DRAFT_GENERATED", "OUTPUT_VALIDATED", "AWAITING_HUMAN_REVIEW", "APPROVED", "REJECTED", "RELEASED"];

export default function DraftingRequests() {
  const utils = trpc.useUtils();
  const projects = trpc.governance.projects.list.useQuery();
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [sensitivity, setSensitivity] = useState<"public" | "internal" | "confidential" | "restricted">("internal");
  const [actionCategory, setActionCategory] = useState<"internal_draft" | "external_release" | "high_impact" | "restricted">("internal_draft");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [liveDraft, setLiveDraft] = useState(false);
  const [releasedArtifact, setReleasedArtifact] = useState<{ content: string; digest: string; format: "markdown" | "json" } | null>(null);

  useEffect(() => { if (!projectId && projects.data?.[0]) setProjectId(projects.data[0].id); }, [projects.data, projectId]);
  const requests = trpc.governance.requests.list.useQuery({ projectId }, { enabled: Boolean(projectId) });
  const submit = trpc.governance.requests.submit.useMutation({
    onSuccess: async result => {
      await utils.governance.requests.list.invalidate({ projectId });
      toast.success(result.decision === "REJECT" ? "The request was rejected by the deterministic intake policy." : "The intake record and policy decision were created.");
      setTitle(""); setIntendedUse(""); setSourceLabel(""); setSourceUrl("");
    },
    onError: error => toast.error(error.message),
  });
  const generate = trpc.governance.requests.generate.useMutation({ onSuccess: async () => { await utils.governance.requests.list.invalidate({ projectId }); toast.success("Draft generated; run output validation to route it to review."); }, onError: error => toast.error(error.message) });
  const validate = trpc.governance.requests.validate.useMutation({ onSuccess: async result => { await utils.governance.requests.list.invalidate({ projectId }); result.valid ? toast.success("Output validation passed; the request is now awaiting human review.") : toast.error("Output validation failed; see the recorded result."); }, onError: error => toast.error(error.message) });
  const release = trpc.governance.artifacts.release.useMutation({ onSuccess: async result => { await utils.governance.requests.list.invalidate({ projectId }); setReleasedArtifact({ content: result.content, digest: result.digest, format: result.format }); toast.success("Approved artifact released with controlled provenance metadata."); }, onError: error => toast.error(error.message) });

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-[#d8e5dd] bg-[#f0f8f2] p-7 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Policy-gated intake</p><h1 className="mt-2 font-serif text-4xl text-[#1d3026]">Drafting requests are controlled before generation.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#506158]">The server records the intake, validates its structure, applies the active project policy, and blocks credential-like values. Generation begins only from a policy-decided request.</p></div><div className="w-full md:w-64"><label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Active workspace<select value={projectId} onChange={event => setProjectId(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-white px-3 text-sm">{projects.data?.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div></section>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={event => { event.preventDefault(); if (!projectId) return toast.error("Create or select a project workspace first."); submit.mutate({ projectId, title, intendedUse, sensitivity, actionCategory, sources: [{ label: sourceLabel, url: sourceUrl }] }); }} className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><FileCheck2 className="size-5 text-emerald-800" /><h2 className="font-serif text-xl">Submit a controlled request</h2></div>
          <p className="mt-2 text-sm leading-5 text-[#66746c]">Do not include credentials, keys, payment data, or secrets. The screening rule is a guardrail, not a complete data-classification method.</p>
          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Request title<Input value={title} onChange={event => setTitle(event.target.value)} className="mt-2 h-10" required minLength={4} maxLength={200} /></label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Intended-use declaration<Textarea value={intendedUse} onChange={event => setIntendedUse(event.target.value)} className="mt-2 min-h-24" required minLength={12} maxLength={2000} placeholder="Explain the proposed audience, use, and decision boundary." /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Sensitivity<select value={sensitivity} onChange={event => setSensitivity(event.target.value as typeof sensitivity)} className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="public">Public</option><option value="internal">Internal</option><option value="confidential">Confidential</option><option value="restricted">Restricted</option></select></label><label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Action category<select value={actionCategory} onChange={event => setActionCategory(event.target.value as typeof actionCategory)} className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="internal_draft">Internal draft</option><option value="external_release">External release</option><option value="high_impact">High impact</option><option value="restricted">Restricted</option></select></label></div>
          <div className="mt-4 rounded-xl bg-[#f6f8f6] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Source input metadata</p><div className="mt-3 grid gap-3"><Input value={sourceLabel} onChange={event => setSourceLabel(event.target.value)} placeholder="Source label" required minLength={2} maxLength={200} /><Input value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://source.example" type="url" required /></div></div>
          <Button disabled={submit.isPending} className="mt-5 w-full bg-[#16372c] hover:bg-[#204a3a]">{submit.isPending ? "Applying intake controls…" : "Submit and apply policy"}</Button>
        </form>
        <section className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-xl">Workspace requests</h2><p className="mt-1 text-sm text-[#66746c]">All transitions are enforced by protected server procedures.</p></div><Badge variant="outline">{requests.data?.length ?? 0} records</Badge></div>
          <div className="mt-5 space-y-3">{requests.isLoading ? <p className="py-8 text-sm text-[#66746c]">Loading project requests…</p> : requests.data?.length ? requests.data.map(request => <article key={request.id} className="rounded-xl border border-[#e2e8e3] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium text-[#1d2a23]">{request.title}</p><p className="mt-1 text-xs text-[#6b7870]">{request.sensitivity} sensitivity · {request.actionCategory.replaceAll("_", " ")}</p></div><Badge className={request.state === "REJECTED" ? "bg-red-100 text-red-800 hover:bg-red-100" : request.state === "AWAITING_HUMAN_REVIEW" ? "bg-amber-100 text-amber-900 hover:bg-amber-100" : "bg-emerald-100 text-emerald-900 hover:bg-emerald-100"}>{request.state.replaceAll("_", " ")}</Badge></div>
            <div className="mt-4 flex flex-wrap items-center gap-2">{request.state === "POLICY_DECIDED" ? <><Button size="sm" onClick={() => generate.mutate({ requestId: request.id, adapter: liveDraft ? "invoke_llm" : "deterministic_mock" })} disabled={generate.isPending}><Sparkles className="mr-1.5 size-3.5" />{liveDraft ? "Generate with configured LLM" : "Generate deterministic draft"}</Button><label className="flex items-center gap-2 text-xs text-[#66746c]"><input type="checkbox" checked={liveDraft} onChange={event => setLiveDraft(event.target.checked)} /> Optional server LLM</label></> : null}{request.state === "AWAITING_PRE_GENERATION_APPROVAL" ? <span className="flex items-center gap-1.5 text-xs text-amber-800"><AlertTriangle className="size-3.5" /> A reviewer must authorize generation before this request can proceed.</span> : null}{request.state === "DRAFT_GENERATED" ? <Button size="sm" variant="outline" onClick={() => validate.mutate({ requestId: request.id })} disabled={validate.isPending}>Run output validation <ArrowRight className="ml-1.5 size-3.5" /></Button> : null}{request.state === "APPROVED" ? <><Button size="sm" onClick={() => release.mutate({ requestId: request.id, format: "markdown" })} disabled={release.isPending}>Release Markdown</Button><Button size="sm" variant="outline" onClick={() => release.mutate({ requestId: request.id, format: "json" })} disabled={release.isPending}>Release JSON</Button></> : null}{request.state === "REJECTED" ? <span className="flex items-center gap-1.5 text-xs text-red-700"><AlertTriangle className="size-3.5" /> The request stopped at the policy gate.</span> : null}</div>
            <div className="mt-4 flex flex-wrap gap-1.5">{states.map(state => <span key={state} className={`h-1.5 w-6 rounded-full ${state === request.state ? "bg-emerald-500" : "bg-[#e2e8e3]"}`} />)}</div>
          </article>) : <p className="rounded-xl bg-[#f6f8f6] p-5 text-sm leading-6 text-[#66746c]">No drafting requests exist in this project workspace. Submit a request to begin the controlled state sequence.</p>}</div>
        </section>
      </section>
      {releasedArtifact ? <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Controlled export created</p><h2 className="mt-1 font-serif text-xl text-emerald-950">{releasedArtifact.format.toUpperCase()} artifact with provenance metadata</h2></div><Badge className="bg-white text-emerald-900 hover:bg-white">Released</Badge></div><p className="mt-3 break-all font-mono text-xs text-emerald-900">SHA-256: {releasedArtifact.digest}</p><Textarea readOnly value={releasedArtifact.content} className="mt-4 min-h-56 bg-white font-mono text-xs" /></section> : null}
    </div>
  );
}
