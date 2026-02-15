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
  const [editingBookmark, setEditingBookmark] =
    useState<Bookmark | null>(null);

  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
   
    await getUser();
  };

  const getUser = async () => {


    const { data, error } = await supabase.auth.getUser();

    if (error) {
    
      return;
    }

    if (!data.user) {
    
      router.push("/");
    } else {
    
      setUser(data.user);
    }
  };

  const fetchBookmarks = async (userId: string) => {


    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
    
      return;
    }

    if (!data || data.length === 0) {
    
      setBookmarks([]);
    } else {
   
      setBookmarks(data as Bookmark[]);
    }
  };
useEffect(() => {
  if (!user) return;

  const handleVisibilityChange = async () => {
  if (!user) return;

  if (document.visibilityState === "visible") {
  

    await fetchBookmarks(user.id);
  } else {

  }
};

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, [user]);



  useEffect(() => {
    if (!user) return;

  
    fetchBookmarks(user.id);

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
        

          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [
              payload.new as Bookmark,
              ...prev,
            ]);
          }

          if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === payload.new.id
                  ? (payload.new as Bookmark)
                  : b
              )
            );
          }

          if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
   
      });

    return () => {

      supabase.removeChannel(channel);
    };
  }, [user]);

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
    const { data, error } = await supabase
      .from("bookmarks")
      .update({ title, url })
      .eq("id", editingBookmark.id)
      .select()
      .single();

    if (error) {
   
      return;
    }

  

    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === data.id ? (data as Bookmark) : b
      )
    );
  } else {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title,
          url,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      
      return;
    }


    setBookmarks((prev) => [
      data as Bookmark,
      ...prev,
    ]);
  }

  setIsModalOpen(false);
  setTitle("");
  setUrl("");
};

  const deleteBookmark = async (id: string) => {
  console.log("Deleting bookmark:", id);

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id);

  if (error) {
   
    return;
  }
  setBookmarks((prev) =>
    prev.filter((b) => b.id !== id)
  );
};

  const logout = async () => {
    console.log("Logging out...");
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            My Bookmarks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal saved links
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:scale-105 transition-all duration-200"
          >
            + Add Bookmark
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl border border-red-400 text-red-500 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Table */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">No bookmarks yet</p>
          <p className="text-sm mt-2">Click on “Add Bookmark”</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">URL</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bookmarks.map((bookmark) => (
                <tr
                  key={bookmark.id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {bookmark.title}
                  </td>

                  <td className="px-6 py-4">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {bookmark.url}
                    </a>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => openEditModal(bookmark)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="text-red-500 hover:text-red-700 font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 animate-fadeIn">

            <h2 className="text-xl font-semibold mb-6 text-slate-800">
              {editingBookmark ? "Edit Bookmark" : "Add Bookmark"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition text-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="text"
                placeholder="URL"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition text-black"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition text-black"
              >
                Cancel
              </button>

              <button
                onClick={saveBookmark}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:scale-105 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

}