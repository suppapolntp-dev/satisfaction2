"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SelectInput from "@/Components/Inputs/SelectInput";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isAccountActive, setIsAccountActive] = useState(true);

  // ซิงค์สถานะป้องกันปัญหา Hydration SSR Mismatch ของ Next.js
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // ทำงานส่งข้อมูลจริงที่นี่ในอนาคต
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 transition-all duration-200 scale-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-neutral-800">Create New User</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Fill in the details below to add a new user to the system.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-full transition-colors outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Readonly User ID */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-neutral-400">User ID</label>
                <input 
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-neutral-400 cursor-not-allowed outline-none" 
                  type="text" 
                  value="USR-005" 
                  readOnly 
                />
              </div>

              {/* Name Inputs */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">First Name <span className="text-rose-500">*</span></label>
                <input className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-neutral-800 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none transition-all" placeholder="e.g. Jane" type="text" required />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">Last Name <span className="text-rose-500">*</span></label>
                <input className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-neutral-800 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none transition-all" placeholder="e.g. Doe" type="text" required />
              </div>

              {/* Contact Inputs */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">Email Address <span className="text-rose-500">*</span></label>
                <input className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-neutral-800 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none transition-all" placeholder="name@company.com" type="email" required />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">Phone Number</label>
                <input className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-neutral-800 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none transition-all" placeholder="+1 (555) 000-0000" type="tel" />
              </div>

              {/* Organizational Selects */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 mb-1">Brand Assignment <span className="text-rose-500">*</span></label>
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: "", label: "Select Brand" },
                    { value: "Brand A", label: "Brand A" },
                    { value: "Brand B", label: "Brand B" },
                    { value: "Brand C", label: "Brand C" }
                  ]}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 mb-1">Branch / Location <span className="text-rose-500">*</span></label>
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: "", label: "Select Branch" },
                    { value: "New York HQ", label: "New York HQ" },
                    { value: "Chicago Branch", label: "Chicago Branch" },
                    { value: "London Office", label: "London Office" }
                  ]}
                />
              </div>

              {/* System Role Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 mb-1">System Role <span className="text-rose-500">*</span></label>
                <SelectInput
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: "", label: "Select Role" },
                    { value: "Administrator", label: "Administrator" },
                    { value: "Manager", label: "Manager" },
                    { value: "Agent", label: "Agent" }
                  ]}
                />
              </div>

              {/* Toggle Account Status */}
              <div className="flex flex-col justify-end pb-2 select-none">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input 
                    className="sr-only peer" 
                    type="checkbox" 
                    checked={isAccountActive} 
                    onChange={(event) => setIsAccountActive(event.target.checked)} 
                  />
                  <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                  <span className="text-xs font-semibold text-neutral-700">Account Active</span>
                </label>
              </div>

            </div>

            {/* Welcome Email Checkbox */}
            <div className="pt-4 border-t border-slate-100 select-none">
              <label className="flex items-start gap-3 cursor-pointer">
                <input className="mt-1 w-4 h-4 text-blue-900 bg-white border-slate-300 rounded focus:ring-blue-900/20 focus:ring-2" type="checkbox" />
                <div>
                  <span className="text-xs font-bold text-neutral-700 block">Send welcome email with password reset link</span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">The user will receive instructions to set up their initial password.</span>
                </div>
              </label>
            </div>

            {/* Form Footer Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-neutral-700 rounded-lg text-xs font-semibold shadow-sm transition-colors outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors outline-none"
              >
                Create User
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>,
    document.body
  );
}