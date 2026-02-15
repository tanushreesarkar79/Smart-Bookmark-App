"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const router = useRouter();

  useEffect(() => {
    initialize();

    const channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => fetchBookmarks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initialize = async () => {
    await getUser();
    await fetchBookmarks();
  };

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/");
    } else {
      setUser(data.user);
    }
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data as Bookmark[]);
  };

  const openAddModal = () => {
    setEditingBookmark(null);
    setTitle("");
    setUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setIsModalOpen(true);
  };

const saveBookmark = async () => {
  if (!title || !url || !user) return;

  if (editingBookmark) {
    await supabase
      .from("bookmarks")
      .update({ title, url })
      .eq("id", editingBookmark.id);
  } else {
    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);
  }

  await fetchBookmarks();

  setIsModalOpen(false);
  setTitle("");
  setUrl("");
};

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <div className="flex gap-4">
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Bookmark
          </button>
          <button onClick={logout} className="text-red-500">
            Logout
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Title</th>
              <th className="border px-4 py-2 text-left">URL</th>
              <th className="border px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookmarks.map((bookmark) => (
              <tr key={bookmark.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{bookmark.title}</td>
                <td className="border px-4 py-2 text-blue-600">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {bookmark.url}
                  </a>
                </td>
                <td className="border px-4 py-2 text-center space-x-3">
                  <button
                    onClick={() => openEditModal(bookmark)}
                    className="text-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingBookmark ? "Edit Bookmark" : "Add Bookmark"}
            </h2>

            <input
              type="text"
              placeholder="Title"
              className="border p-2 w-full mb-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="URL"
              className="border p-2 w-full mb-4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 border"
              >
                Cancel
              </button>
              <button
                onClick={saveBookmark}
                className="px-4 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
