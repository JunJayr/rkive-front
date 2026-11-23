'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiSettings, FiFileText } from 'react-icons/fi';

import Sidebar from '@/components/common/admin/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useGetOfficialTemplatesQuery,
  useUpdateOfficialTemplateMutation,
} from '@/redux/features/authApiSlice';

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useGetSystemSettingsQuery();
  const { data: templates, refetch: refetchTemplates } = useGetOfficialTemplatesQuery();
  const [updateSettings, { isLoading: savingSettings }] = useUpdateSystemSettingsMutation();
  const [updateTemplate, { isLoading: savingTemplate }] = useUpdateOfficialTemplateMutation();

  const [settingsDraft, setSettingsDraft] = useState<Record<string, string> | null>(null);
  const [templateDrafts, setTemplateDrafts] = useState<Record<string, { revision: string; form_number: string; effective_date: string; file: File | null }>>({});
  const [error, setError] = useState('');

  const currentSettings = settingsDraft ?? settings ?? {};

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await updateSettings(currentSettings).unwrap();
      setSettingsDraft(null);
      toast.success('Shared settings saved.');
    } catch (e) {
      setError((e as { data?: { error?: string } })?.data?.error || 'Unable to save settings.');
    }
  };

  const saveTemplate = async (code: string) => {
    setError('');
    const draft = templateDrafts[code];
    if (!draft) return;
    const body = new FormData();
    body.append('revision', draft.revision);
    body.append('form_number', draft.form_number);
    if (draft.effective_date) body.append('effective_date', draft.effective_date);
    if (draft.file) body.append('file', draft.file);
    try {
      await updateTemplate({ code, data: body }).unwrap();
      setTemplateDrafts((prev) => ({ ...prev, [code]: { ...draft, file: null } }));
      refetchTemplates();
      toast.success('Official template updated.');
    } catch (e) {
      setError((e as { data?: { error?: string } })?.data?.error || 'Unable to update template.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-12 pt-24 sm:px-8 md:pt-10 lg:px-10">
          <div className="mx-auto w-full max-w-5xl">
            <header className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">RKIVE / Research Administration</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#103F78]">Settings &amp; Official Templates</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-500">Manage shared form numbers, revision codes and the official Word templates used for defense applications.</p>
            </header>

            {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {isLoading && (
              <div className="mb-6 flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white"><Spinner /></div>
            )}

            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#103F78]"><FiSettings /> Shared settings</h2>
              <p className="mt-1 text-xs text-slate-500">Values are available to the whole RKIVE workflow.</p>
              <form onSubmit={saveSettings} className="mt-4 grid gap-4 sm:grid-cols-2">
                {Object.entries(currentSettings).map(([key, value]) => (
                  <label key={key} className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{key.replace(/_/g, ' ')}</span>
                    <input
                      value={value}
                      onChange={(e) => setSettingsDraft({ ...currentSettings, [key]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#103F78]"
                    />
                  </label>
                ))}
                {!Object.keys(currentSettings).length && <p className="text-sm text-slate-500">No shared settings have been configured yet.</p>}
                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Add or update a setting</span>
                    <div className="flex flex-wrap gap-2">
                      <input id="new-setting-key" placeholder="setting_key" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      <input id="new-setting-value" placeholder="value" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      <button type="button" onClick={() => {
                        const keyInput = document.getElementById('new-setting-key') as HTMLInputElement | null;
                        const valueInput = document.getElementById('new-setting-value') as HTMLInputElement | null;
                        const key = keyInput?.value.trim();
                        if (!key) return;
                        setSettingsDraft({ ...currentSettings, [key]: valueInput?.value || '' });
                        if (keyInput) keyInput.value = '';
                        if (valueInput) valueInput.value = '';
                      }} className="rounded-xl border border-[#103F78] px-4 py-2 text-xs font-bold text-[#103F78]">Add</button>
                    </div>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={savingSettings} className="inline-flex items-center gap-2 rounded-xl bg-[#103F78] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    <FiSave size={16} /> {savingSettings ? 'Saving…' : 'Save settings'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#103F78]"><FiFileText /> Official document templates</h2>
              <div className="mt-4 space-y-4">
                {(templates || []).map((template) => {
                  const draft = templateDrafts[template.code] || {
                    revision: template.revision,
                    form_number: template.form_number,
                    effective_date: template.effective_date || '',
                    file: null,
                  };
                  return (
                    <div key={template.code} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{template.name}</h3>
                          <p className="text-xs text-slate-500">{template.code} · currently {template.form_number || '—'} rev {template.revision || '—'}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {template.is_active ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <input value={draft.form_number} onChange={(e) => setTemplateDrafts((prev) => ({ ...prev, [template.code]: { ...draft, form_number: e.target.value } }))} placeholder="Form number" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                        <input value={draft.revision} onChange={(e) => setTemplateDrafts((prev) => ({ ...prev, [template.code]: { ...draft, revision: e.target.value } }))} placeholder="Revision" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                        <input type="date" value={draft.effective_date} onChange={(e) => setTemplateDrafts((prev) => ({ ...prev, [template.code]: { ...draft, effective_date: e.target.value } }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <input type="file" accept=".docx" onChange={(e) => setTemplateDrafts((prev) => ({ ...prev, [template.code]: { ...draft, file: e.target.files?.[0] ?? null } }))} className="text-xs text-slate-600" />
                        <button type="button" onClick={() => void saveTemplate(template.code)} disabled={savingTemplate} className="rounded-lg bg-[#103F78] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Save template</button>
                      </div>
                    </div>
                  );
                })}
                {!templates?.length && <p className="text-sm text-slate-500">No official templates have been configured.</p>}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
