"use client";

import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Bell,
  Check,
  Archive,
  MailOpen,
  Search,
  RefreshCw,
  Inbox,
  Filter,
  X,
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
    load(1); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    notifications.forEach((n) => (map[n.id] = true));
    setSelected(map);
  };

  const clearSelection = () => setSelected({});

  const opBtn = (label: string, onClick: () => void, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm rounded-md border transition ${
        disabled
          ? "text-gray-300"
          : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  const badge = (text: string, active: boolean) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs border ${
        active
          ? "bg-[#3D1673]/10 text-[#3D1673] border-[#3D1673]/20"
          : "text-gray-600 border-gray-200"
      }`}
    >
      {text}
    </span>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"></div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notifications…"
                className="pl-8 pr-3 py-2 rounded-md border w-64"
              />
            </div>

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

            <button
              onClick={() => load(page)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {/* Mobile controls */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={() => load(page)}
              className="rounded-md border px-3 py-2"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs (scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {(["inbox", "unread", "archived"] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap px-3 py-2 rounded-full text-sm border transition ${
                tab === t
                  ? "bg-[#3D1673] text-white border-[#3D1673]"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t === "inbox" ? "Inbox" : t === "unread" ? "Unread" : "Archived"}
            </button>
          ))}

          {/* active chips (desktop shows in bulk bar; show here on mobile) */}
          <div className="sm:hidden ml-auto flex items-center gap-2">
            {category && badge(category, true)}
            {priority && badge(priority, true)}
          </div>
        </div>

        {/* Bulk bar (desktop) */}
        <div className="hidden sm:flex items-center gap-2 p-3 rounded-2xl border bg-white shadow-sm">
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
                  className={`p-3 sm:p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${
                    !n.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={!!selected[n.id]}
                      onChange={() => toggleSelect(n.id)}
                      aria-label="Select"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center justify-between gap-2">
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
                          <h3 className="font-medium truncate text-sm sm:text-base">
                            {n.title}
                          </h3>
                        </div>
                        <div className="text-[11px] sm:text-xs text-gray-500 shrink-0">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {n.message && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3 sm:line-clamp-2">
                          {n.message}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {!n.isRead ? (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700 hover:text-green-600"
                          >
                            <Check className="h-3 w-3" /> Mark read
                          </button>
                        ) : (
                          <button
                            onClick={() => markUnread(n.id)}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700 hover:text-blue-600"
                          >
                            <MailOpen className="h-3 w-3" /> Mark unread
                          </button>
                        )}

                        {tab !== "archived" ? (
                          <button
                            onClick={() => archiveNotification(n.id)}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700 hover:text-red-600"
                          >
                            <Archive className="h-3 w-3" /> Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => unarchiveNotification(n.id)}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700 hover:text-[#3D1673]"
                          >
                            <Archive className="h-3 w-3 rotate-180" /> Unarchive
                          </button>
                        )}

                        {n.actionUrl && (
                          <a
                            href={n.actionUrl}
                            className="ml-auto text-xs sm:text-sm text-[#3D1673] hover:text-[#2b0e54]"
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            onClick={() => load(Math.max(1, page - 1))}
            className="px-4 py-2 rounded-md border w-full sm:w-auto"
            disabled={page <= 1}
          >
            Previous
          </button>
          <button
            onClick={() => load(page + 1)}
            className="px-4 py-2 rounded-md border w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Filters</h3>
              <button
                aria-label="Close"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-md p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notifications…"
                className="pl-8 pr-3 py-2 rounded-md border w-full"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Category</label>
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
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Priority</label>
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

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setQ("");
                  setCategory("");
                  setPriority("");
                }}
                className="px-4 py-2 rounded-md border"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setMobileFiltersOpen(false);
                  load(1);
                }}
                className="px-4 py-2 rounded-md bg-[#3D1673] text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky mobile bulk bar */}
      {allSelectedIds.length > 0 && (
        <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40">
          <div className="rounded-2xl border bg-white shadow-lg p-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {allSelectedIds.length} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
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
              <button
                onClick={() => bulkAction(allSelectedIds, "read")}
                className="px-3 py-2 text-sm rounded-md border"
              >
                Read
              </button>
              <button
                onClick={() => bulkAction(allSelectedIds, "unread")}
                className="px-3 py-2 text-sm rounded-md border"
              >
                Unread
              </button>
              {tab !== "archived" ? (
                <button
                  onClick={() => bulkAction(allSelectedIds, "archive")}
                  className="px-3 py-2 text-sm rounded-md border"
                >
                  Archive
                </button>
              ) : (
                <button
                  onClick={() => bulkAction(allSelectedIds, "unarchive")}
                  className="px-3 py-2 text-sm rounded-md border"
                >
                  Unarchive
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
