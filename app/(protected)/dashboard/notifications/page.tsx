"use client";

import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Bell,
  Check,
  Archive,
  MailOpen,
  Filter,
  Search,
  RefreshCw,
  Inbox,
} from "lucide-react";

type TabKey = "inbox" | "unread" | "archived";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markUnread,
    archiveNotification,
    unarchiveNotification,
    bulkAction,
  } = useNotifications();

  const [tab, setTab] = useState<TabKey>("inbox");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<
    "" | "requirement" | "labour" | "document" | "system"
  >("");
  const [priority, setPriority] = useState<
    "" | "LOW" | "NORMAL" | "HIGH" | "URGENT"
  >("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allSelectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([id]) => id),
    [selected]
  );

  const load = async (p = 1) => {
    setPage(p);
    await fetchNotifications({
      page: p,
      limit: 30,
      onlyUnread: tab === "unread",
      archived: tab === "archived",
      q: q || undefined,
      category: category || undefined,
      priority: priority || undefined,
    });
    setSelected({});
  };

  useEffect(() => {
    load(1); /* initial */
  }, []); // eslint-disable-line

  useEffect(() => {
    const id = setTimeout(() => {
      load(1);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, priority, tab]);

  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectAllOnPage = () => {
    const map: Record<string, boolean> = {};
    notifications.forEach((n) => {
      map[n.id] = true;
    });
    setSelected(map);
  };

  const clearSelection = () => setSelected({});

  const opBtn = (label: string, onClick: () => void, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm rounded-md border ${disabled ? "text-gray-300" : "text-gray-700 hover:bg-gray-50"} `}
    >
      {label}
    </button>
  );

  const badge = (text: string, active: boolean) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs border ${active ? "bg-[#3D1673]/10 text-[#3D1673] border-[#3D1673]/20" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
    >
      {text}
    </span>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"></div>
          <button
            onClick={() => load(page)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("inbox")}
            className={
              tab === "inbox"
                ? "px-3 py-2 rounded-md bg-[#3D1673] text-white"
                : "px-3 py-2 rounded-md border"
            }
          >
            Inbox
          </button>
          <button
            onClick={() => setTab("unread")}
            className={
              tab === "unread"
                ? "px-3 py-2 rounded-md bg-[#3D1673] text-white"
                : "px-3 py-2 rounded-md border"
            }
          >
            Unread
          </button>
          <button
            onClick={() => setTab("archived")}
            className={
              tab === "archived"
                ? "px-3 py-2 rounded-md bg-[#3D1673] text-white"
                : "px-3 py-2 rounded-md border"
            }
          >
            Archived
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notifications…"
                className="pl-8 pr-3 py-2 rounded-md border w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Category filter */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="px-2 py-2 rounded-md border"
                title="Category"
              >
                <option value="">All categories</option>
                <option value="requirement">Requirement</option>
                <option value="labour">Labour / Stage</option>
                <option value="document">Document</option>
                <option value="system">System</option>
              </select>

              {/* Priority filter */}
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="px-2 py-2 rounded-md border"
                title="Priority"
              >
                <option value="">All priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk bar */}
        <div className="flex items-center gap-2 p-3 rounded-2xl border bg-white shadow-sm">
          <button
            onClick={selectAllOnPage}
            className="px-3 py-2 text-sm rounded-md border"
          >
            Select page
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-2 text-sm rounded-md border"
          >
            Clear
          </button>
          <div className="text-sm text-gray-500 ml-2 mr-4">
            {allSelectedIds.length} selected
          </div>
          <div className="flex items-center gap-2">
            {opBtn(
              "Mark read",
              () => bulkAction(allSelectedIds, "read"),
              allSelectedIds.length === 0
            )}
            {opBtn(
              "Mark unread",
              () => bulkAction(allSelectedIds, "unread"),
              allSelectedIds.length === 0
            )}
            {tab !== "archived" &&
              opBtn(
                "Archive",
                () => bulkAction(allSelectedIds, "archive"),
                allSelectedIds.length === 0
              )}
            {tab === "archived" &&
              opBtn(
                "Unarchive",
                () => bulkAction(allSelectedIds, "unarchive"),
                allSelectedIds.length === 0
              )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {badge(
              tab === "archived"
                ? "Archived"
                : tab === "unread"
                  ? "Unread"
                  : "Inbox",
              true
            )}
            {category && badge(category, true)}
            {priority && badge(priority, true)}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              Nothing here yet.
            </div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50/40" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!selected[n.id]}
                      onChange={() => toggleSelect(n.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white ${
                              n.priority === "URGENT"
                                ? "bg-red-500"
                                : n.priority === "HIGH"
                                  ? "bg-orange-500"
                                  : n.priority === "LOW"
                                    ? "bg-gray-500"
                                    : "bg-blue-500"
                            }`}
                          >
                            {n.priority}
                          </span>
                          <h3 className="font-medium truncate">{n.title}</h3>
                        </div>
                        <div className="text-xs text-gray-500 shrink-0">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {n.message && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        {!n.isRead ? (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-green-600"
                          >
                            <Check className="h-3 w-3" /> Mark read
                          </button>
                        ) : (
                          <button
                            onClick={() => markUnread(n.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-blue-600"
                          >
                            <MailOpen className="h-3 w-3" /> Mark unread
                          </button>
                        )}

                        {tab !== "archived" ? (
                          <button
                            onClick={() => archiveNotification(n.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-red-600"
                          >
                            <Archive className="h-3 w-3" /> Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => unarchiveNotification(n.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-[#3D1673]"
                          >
                            <Archive className="h-3 w-3 rotate-180" /> Unarchive
                          </button>
                        )}

                        {n.actionUrl && (
                          <a
                            href={n.actionUrl}
                            className="ml-auto text-xs text-[#3D1673] hover:text-[#2b0e54]"
                          >
                            {n.actionText || "Open"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination (simple) */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => load(Math.max(1, page - 1))}
            className="px-3 py-2 rounded-md border"
            disabled={page <= 1}
          >
            Previous
          </button>
          <button
            onClick={() => load(page + 1)}
            className="px-3 py-2 rounded-md border"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
