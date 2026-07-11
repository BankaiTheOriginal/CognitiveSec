"use client";
import { useAuthStore } from "@/app/modules/auth/auth.store";
import { useGetMyOrgs } from "@/app/modules/organization/organization.hook";
import { Dropdown } from "@/components/ui/Dropdown";
import { Upload } from "lucide-react";

export default function NavBar() {
  const { data: orgData, isLoading: orgLoading } = useGetMyOrgs();
  console.log(orgData);

  if (!orgData) {
    return <div>No organizations found.</div>;
  }
  const orgItems = orgData.map((org) => ({
    label: org.organization.name,
    onClick: () => {
      useAuthStore().switchActiveWorkspace(org.id);
    },
  }));

  return (
    <div>
      <div className="border border-slate-300 p-5 bg-white rounded-xl">
        <div className="flex justify-between">
          <div className="flex">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">ORG:</span>
              <Dropdown
                trigger={
                  <span className="font-semibold text-sm">
                    {orgData[0].organization.name}
                  </span>
                }
                items={orgItems}
                className="border border-slate-300 rounded-xl px-2 py-1"
              />
            </div>
          </div>
          <div>
            <button className="flex gap-1 text-sm items-center bg-black text-white py-2 px-4 font-sans rounded-lg">
              <Upload className="w-4 h-4" />
              <span>Upload Docs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
