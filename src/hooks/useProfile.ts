"use client";

import { useState, useCallback } from "react";
import type { ProfileData, EditProfileForm } from "@/types/profile";
import { profileData as initialData } from "@/mock/profile";

export function useProfile() {
    const [profile, setProfile] = useState<ProfileData>(initialData);

    const updateProfile = useCallback((form: EditProfileForm) => {
        setProfile((prev) => ({
            ...prev,
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            department: form.department,
            position: form.position,
            avatarInitials: form.fullName
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0]?.toUpperCase() ?? "")
                .join(""),
        }));
    }, []);

    return { profile, updateProfile };
}
