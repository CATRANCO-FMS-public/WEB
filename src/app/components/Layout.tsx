"use client";
import React from "react";
import Sidebar from "./reusables/sidebar";

const Layout = ({ children }) => {
  return (
    <section className="flex flex-row h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-200 overflow-y-auto">
        {children}
      </div>
    </section>
  );
};

export default Layout;