"use client";

import React from "react";

export interface CollaboratorUser {
  id?: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
  bgColor?: string;
}

export interface CollaboratorStackProps {
  label?: string;
  users: CollaboratorUser[];
  maxVisible?: number;
  overflowCount?: number;
  className?: string;
  onUserClick?: (user: CollaboratorUser) => void;
  onOverflowClick?: () => void;
}

export default function CollaboratorStack({
  label = "Collaborator",
  users,
  maxVisible = 4,
  overflowCount,
  className = "",
  onUserClick,
  onOverflowClick,
}: CollaboratorStackProps) {
  if (!users || users.length === 0) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const remaining =
    overflowCount !== undefined
      ? overflowCount
      : Math.max(0, users.length - maxVisible);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}

      <div className="flex items-center -space-x-2 overflow-hidden">
        {visibleUsers.map((user, idx) => (
          <div
            key={user.id || idx}
            title={user.name}
            onClick={() => onUserClick && onUserClick(user)}
            className={`relative inline-block w-7 h-7 rounded-full ring-2 ring-white shadow-2xs overflow-hidden shrink-0 ${
              onUserClick ? "cursor-pointer hover:scale-105 transition-transform" : ""
            }`}
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-white ${
                  user.bgColor || "bg-slate-800"
                }`}
              >
                {user.initials || user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {remaining > 0 && (
          <div
            onClick={onOverflowClick}
            className={`relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-semibold text-slate-600 shadow-2xs shrink-0 ${
              onOverflowClick ? "cursor-pointer hover:bg-slate-200 transition-colors" : ""
            }`}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}
