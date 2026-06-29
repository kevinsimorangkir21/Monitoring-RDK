"use client";

import { useState, useMemo, useCallback } from "react";
import type { UserRecord, UserSort, UserSortKey, UserFilter } from "@/types/users";
import { userRecords as initialRecords } from "@/mock/users";

function applySort(records: UserRecord[], sort: UserSort | null): UserRecord[] {
    if (!sort) return records;
    return [...records].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp = String(av).localeCompare(String(bv));
        return sort.direction === "asc" ? cmp : -cmp;
    });
}

function applyFilter(records: UserRecord[], filter: UserFilter): UserRecord[] {
    return records.filter((r) => {
        const q = filter.search.toLowerCase();
        const matchSearch = !q ||
            r.fullName.toLowerCase().includes(q) ||
            r.username.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.department.toLowerCase().includes(q);
        const matchRole = !filter.role || r.role === filter.role;
        const matchStatus = !filter.status || r.status === filter.status;
        return matchSearch && matchRole && matchStatus;
    });
}

export function useUsers() {
    const [records, setRecords] = useState<UserRecord[]>(initialRecords);
    const [sort, setSort] = useState<UserSort | null>(null);
    const [filter, setFilter] = useState<UserFilter>({ search: "", role: "", status: "" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const processed = useMemo(
        () => applyFilter(applySort(records, sort), filter),
        [records, sort, filter]
    );

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginated = useMemo(
        () => processed.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processed, safePage, pageSize]
    );

    const handleSort = useCallback((key: UserSortKey) => {
        setSort((prev) =>
            prev?.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
        setPage(1);
    }, []);

    const handleFilterChange = useCallback((patch: Partial<UserFilter>) => {
        setFilter((prev) => ({ ...prev, ...patch }));
        setPage(1);
    }, []);

    const addUser = useCallback((user: UserRecord) => {
        setRecords((prev) => [user, ...prev]);
    }, []);

    const updateUser = useCallback((id: string, patch: Partial<UserRecord>) => {
        setRecords((prev) =>
            prev.map((u) => u.id === id ? { ...u, ...patch, updatedAt: new Date().toISOString() } : u)
        );
    }, []);

    const deleteUser = useCallback((id: string) => {
        setRecords((prev) => prev.filter((u) => u.id !== id));
    }, []);

    return {
        records,
        paginated,
        totalRecords: processed.length,
        page: safePage,
        pageSize,
        totalPages,
        sort,
        filter,
        setPage,
        setPageSize,
        handleSort,
        handleFilterChange,
        addUser,
        updateUser,
        deleteUser,
    };
}
