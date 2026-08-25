"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Clock3, Settings2, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyOrg,
  useGetOrganizationActivity,
  useUpdateOrganization,
} from "@/app/modules/organization/organization.hook";

function formatAction(action: string) {
  switch (action) {
    case "DOCUMENT_UPLOADED":
      return "Upload";
    case "DOCUMENT_DELETED":
      return "Delete";
    case "DOCUMENT_REINDEX_REQUESTED":
      return "Reindex";
    case "ROLE_UPDATED":
      return "Role change";
    case "ORGANIZATION_UPDATED":
      return "Workspace update";
    case "MEMBER_REMOVED":
      return "Member removed";
    default:
      return action.replaceAll("_", " ");
  }
}

export default function Page() {
  const { data: organization, isLoading: organizationLoading } = useGetMyOrg();
  const { data: activity, isLoading: activityLoading } =
    useGetOrganizationActivity();
  const updateOrganization = useUpdateOrganization();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!organization) return;

    setName(organization.name ?? "");
    setSlug(organization.slug ?? "");
  }, [organization]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      await updateOrganization.mutateAsync({
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      });

      toast.success("Workspace saved");
    } catch (error: any) {
      toast.error("Could not save workspace", {
        description: error?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-screen flex-col gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
            <Settings2 className="h-4 w-4 text-indigo-600" />
            <span className="font-display tracking-tight text-lg">
              Organization settings
            </span>
          </div>
          <h1 className="text-base font-semibold tracking-tight text-slate-900">
            Workspace identity and activity
          </h1>
          <p className="max-w-2xl text-xs leading-6 text-slate-500">
            Manage organization settings and audit information.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600" />
            <h2 className="text-lg font-semibold tracking-tight font-display text-slate-900">
              Organization profile
            </h2>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Security Team"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Slug
              </label>
              <input
                value={slug}
                onChange={(event) =>
                  setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                placeholder="acme-security-team"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={updateOrganization.isPending || organizationLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {updateOrganization.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Created
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {organization?.createdAt
                  ? new Date(organization.createdAt).toLocaleString()
                  : organizationLoading
                    ? "Loading..."
                    : "Unknown"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Last updated
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {organization?.updatedAt
                  ? new Date(organization.updatedAt).toLocaleString()
                  : organizationLoading
                    ? "Loading..."
                    : "Unknown"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-indigo-600" />
              <h2 className="text-lg font-semibold tracking-tight font-display text-slate-900">
                Recent activity
              </h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              {activity?.length ?? 0} events
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {activityLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading activity...
              </div>
            ) : activity && activity.length > 0 ? (
              activity.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                        {formatAction(entry.action)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {entry.actorName || "System"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {entry.message}
                  </p>

                  {entry.metadata ? (
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-[11px] leading-5 text-slate-500">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No audit events yet. Uploading documents, changing roles, or
                removing members will show up here.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
