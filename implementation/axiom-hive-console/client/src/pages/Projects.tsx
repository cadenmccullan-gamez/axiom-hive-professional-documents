/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FolderPlus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Projects() {
  const utils = trpc.useUtils();
  const projects = trpc.governance.projects.list.useQuery();
  const create = trpc.governance.projects.create.useMutation({
    onSuccess: async () => {
      await utils.governance.projects.list.invalidate();
      setName(""); setDescription(""); toast.success("Project workspace created with an initial administrator membership and baseline policy.");
    },
    onError: error => toast.error(error.message),
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="grid gap-5 rounded-3xl bg-[#16372c] p-7 text-white shadow-xl shadow-emerald-950/10 md:grid-cols-[1.2fr_0.8fr] md:p-9">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/70">Authorization boundary</p><h1 className="mt-3 font-serif text-4xl leading-tight">Project work stays within its declared workspace.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/75">Each workspace maintains its own membership, policy versions, requests, review decisions, releases, and integrity-linked audit records.</p></div>
        <div className="rounded-2xl border border-white/10 bg-black/10 p-5"><ShieldCheck className="size-6 text-emerald-200" /><p className="mt-4 text-sm font-medium">Access enforcement occurs on protected server procedures.</p><p className="mt-2 text-xs leading-5 text-emerald-50/65">Hiding a record in the interface is not an authorization decision.</p></div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={event => { event.preventDefault(); create.mutate({ name, description: description || undefined }); }} className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><FolderPlus className="size-5 text-emerald-800" /><h2 className="font-serif text-xl">Create a project workspace</h2></div>
          <p className="mt-2 text-sm leading-5 text-[#66746c]">The creator is enrolled as the initial workspace administrator. The baseline policy requires a reviewer approval before release.</p>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Project name<Input value={name} onChange={event => setName(event.target.value)} className="mt-2 h-11" placeholder="Controlled research workspace" required minLength={3} maxLength={160} /></label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-[#56645c]">Purpose and scope<Textarea value={description} onChange={event => setDescription(event.target.value)} className="mt-2 min-h-28" placeholder="Optional project-boundary description" maxLength={2000} /></label>
          <Button disabled={create.isPending} className="mt-5 w-full bg-[#16372c] hover:bg-[#204a3a]">{create.isPending ? "Creating workspace…" : "Create controlled workspace"}</Button>
        </form>
        <section className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-serif text-xl">Authorized workspaces</h2><Badge variant="outline">{projects.data?.length ?? 0} visible</Badge></div>
          <div className="mt-5 divide-y divide-[#e5eae5]">{projects.isLoading ? <p className="py-8 text-sm text-[#66746c]">Loading authorized workspaces…</p> : projects.data?.length ? projects.data.map(project => <article key={project.id} className="py-4 first:pt-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-[#1d2a23]">{project.name}</h3><p className="mt-1 max-w-xl text-sm leading-5 text-[#66746c]">{project.description || "No additional workspace description was supplied."}</p></div><Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">{project.workspaceRole}</Badge></div><p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[#869189]">{project.status} · created {new Date(project.createdAt).toLocaleDateString()}</p></article>) : <p className="rounded-xl bg-[#f6f8f6] p-5 text-sm leading-6 text-[#66746c]">No workspaces are authorized for this account yet. Create one to begin a controlled drafting workflow.</p>}</div>
        </section>
      </section>
    </div>
  );
}
