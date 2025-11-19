"use client";
import React, { useState } from "react";
import { searchUsers } from "@/services/userService";

const NewChatDialog = ({ open, onClose, onStartChat }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await searchUsers(q);
    setLoading(false);
    if (res.success) setResults(res.users || []);
    else setResults([]);
  };

  const handleStart = (user) => {
    onStartChat(user);
    setQuery("");
    setResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Start New Chat</h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl font-light hover:bg-gray-100 rounded-lg p-1 transition"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 text-sm transition"
            value={query}
            onChange={handleSearch}
            placeholder="Search by name, email or registration number"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-auto">
          {loading && (
            <div className="text-sm text-gray-500 text-center py-8">
              <div className="inline-block animate-spin text-sky-600">⟳</div>
              <p>Searching...</p>
            </div>
          )}
          <ul className="divide-y divide-gray-100">
            {results.map((u) => (
              <li
                key={u._id}
                className="py-3 px-2 flex items-center justify-between hover:bg-sky-50 rounded transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-300 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                    {u.profilePic?.url || u.userDetails?.profilePic?.url ? (
                      <img
                        src={
                          u.profilePic?.url || u.userDetails?.profilePic?.url
                        }
                        alt={u.userDetails?.name || u.email}
                        className="w-full h-full object-cover"
                      />
                    ) : u.userDetails?.name ? (
                      u.userDetails.name.charAt(0).toUpperCase()
                    ) : (
                      u.email.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {u.userDetails?.name || u.email}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                </div>
                <button
                  className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-sky-700 transition active:scale-95"
                  onClick={() => handleStart(u)}
                >
                  Start
                </button>
              </li>
            ))}
            {results.length === 0 && !loading && query.length >= 2 && (
              <li className="py-6 text-center text-sm text-gray-500">
                No users found
              </li>
            )}
            {results.length === 0 && !loading && query.length < 2 && (
              <li className="py-6 text-center text-sm text-gray-400">
                Type to search for users
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewChatDialog;
