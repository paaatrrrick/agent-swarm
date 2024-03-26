'use client';
import React, { ReactNode, useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <main className="w-full h-full">
        {children}
      </main>
    </>
  )
}
