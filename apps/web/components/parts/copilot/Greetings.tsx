"use client";
import { useMeQuery } from "@/app/modules/auth/auth.hook";
import { useCreateChat } from "@/app/modules/chat/chat.hook";
import { useGetMyOrg } from "@/app/modules/organization/organization.hook";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Greetings() {
  const { data: me } = useMeQuery();

  const { data: organization } = useGetMyOrg();
  const [message, setMessage] = useState("");
  const { mutateAsync: createChat } = useCreateChat();

  const handleInputChange = (value: string) => {
    setMessage(value);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const chat = await createChat();
    router.push(
      `/copilot/${chat.id}?pendingMessage=${encodeURIComponent(message)}`,
    );
  };

  const firstName = me?.user.name.split(" ").shift();
  const router = useRouter();
  return (
    <div className="flex flex-col col-span-2 row-span-2 bg-white shadow-sm border border-slate-200 rounded-xl">
      <div className="flex flex-col h-full items-center justify-center">
        <div className="flex flex-col gap-4">
          <span className="text-3xl ">
            Hello{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-900 bg-[length:200%_auto] bg-clip-text font-extrabold text-transparent animate-gradient">{`${firstName}`}</span>{" "}
            where should we start today
          </span>
          <form
            className="flex relative items-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              placeholder={`Ask me anything about ${organization?.name}`}
              className="border w-full p-4 rounded-full border-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-sm"
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <button
              type="submit"
              className=" absolute bg-indigo-500 p-2 rounded-full text-white right-2 z-10 transition delay-100 hover:bg-indigo-800 cursor-pointer"
            >
              <ArrowUp className="" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
