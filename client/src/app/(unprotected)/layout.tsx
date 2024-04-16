'use client';
import React, { ReactNode, useState } from "react";
import Alert from "@/components/Alert";
import { useError } from '@/context/ErrorContext';


interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { error } = useError();

  return (
    <>
      {error &&
        <div className="alertComponentWrapper">
          <Alert primaryMessage={error.primaryMessage} secondaryMessage={error.secondaryMessage} type={error.type} />
        </div>
      }
      <main className="w-full h-full">
        {children}
      </main>
    </>
  )
}
