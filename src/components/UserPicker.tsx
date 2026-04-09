"use client";

import { User, USER_COLORS } from "@/lib/types";

interface UserPickerProps {
  users: User[];
  currentUser: User | null;
  onSelect: (user: User | null) => void;
}

export default function UserPicker({ users, currentUser, onSelect }: UserPickerProps) {
  if (currentUser) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: USER_COLORS[currentUser.name] || "#6b7280" }}
        >
          {currentUser.name[0]}
        </div>
        <span className="font-medium">{currentUser.name}</span>
        <button
          onClick={() => onSelect(null)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Switch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 font-medium">Who are you?</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: USER_COLORS[user.name] || "#6b7280" }}
            >
              {user.name[0]}
            </div>
            <span className="text-xs text-gray-700">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
