"use client";

import { useEffect, useState } from "react";
import {
  getDocumentTemplates,
  saveDocumentTemplate,
  DocumentTemplate,
  deleteDocumentTemplate,
  getInternships,
  Internship,
} from "@/lib/supabase/db";
import {
  FileText,
  Calendar,
  Loader2,
  Eye,
  Edit3,
  Upload,
  X,
  Trash2,
  Plus,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminTemplates() {
  const [htmlTemplates, setHtmlTemplates] = useState<DocumentTemplate[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>("global");
  const [loading, setLoading] = useState(true);

  // HTML Template Editor State
  const [editingHtmlTemplate, setEditingHtmlTemplate] = useState<DocumentTemplate | null>(null);
  const [editingHtmlContent, setEditingHtmlContent] = useState<string>("");
  const [savingHtml, setSavingHtml] = useState(false);

  // Action loaders
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add Template Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newContent, setNewContent] = useState("");
  const [addingTemplate, setAddingTemplate] = useState(false);

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  const DEFAULT_BOILERPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Document Template</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .card { background: white; padding: 40px; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; text-align: center; }
    p { font-size: 14px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Document Title</h1>
    <p>Student Name: <strong>{{STUDENT_NAME}}</strong></p>
    <p>College Name: <strong>{{COLLEGE_NAME}}</strong></p>
    <p>Internship Track: <strong>{{INTERNSHIP_TITLE}}</strong></p>
  </div>
</body>
</html>`;

  async function loadData() {
    setLoading(true);
    try {
      const [ints, htmlTplList] = await Promise.all([
        getInternships(),
        getDocumentTemplates(),
      ]);
      setInternships(ints || []);
      setHtmlTemplates(htmlTplList || []);
    } catch (err) {
      console.error("Error loading Admin Templates data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setNewName("");
    setNewCode("");
    setNewContent(DEFAULT_BOILERPLATE);
    setShowAddModal(true);
  };

  const handleAddTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode || !newContent) {
      alert("Please fill in all template fields.");
      return;
    }
    const cleanCode = newCode.trim().toLowerCase().replace(/\s+/g, "_");
    setAddingTemplate(true);
    try {
      const destInternshipId = selectedInternshipId === "global" ? null : selectedInternshipId;
      await saveDocumentTemplate(
        cleanCode,
        newContent,
        true,
        newName,
        destInternshipId
      );
      setShowAddModal(false);
      await loadData();
      alert("Template successfully created!");
    } catch (err) {
      console.error("Failed to create template:", err);
      alert("Failed to create template.");
    } finally {
      setAddingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (tpl: DocumentTemplate & { isOverride?: boolean }) => {
    const isCore = ["offer_letter", "certificate", "marksheet", "project_report", "attendance_sheet", "completion_letter", "assessment", "internship_report"].includes(tpl.code);
    
    // Core templates can't be deleted at the global level
    if (!tpl.internship_id && isCore) {
      alert("Global core templates cannot be deleted because they are essential fallback resources.");
      return;
    }

    const confirmMsg = tpl.internship_id
      ? `Are you sure you want to delete the customized template override for "${tpl.name}"? It will immediately revert to using the global default.`
      : `Are you sure you want to permanently delete the template "${tpl.name}"?`;

    if (!confirm(confirmMsg)) {
      return;
    }

    setUpdatingId(tpl.id);
    try {
      await deleteDocumentTemplate(tpl.code, tpl.internship_id);
      await loadData();
      alert("Template deleted successfully.");
    } catch (err) {
      console.error("Failed to delete template:", err);
      alert("Error deleting template.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePreviewTemplate = (tpl: DocumentTemplate) => {
    const dummyValues: Record<string, string> = {
      "{{STUDENT_NAME}}": "Rahul Sharma",
      "{{NAME}}": "Rahul Sharma",
      "{{ROLL_NUMBER}}": "SI-2026-CS-892",
      "{{roll_number}}": "SI-2026-CS-892",
      "{{COLLEGE_NAME}}": "Indian Institute of Technology (IIT)",
      "{{DEPARTMENT}}": "Information Technology",
      "{{SEMESTER}}": "8th Semester",
      "{{COURSE}}": "Computer Science & Engineering",
      "{{INTERNSHIP_TITLE}}": selectedInternshipId !== "global" 
        ? (internships.find(i => i.id === selectedInternshipId)?.title || "Python Development")
        : "Full-Stack Web Development",
      "{{SCORE}}": "94%",
      "{{GRADE}}": "A+",
      "{{COMPLETION_DATE}}": "July 29, 2026",
      "{{JOINING_DATE}}": "July 01, 2026",
      "{{VERIFICATION_ID}}": "SI-2026-VERIFY-892",
      "{{DURATION}}": "120 Hrs"
    };

    let output = tpl.html_content;
    for (const [placeholder, val] of Object.entries(dummyValues)) {
      const regex = new RegExp(placeholder, "g");
      output = output.replace(regex, val);
    }

    // Apply template styling/wrapper simulation if it's missing tags
    if (!output.includes("<html>")) {
      output = `<!DOCTYPE html><html><head><style>body { font-family: sans-serif; padding: 20px; }</style></head><body>${output}</body></html>`;
    }

    setPreviewHtml(output);
    setPreviewTitle(tpl.name);
    setShowPreviewModal(true);
  };

  const handleToggleHtmlVisibility = async (tpl: DocumentTemplate & { isOverride?: boolean }) => {
    setUpdatingId(tpl.id);
    try {
      const destInternshipId = selectedInternshipId === "global" ? null : selectedInternshipId;
      const templateName = tpl.isOverride 
        ? tpl.name 
        : `${tpl.name} (${internships.find(i => i.id === selectedInternshipId)?.title || 'Custom'})`;

      await saveDocumentTemplate(
        tpl.code, 
        tpl.html_content, 
        !tpl.is_visible, 
        templateName, 
        tpl.isOverride ? tpl.internship_id : destInternshipId
      );
      await loadData();
    } catch (err) {
      console.error("Failed to toggle template visibility:", err);
      alert("Error toggling template visibility.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenHtmlEditor = (tpl: DocumentTemplate & { isOverride?: boolean }) => {
    if (selectedInternshipId !== "global" && !tpl.isOverride) {
      // Creating a new override from the global default
      setEditingHtmlTemplate({
        ...tpl,
        id: `dt-new-override-${tpl.code}`,
        internship_id: selectedInternshipId,
        name: `${tpl.name} (${internships.find(i => i.id === selectedInternshipId)?.title || 'Custom'})`,
      });
    } else {
      setEditingHtmlTemplate(tpl);
    }
    setEditingHtmlContent(tpl.html_content);
  };

  const handleSaveHtmlTemplate = async () => {
    if (!editingHtmlTemplate) return;
    setSavingHtml(true);
    try {
      await saveDocumentTemplate(
        editingHtmlTemplate.code,
        editingHtmlContent,
        editingHtmlTemplate.is_visible,
        editingHtmlTemplate.name,
        editingHtmlTemplate.internship_id
      );
      setEditingHtmlTemplate(null);
      setEditingHtmlContent("");
      await loadData();
      alert("HTML template successfully saved.");
    } catch (err) {
      console.error("Failed to save HTML template:", err);
      alert("Failed to save HTML template.");
    } finally {
      setSavingHtml(false);
    }
  };

  const handleReplaceHtmlTemplate = async (tpl: DocumentTemplate & { isOverride?: boolean }, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) {
        alert("Empty file or error reading file.");
        return;
      }
      setUpdatingId(tpl.id);
      try {
        const destInternshipId = selectedInternshipId === "global" ? null : selectedInternshipId;
        const templateName = tpl.isOverride 
          ? tpl.name 
          : `${tpl.name} (${internships.find(i => i.id === selectedInternshipId)?.title || 'Custom'})`;
          
        await saveDocumentTemplate(
          tpl.code, 
          content, 
          tpl.isOverride ? tpl.is_visible : true, 
          templateName,
          destInternshipId
        );
        await loadData();
        alert("Template successfully replaced.");
      } catch (err) {
        console.error("Failed to replace template:", err);
        alert("Error replacing template.");
      } finally {
        setUpdatingId(null);
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
    };
    reader.readAsText(file);
  };

  // Compute templates list to display
  const getTemplatesToDisplay = (): (DocumentTemplate & { isOverride?: boolean })[] => {
    if (selectedInternshipId === "global") {
      return htmlTemplates.filter((t) => !t.internship_id).map((t) => ({ ...t, isOverride: false }));
    }

    const internshipTemplates = htmlTemplates.filter((t) => t.internship_id === selectedInternshipId);
    const globalTemplates = htmlTemplates.filter((t) => !t.internship_id);
    
    const displayList: (DocumentTemplate & { isOverride?: boolean })[] = [
      ...internshipTemplates.map(t => ({ ...t, isOverride: true }))
    ];
    
    globalTemplates.forEach((gt) => {
      const hasOverride = internshipTemplates.some((it) => it.code === gt.code);
      if (!hasOverride) {
        displayList.push({
          ...gt,
          isOverride: false,
          id: `fallback-${gt.code}`,
        });
      }
    });

    return displayList.sort((a, b) => a.code.localeCompare(b.code));
  };

  const displayedTemplates = getTemplatesToDisplay();

  if (loading && htmlTemplates.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-600" />
            Document Templates Manager
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-light mt-1">
            Configure student documents (Offer Letters, Certificates, Reports) globally or override them by track.
          </p>
        </div>

        {/* Track Dropdown Filter */}
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-1.5 rounded-2xl">
          <label className="text-xs font-bold text-zinc-650 px-2">Manage Track:</label>
          <select
            value={selectedInternshipId}
            onChange={(e) => setSelectedInternshipId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-xs font-bold focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer min-w-[200px]"
          >
            <option value="global">All Tracks (Global Default)</option>
            {internships.map((internship) => (
              <option key={internship.id} value={internship.id}>
                {internship.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-zinc-800">
              {selectedInternshipId === "global" ? "Global Default Templates" : "Internship Custom Templates"}
            </h3>
            <p className="text-[10px] text-zinc-400 font-light mt-0.5">
              {selectedInternshipId === "global" 
                ? "Core templates used as system fallback when no track override exists."
                : `Document configuration for: ${internships.find(i => i.id === selectedInternshipId)?.title || "Selected Track"}`
              }
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/10"
          >
            <Plus className="h-4 w-4" />
            Add Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className={`glass-panel border rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all bg-white ${
                tpl.isOverride === true 
                  ? "border-indigo-200 ring-2 ring-indigo-500/10" 
                  : "border-zinc-200"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[9px] text-zinc-400 font-mono">CODE: {tpl.code}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Override status indicator badge */}
                    {selectedInternshipId !== "global" && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        tpl.isOverride 
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100 flex items-center gap-1" 
                          : "bg-slate-50 text-slate-500 border-slate-100"
                      }`}>
                        {tpl.isOverride && <Sparkles className="h-2.5 w-2.5 animate-pulse text-indigo-500" />}
                        {tpl.isOverride ? "Custom Override" : "Global Fallback"}
                      </span>
                    )}
                    
                    {/* Delete button (only for non-fallback templates, and only if not core global template) */}
                    {(tpl.isOverride || (!tpl.internship_id && !["offer_letter", "certificate", "marksheet", "project_report"].includes(tpl.code))) && (
                      <button
                        onClick={() => handleDeleteTemplate(tpl)}
                        className="p-1 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-750 transition-colors cursor-pointer"
                        title={tpl.isOverride ? "Delete Custom Override" : "Delete Global Template"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleToggleHtmlVisibility(tpl)}
                      disabled={updatingId !== null}
                      title={tpl.is_visible ? "Click to Hide from Students" : "Click to Show to Students"}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer hover:shadow-sm ${
                        tpl.is_visible
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200 active:scale-95"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200 active:scale-95"
                      }`}
                    >
                      {tpl.is_visible ? "Visible" : "Hidden"}
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-zinc-900 mb-1">{tpl.name}</h4>
                <p className="text-zinc-500 text-xs font-light mb-4 leading-relaxed line-clamp-2 min-h-[32px]">
                  Customizable HTML layout for student {tpl.name}.
                </p>
                
                <p className="text-zinc-400 text-[9px] font-light mb-4 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last updated: {new Date(tpl.updated_at).toLocaleString()}
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-4 flex gap-2 justify-between items-center">
                <button
                  onClick={() => handlePreviewTemplate(tpl)}
                  className="flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-805 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                  Preview
                </button>

                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 hover:bg-indigo-50/60 hover:text-indigo-700 hover:border-indigo-100 active:bg-indigo-100 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm">
                    <Upload className="h-3.5 w-3.5" />
                    Replace
                    <input
                      type="file"
                      accept=".html"
                      disabled={updatingId !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleReplaceHtmlTemplate(tpl, file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handleOpenHtmlEditor(tpl)}
                    className="flex items-center gap-1 bg-indigo-55 border border-indigo-100 hover:bg-indigo-600 hover:text-white active:bg-indigo-700 active:scale-95 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {selectedInternshipId !== "global" && !tpl.isOverride ? "Customize" : "Edit"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HTML CODE EDITOR MODAL */}
      {editingHtmlTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                  Edit Template: {editingHtmlTemplate.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingHtmlTemplate(null);
                  setEditingHtmlContent("");
                }}
                className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-705 hover:bg-zinc-100 active:bg-zinc-200 active:scale-90 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Editor Area */}
            <div className="flex-grow flex flex-col p-6 space-y-4 overflow-hidden bg-zinc-50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-light">
                  Tip: You can use double curly-braces placeholders like <code className="bg-white border border-zinc-200 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">{"{{studentName}}"}</code>, <code className="bg-white border border-zinc-200 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">{"{{collegeName}}"}</code>, etc.
                </span>
                <span className="font-mono text-zinc-550">{editingHtmlContent.length} characters</span>
              </div>
              <textarea
                value={editingHtmlContent}
                onChange={(e) => setEditingHtmlContent(e.target.value)}
                className="flex-grow w-full font-mono text-xs p-5 rounded-2xl border border-zinc-250 bg-zinc-950 text-emerald-400 focus:outline-none focus:border-indigo-500 shadow-inner resize-none overflow-y-auto leading-relaxed"
                spellCheck="false"
              />
            </div>
            
            {/* Footer */}
            <div className="flex h-16 shrink-0 items-center justify-end px-6 border-t border-zinc-200 bg-zinc-50 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingHtmlTemplate(null);
                  setEditingHtmlContent("");
                }}
                className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 active:bg-zinc-200 active:scale-95 px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHtmlTemplate}
                disabled={savingHtml}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {savingHtml ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DOCUMENT TEMPLATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Add Document Template</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-750 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTemplateSubmit} className="flex-grow flex flex-col p-6 space-y-4 overflow-hidden bg-zinc-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider mb-1.5">Template Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 placeholder-zinc-400 transition-colors"
                    placeholder="e.g. Recommendation Letter"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider mb-1.5">Template Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 placeholder-zinc-400 transition-colors"
                    placeholder="e.g. recommendation_letter"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2 min-h-[300px]">
                <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider mb-1.5">HTML Boilerplate Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="flex-grow w-full font-mono text-xs p-5 rounded-2xl border border-zinc-250 bg-zinc-950 text-emerald-400 focus:outline-none focus:border-indigo-500 shadow-inner resize-none overflow-y-auto leading-relaxed"
                  spellCheck="false"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-500 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTemplate}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white font-bold px-5 py-2.5 text-xs transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-indigo-650/10"
                >
                  {addingTemplate ? "Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">{previewTitle} Mock Preview</h3>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewHtml("");
                }}
                className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-650 px-4 py-2 transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            <div className="flex-grow bg-zinc-100 p-4 flex items-center justify-center overflow-hidden">
              <iframe
                title="Document Template Preview"
                srcDoc={previewHtml}
                className="w-full h-full border border-zinc-200 bg-white rounded-2xl shadow-inner"
                sandbox="allow-modals allow-scripts allow-same-origin allow-downloads"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
