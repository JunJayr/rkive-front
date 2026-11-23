'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import {
  useCreatePanelNominationMutation,
  useGetFacultyQuery,
  useGetPanelNominationsQuery,
  useGetUserProfileQuery,
  useGetWorkflowStatusQuery,
  usePanelGenerateMutation,
  useRevisePanelNominationMutation,
  useSubmitPanelNominationMutation,
  useUpdatePanelNominationMutation,
  type FacultyRosterEntry,
  type PanelNomination,
  type Proponent,
} from '@/redux/features/authApiSlice';

interface NominationFields {
  department: string;
  research_title: string;
  lead_researcher: string;
  lead_contactno: string;
}

interface ProponentRow {
  id: number;
  name: string;
  email: string;
}

interface RosterRow {
  id: number;
  role: string;
  faculty_id: string;
}

interface PreviewState {
  url: string;
  isPdf: boolean;
}

const FIXED_ROLES = [
  { role: 'adviser', label: 'Research Adviser' },
  { role: 'panel_chair', label: 'Panel Chair' },
  { role: 'panel1', label: 'Panel Member 1' },
] as const;

const emptyFields: NominationFields = {
  department: '',
  research_title: '',
  lead_researcher: '',
  lead_contactno: '',
};

function isFixedRole(role: string): boolean {
  return FIXED_ROLES.some((item) => item.role === role);
}

function roleLabel(role: string): string {
  const fixed = FIXED_ROLES.find((item) => item.role === role);
  if (fixed) return fixed.label;
  const suffix = role.replace('panel', '');
  if (role.startsWith('panel') && suffix) return `Panel Member ${suffix}`;
  return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

async function readError(error: unknown): Promise<string> {
  const data = (error as { data?: unknown } | null)?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text()) as Record<string, unknown>;
      if (typeof parsed.error === 'string') return parsed.error;
      if (typeof parsed.detail === 'string') return parsed.detail;
    } catch {
      // fall through to the generic message
    }
  }
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.error === 'string') return record.error;
    if (typeof record.detail === 'string') return record.detail;
    if (Array.isArray(record.reasons) && record.reasons.length) {
      return (record.reasons as string[]).join(' ');
    }
  }
  return 'Unable to complete the nomination request.';
}

function readUrlNominationId(): number | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('nomination_id');
  return value && /^\d+$/.test(value) ? Number(value) : null;
}

export default function usePanelGeneration() {
  const { data: profile } = useGetUserProfileQuery();
  const { data: facultyList = [] } = useGetFacultyQuery();
  const { data: workflowStatus } = useGetWorkflowStatusQuery();
  const { data: nominations = [], refetch: refetchNominations } = useGetPanelNominationsQuery();
  const [panelGenerate, { isLoading: generating }] = usePanelGenerateMutation();
  const [createNomination, { isLoading: creating }] = useCreatePanelNominationMutation();
  const [updateNomination, { isLoading: updating }] = useUpdatePanelNominationMutation();
  const [submitNomination, { isLoading: submitting }] = useSubmitPanelNominationMutation();
  const [reviseNomination, { isLoading: revising }] = useRevisePanelNominationMutation();

  const stage = workflowStatus?.stages.find((item) => item.key === 'panel_nomination');
  const urlNominationId = useRef<number | null>(readUrlNominationId()).current;
  const discoveredId = urlNominationId
    ?? stage?.nomination_id
    ?? nominations[0]?.nomination_id
    ?? null;

  const [nominationId, setNominationId] = useState<number | null>(discoveredId);
  const [fields, setFields] = useState<NominationFields>(emptyFields);
  const [proponents, setProponents] = useState<ProponentRow[]>(() => [
    { id: 1, name: '', email: '' },
    { id: 2, name: '', email: '' },
    { id: 3, name: '', email: '' },
  ]);
  const [roster, setRoster] = useState<RosterRow[]>(() =>
    FIXED_ROLES.map((item, index) => ({ id: index + 1, role: item.role, faculty_id: '' }))
  );
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const nextProponentId = useRef(4);
  const nextRosterId = useRef(FIXED_ROLES.length + 1);
  const loadedMarker = useRef('');
  const seededProfile = useRef(false);
  const generateLock = useRef(false);
  const saveLock = useRef(false);
  const submitLock = useRef(false);
  const officialLock = useRef(false);
  const revisionLock = useRef(false);

  const nomination = useMemo<PanelNomination | null>(() => {
    if (!nominationId) return null;
    return nominations.find((item) => item.nomination_id === nominationId) ?? null;
  }, [nominations, nominationId]);

  useEffect(() => {
    if (discoveredId && !nominationId) setNominationId(discoveredId);
  }, [discoveredId, nominationId]);

  useEffect(() => {
    if (!nomination) return;
    const marker = `${nomination.nomination_id}:${nomination.attempt}`;
    if (loadedMarker.current === marker) return;
    loadedMarker.current = marker;
    setNominationId(nomination.nomination_id);

    const savedFields = nomination.form_data || {};
    setFields({
      department: nomination.department || String(savedFields.department || ''),
      research_title: nomination.research_title || '',
      lead_researcher: nomination.lead_researcher || '',
      lead_contactno: nomination.lead_contactno || String(savedFields.lead_contactno || ''),
    });

    const savedProponents: ProponentRow[] = (nomination.proponents || []).map((item, index) => ({
      id: index + 1,
      name: typeof item === 'string' ? item : item?.name || '',
      email: typeof item === 'string' ? '' : item?.email || '',
    }));
    nextProponentId.current = Math.max(savedProponents.length + 1, 4);
    setProponents([
      ...savedProponents,
      ...Array.from({ length: Math.max(0, 3 - savedProponents.length) }, (_, index) => ({
        id: nextProponentId.current++,
        name: '',
        email: '',
      })),
    ]);

    const savedRoster: RosterRow[] = (nomination.faculty_roster || []).map((item, index) => ({
      id: index + 1,
      role: item.role,
      faculty_id: item.faculty_id ? String(item.faculty_id) : '',
    }));
    nextRosterId.current = Math.max(savedRoster.length + 1, FIXED_ROLES.length + 1);
    setRoster(normalizeRoster(savedRoster));
  }, [nomination]);

  useEffect(() => {
    if (nomination || seededProfile.current) return;
    const department = profile?.department;
    if (typeof department !== 'string' || !department) return;
    seededProfile.current = true;
    setFields((previous) => (previous.department ? previous : { ...previous, department }));
  }, [nomination, profile?.department]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const status = nomination?.status ?? 'draft';
  const locked = ['submitted', 'pending', 'approved'].includes(status);
  const needsRevision = status === 'rejected' || status === 'revision_required';
  const canManageDepartment = Boolean(
    profile?.is_superadmin
      || profile?.is_department_head
      || profile?.is_headdept
      || profile?.can_administer_academics
  );
  const editable = !locked && !needsRevision;

  const cleanedProponents: Proponent[] = proponents
    .map((row) => ({ name: row.name.trim(), email: row.email.trim() }))
    .filter((row) => row.name);

  const localBlockers = useMemo(() => {
    const reasons: string[] = [];
    if (!fields.research_title.trim()) reasons.push('Research title is required.');
    if (!fields.lead_researcher.trim()) reasons.push('Lead researcher is required.');
    if (cleanedProponents.length < 3) reasons.push('At least three research proponents are required.');
    const byRole = new Map(roster.map((row) => [row.role, row.faculty_id]));
    for (const item of FIXED_ROLES) {
      if (!byRole.get(item.role)) reasons.push(`${item.label} is required.`);
    }
    const panelIds = new Set(
      roster
        .filter((row) => row.role !== 'adviser' && row.faculty_id)
        .map((row) => row.faculty_id)
    );
    if (panelIds.size < 3) {
      reasons.push(`At least three distinct nominated faculty members are required (currently ${panelIds.size}).`);
    }
    return reasons;
  }, [cleanedProponents.length, fields.lead_researcher, fields.research_title, roster]);

  const blockers = editable ? localBlockers : (nomination?.submit_blockers ?? []);
  const busy = generating || creating || updating || submitting || revising;

  const payload = useMemo(() => {
    const facultyRoster: FacultyRosterEntry[] = roster
      .filter((row) => row.faculty_id && /^\d+$/.test(row.faculty_id))
      .map((row) => ({
        role: row.role,
        label: roleLabel(row.role),
        faculty_id: Number(row.faculty_id),
        name: '',
        title: '',
      }));
    const coResearchers: Record<string, string> = {};
    cleanedProponents.slice(0, 5).forEach((item, index) => {
      coResearchers[`co_researcher${index + 1}`] = item.name;
    });
    return {
      department: fields.department,
      research_title: fields.research_title,
      lead_researcher: fields.lead_researcher,
      lead_contactno: fields.lead_contactno,
      proponents: cleanedProponents,
      faculty_roster: facultyRoster,
      form_data: {
        ...fields,
        ...coResearchers,
        faculty_ids: Object.fromEntries(roster.map((row) => [row.role, row.faculty_id])),
      },
    };
  }, [cleanedProponents, fields, roster]);

  const changeField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFields((previous) => ({ ...previous, [name]: value }));
  };

  const changeProponent = (id: number, field: 'name' | 'email', value: string) => {
    setProponents((previous) => previous.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addProponent = () => {
    setProponents((previous) => [...previous, { id: nextProponentId.current++, name: '', email: '' }]);
  };

  const removeProponent = (id: number) => {
    setProponents((previous) => (previous.length <= 3 ? previous : previous.filter((row) => row.id !== id)));
  };

  const changeFaculty = (id: number, facultyId: string) => {
    setRoster((previous) => previous.map((row) => (row.id === id ? { ...row, faculty_id: facultyId } : row)));
  };

  const addPanelMember = () => {
    setRoster((previous) => normalizeRoster([
      ...previous,
      { id: nextRosterId.current++, role: `panel${previous.length + 1}`, faculty_id: '' },
    ]));
  };

  const removePanelMember = (id: number) => {
    setRoster((previous) => {
      const target = previous.find((row) => row.id === id);
      if (!target || isFixedRole(target.role)) return previous;
      return normalizeRoster(previous.filter((row) => row.id !== id));
    });
  };

  const refreshAll = async () => {
    await Promise.all([refetchNominations()]);
  };

  const generate = async (submit: boolean) => {
    const result = await panelGenerate({
      ...payload,
      nomination_id: nominationId ?? undefined,
      submit,
    }) as { data?: Blob; error?: unknown; meta?: { response?: Response } };
    if (result.error) throw result.error;
    if (!result.data) throw new Error('The nomination document was empty.');
    const blob = result.data;
    const headerId = result.meta?.response?.headers?.get('X-Nomination-ID');
    const headerNumber = headerId && /^\d+$/.test(headerId) ? Number(headerId) : null;
    if (headerNumber) setNominationId(headerNumber);
    const refreshed = await refetchNominations();
    const saved = headerNumber
      ? refreshed.data?.find((item) => item.nomination_id === headerNumber)
      : refreshed.data?.find((item) => item.research_title.trim().toLowerCase() === fields.research_title.trim().toLowerCase());
    if (saved) setNominationId(saved.nomination_id);
    return blob;
  };

  const handleGenerate = async () => {
    if (generateLock.current) return;
    generateLock.current = true;
    setNotice(null);
    try {
      const blob = await generate(false);
      if (preview) URL.revokeObjectURL(preview.url);
      setPreview({ url: URL.createObjectURL(blob), isPdf: blob.type.includes('pdf') });
      setNotice({ type: 'ok', text: 'Nomination saved. Review the generated document below.' });
      toast.success('Nomination saved and document generated.');
    } catch (error) {
      setNotice({ type: 'err', text: await readError(error) });
      toast.error('Unable to save and generate the nomination.');
    } finally {
      generateLock.current = false;
    }
  };

  const persistNomination = async (): Promise<number> => {
    if (nominationId) {
      await updateNomination({ nomination_id: nominationId, data: payload }).unwrap();
      return nominationId;
    }
    const created = await createNomination(payload).unwrap();
    setNominationId(created.nomination_id);
    loadedMarker.current = '';
    await refreshAll();
    return created.nomination_id;
  };

  const handleSaveDraft = async () => {
    if (saveLock.current) return;
    saveLock.current = true;
    setNotice(null);
    try {
      const id = await persistNomination();
      await refreshAll();
      setNotice({ type: 'ok', text: `Draft saved as nomination #${id}.` });
      toast.success('Draft saved.');
    } catch (error) {
      setNotice({ type: 'err', text: await readError(error) });
      toast.error('Unable to save the draft.');
    } finally {
      saveLock.current = false;
    }
  };

  const handleSubmit = async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    setNotice(null);
    try {
      const id = await persistNomination();
      const result = await submitNomination(id).unwrap();
      await refreshAll();
      if (result.already_submitted) {
        setNotice({ type: 'ok', text: 'This nomination was already submitted and is under review.' });
        toast.info('This nomination was already submitted.');
      } else {
        setNotice({ type: 'ok', text: 'Panel Nomination submitted for review.' });
        toast.success('Panel Nomination submitted for review.');
      }
    } catch (error) {
      setNotice({ type: 'err', text: await readError(error) });
      toast.error('Unable to submit the nomination.');
    } finally {
      submitLock.current = false;
    }
  };

  const handleRevision = async () => {
    if (!nominationId || revisionLock.current) return;
    revisionLock.current = true;
    setNotice(null);
    try {
      await reviseNomination(nominationId).unwrap();
      loadedMarker.current = '';
      await refreshAll();
      setNotice({ type: 'ok', text: 'Revision started. You can now update and resubmit the nomination.' });
      toast.success('New revision attempt started.');
    } catch (error) {
      setNotice({ type: 'err', text: await readError(error) });
    } finally {
      revisionLock.current = false;
    }
  };

  const handleOfficialForm = async () => {
    if (!nominationId || officialLock.current) return;
    officialLock.current = true;
    try {
      const blob = await generate(false);
      const extension = blob.type.includes('pdf') ? 'pdf' : 'docx';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `panel_nomination_${nominationId}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Official nomination form downloaded.');
    } catch (error) {
      toast.error(await readError(error));
    } finally {
      officialLock.current = false;
    }
  };

  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  return {
    fields,
    proponents,
    roster,
    nomination,
    nominationId,
    status,
    attempt: nomination?.attempt ?? 1,
    reason: nomination?.reason || stage?.reason || '',
    decisionReason: nomination?.decision_reason || '',
    blockers,
    editable,
    locked,
    needsRevision,
    canManageDepartment,
    busy,
    preview,
    notice,
    facultyList,
    changeField,
    changeProponent,
    addProponent,
    removeProponent,
    changeFaculty,
    addPanelMember,
    removePanelMember,
    handleGenerate,
    handleSaveDraft,
    handleSubmit,
    handleRevision,
    handleOfficialForm,
    clearPreview,
    roleLabel,
  };
}

function normalizeRoster(rows: RosterRow[]): RosterRow[] {
  const normalized: RosterRow[] = [];
  FIXED_ROLES.forEach((fixed, index) => {
    const existing = rows.find((row) => row.role === fixed.role);
    normalized.push(existing
      ? { ...existing, role: fixed.role }
      : { id: nextRosterIds[index] ?? index + 1, role: fixed.role, faculty_id: '' });
  });
  rows
    .filter((row) => !isFixedRole(row.role))
    .forEach((row, index) => {
      const role = `panel${index + 2}`;
      normalized.push({ ...row, role });
    });
  return normalized;
}

// Fallback ids are only used when a fixed role is missing from saved data.
const nextRosterIds = [101, 102, 103];
