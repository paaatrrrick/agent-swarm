'use client';
import React, { ReactNode, useState } from "react";
import { useError } from '@/context/ErrorContext';
import { useLoader } from '@/context/LoaderContext';
import Alert from "@/components/Alert";
import { Loader } from "@/components/Loader";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { error } = useError();
  const { loading } = useLoader();
  return (
    <>
      {error &&
        <div className="alertComponentWrapper">
          <Alert primaryMessage={error.primaryMessage} secondaryMessage={error.secondaryMessage} type={error.type} />
        </div>
      }
      <main className="w-full h-full">
        {loading && <Loader text={typeof loading === "boolean" ? "" : loading?.text} className={typeof loading === "boolean" ? "" : loading.className} />}
        {children}
      </main>
    </>
  )
}
