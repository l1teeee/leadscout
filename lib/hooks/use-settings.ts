"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSettingsData,
  updateWorkspace,
  type UpdateWorkspacePayload,
} from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/errors";

export type SaveStatus = "idle" | "saving" | "ok" | "error";

export interface UseSettingsReturn {
  // workspace (editable)
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  // user info (read-only from API)
  userFullName: string;
  userEmail: string;
  userRole: string;
  // save lifecycle
  saveStatus: SaveStatus;
  saveError: string | null;
  save: () => Promise<boolean>;
}

export function useSettings(): UseSettingsReturn {
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getSettingsData()
      .then((data) => {
        setWorkspaceName(data.workspace.workspace_name);
        setIndustry(data.workspace.industry);
        setCountry(data.workspace.country);
        setCity(data.workspace.city);
        setPhone(data.workspace.phone ?? "");
        setWebsite(data.workspace.website ?? "");
        setUserFullName(data.user.full_name);
        setUserEmail(data.user.email);
        setUserRole(data.user.role);
      })
      .catch(() => {});
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    setSaveStatus("saving");
    setSaveError(null);
    const payload: UpdateWorkspacePayload = {
      workspace_name: workspaceName,
      industry,
      country,
      city,
      phone,
      website,
    };
    try {
      await updateWorkspace(payload);
      setSaveStatus("ok");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return true;
    } catch (error) {
      setSaveError(parseApiError(error));
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    }
  }, [city, country, industry, phone, website, workspaceName]);

  return {
    workspaceName, setWorkspaceName,
    industry, setIndustry,
    country, setCountry,
    city, setCity,
    phone, setPhone,
    website, setWebsite,
    userFullName,
    userEmail,
    userRole,
    saveStatus,
    saveError,
    save,
  };
}
