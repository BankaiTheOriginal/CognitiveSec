"use client";
import {
  SignInInput,
  signInSchema,
  SignUpInput,
  signUpSchema,
} from "@/app/common/zod.validator";
import { login } from "@/app/modules/auth/auth.api";
import { useLogin, useSignUp } from "@/app/modules/auth/auth.hook";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sign-in");
  const loginMutation = useLogin();
  const signUpMutation = useSignUp();
  async function onLoginSubmit(data: SignInInput) {
    await loginMutation.mutateAsync(data);
    router.push("/copilot");
  }
  async function onSignUpSubmit(data: SignUpInput) {
    await signUpMutation.mutateAsync(data);
  }
  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: signInErrors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="flex flex-col w-[30vw] gap-6">
        <div className="flex flex-col">
          {activeTab === "sign-in" ? (
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold font-display tracking-tight">
                Welcome back
              </span>
              <span className="small-text">
                Login to your Cognitive Sec account
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="flex text-2xl md:text-xl font-bold font-display tracking-tight">
                Get started with the
                <span className="text-indigo-700 ml-1">
                  Cognitive Sec Suite
                </span>
              </span>
              <span className="small-text">
                Create an extensive knowledge base analyzed by AI for easy
                information retrieval
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex bg-slate-200 p-1 gap-2 rounded-xl">
            <button
              onClick={() => setActiveTab("sign-in")}
              className={`flex-1 py-2 rounded-lg font-semibold transition text-xs  ${
                activeTab === "sign-in"
                  ? "bg-white text-indigo-700"
                  : "bg-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 rounded-lg font-semibold transition text-xs ${
                activeTab === "register"
                  ? "bg-white text-indigo-700"
                  : "bg-slate-200"
              }`}
            >
              Register Account
            </button>
          </div>
        </div>
        <div className="bg-white shadow-sm border border-slate-200 p-4 rounded-lg">
          {activeTab === "sign-in" ? (
            <div>
              <form
                onSubmit={handleSubmitSignIn(onLoginSubmit)}
                className="flex flex-col gap-4 p-2"
              >
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-slate-500 tracking-tight text-[10px] font-display">
                    Work Email Address
                  </span>
                  <input
                    {...registerSignIn("email")}
                    placeholder="e.g justice@example.com"
                    className="text-[12px] bg-slate-100 p-2 rounded-lg border-1 border-slate-200 transition focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  {signInErrors.email && (
                    <span className="text-red-500 text-sm">
                      {signInErrors.email.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-slate-500 tracking-tight text-[10px] font-display">
                    Password
                  </span>
                  <input
                    {...registerSignIn("password")}
                    placeholder="•••••••••"
                    className="text-[12px] bg-slate-100 p-2 rounded-lg border-1 border-slate-200 transition focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />

                  {signInErrors.password && (
                    <span className="text-red-500 text-sm">
                      {signInErrors.password.message}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="primary-button"
                >
                  {loginMutation.isPending ? (
                    <span className="flex gap-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <form
                onSubmit={handleSubmit(onSignUpSubmit)}
                className="flex flex-col gap-4 p-2"
              >
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-slate-500 tracking-tight text-[10px] font-display">
                    Full Name
                  </span>
                  <input
                    {...register("name")}
                    placeholder="e.g Justice Julius"
                    className="text-[12px] bg-slate-100 p-2 rounded-lg border-1 border-slate-200 transition focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />

                  {errors.name && (
                    <span className="text-red-500 text-sm">
                      {errors.name.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-slate-500 tracking-tight text-[10px] font-display">
                    Work Email Address
                  </span>
                  <input
                    {...register("email")}
                    placeholder="justice@example.com"
                    className="text-[12px] bg-slate-100 p-2 rounded-lg border-1 border-slate-200 transition focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />

                  {errors.email && (
                    <span className="text-red-500 text-sm">
                      {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-slate-500 tracking-tight text-[10px] font-display">
                    Password
                  </span>
                  <input
                    {...register("password")}
                    placeholder="•••••••••"
                    className="text-[12px] bg-slate-100 p-2 rounded-lg border-1 border-slate-200 transition focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />

                  {errors.password && (
                    <span className="text-red-500 text-sm">
                      {errors.password.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-slate-500 tracking-tight text-[10px] font-display">
                    Organization Name
                  </span>
                  <input
                    {...register("organizationName")}
                    placeholder="Justice Inc"
                    className="text-[12px] bg-slate-100 p-2 rounded-lg border-1 border-slate-200 transition focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  {errors.organizationName && (
                    <span className="text-red-500 text-sm">
                      {errors.organizationName.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-slate-500 tracking-tight text-[10px] font-display">
                    Confirm Password
                  </span>
                  <input
                    {...register("confirmPassword")}
                    placeholder="•••••••••"
                    className="text-[12px] bg-slate-100 p-2 rounded-lg border-1 border-slate-200 transition focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={signUpMutation.isPending}
                  className="primary-button"
                >
                  {signUpMutation.isPending ? (
                    <span className="flex">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
