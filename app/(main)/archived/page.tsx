"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import moment from "moment";
import {
  Archive,
  Folder,
  LoaderCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

type Project = {
  projectName: string;
  previewImage: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  projectId: string;
};

const ArchivePage = () => {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringProjectId, setRestoringProjectId] = useState<string | null>(
    null
  );
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );

  // ============================================
  // GET ARCHIVED PROJECTS
  // ============================================

  const getArchivedProjects = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/projects?archived=true");

      setProjectList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch archived projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArchivedProjects();
  }, []);

  // ============================================
  // RESTORE PROJECT
  // ============================================

  const handleRestore = async (projectId: string) => {
    try {
        setRestoringProjectId(projectId);

        await axios.patch(
        `/api/projects?projectId=${projectId}&action=restore`
        );

        // Remove from archive immediately
        setProjectList((prev) =>
        prev.filter((project) => project.projectId !== projectId)
        );

        toast.add({
        title: "Project restored",
        description: "The project has been restored successfully.",
        });
    } catch (error) {
        console.error("Failed to restore project:", error);

        toast.add({
        title: "Restore failed",
        description: "Unable to restore the project.",
        type: "error",
        });
    } finally {
        setRestoringProjectId(null);
    }
    };

  // ============================================
  // PERMANENT DELETE
  // ============================================

  const handlePermanentDelete = async (projectId: string) => {
    const confirmed = window.confirm(
        "Are you sure you want to permanently delete this project? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
        setDeletingProjectId(projectId);

        await axios.delete(
            `/api/projects?projectId=${projectId}&permanent=true`
        );

        // Remove from archive immediately
        setProjectList((prev) =>
            prev.filter(
                (project) => project.projectId !== projectId
            )
        );

        toast.add({
            title: "Project deleted",
            description: "The project was permanently deleted.",
        });

    } catch (error) {
        console.error(
            "Failed to permanently delete project:",
            error
        );

        toast.add({
            title: "Delete failed",
            description:
                "Unable to permanently delete the project.",
            type: "error",
        });

    } finally {
        setDeletingProjectId(null);
    }
};

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Archive size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">Archive</h1>

              <p className="text-sm text-muted-foreground">
                Projects you've moved to the trash
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {projectList.length}{" "}
          {projectList.length === 1 ? "project" : "projects"}
        </div>
      </div>

      {/* Empty State */}
      {projectList.length === 0 ? (
        <div className="flex min-h-[450px] flex-col items-center justify-center rounded-xl border border-dashed">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Archive size={26} className="text-muted-foreground" />
          </div>

          <h2 className="text-lg font-semibold">Archive is empty</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Projects you delete will appear here.
          </p>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projectList.map((project) => (
            <div
              key={project.projectId}
              className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              {/* Preview */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                {project.previewImage ? (
                  <Image
                    src={project.previewImage}
                    alt={project.projectName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Folder
                      size={42}
                      className="text-muted-foreground/40"
                    />
                  </div>
                )}

                {/* Archived overlay */}
                <div className="absolute left-3 top-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
                  Archived
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3
                  className="truncate font-medium"
                  title={project.projectName}
                >
                  {project.projectName}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Deleted{" "}
                  {project.deletedAt
                    ? moment(project.deletedAt).fromNow()
                    : "recently"}
                </p>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  {/* Restore */}
                  <button
                    type="button"
                    onClick={() => handleRestore(project.projectId)}
                    disabled={
                      restoringProjectId === project.projectId ||
                      deletingProjectId === project.projectId
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {restoringProjectId === project.projectId ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <RotateCcw size={16} />
                    )}

                    Restore
                  </button>

                  {/* Permanent Delete */}
                  <button
                    type="button"
                    onClick={() =>
                      handlePermanentDelete(project.projectId)
                    }
                    disabled={
                      deletingProjectId === project.projectId ||
                      restoringProjectId === project.projectId
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    title="Delete permanently"
                  >
                    {deletingProjectId === project.projectId ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivePage;