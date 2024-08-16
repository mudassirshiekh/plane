"use client";

import { useRef } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
// ui
import { Spinner, Tooltip, setToast, TOAST_TYPE, Logo } from "@plane/ui";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useAppTheme, useProject, useWorkspace } from "@/hooks/store";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { TProject } from "@/plane-web/types/projects";
import JoinButton from "../../common/join-button";
import QuickActions from "../../quick-actions";
import Attributes from "../attributes";

interface ProjectBlockProps {
  projectId: string;
  isCurrentBlockDragging?: boolean;
  setIsCurrentBlockDragging?: React.Dispatch<React.SetStateAction<boolean>>;
  canDrag?: boolean;
}

export const ProjectBlock = observer((props: ProjectBlockProps) => {
  const { projectId, isCurrentBlockDragging, canDrag } = props;
  // ref
  const projectRef = useRef<HTMLDivElement | null>(null);
  // router
  const { workspaceSlug: routerWorkspaceSlug } = useParams();
  const router = useRouter();
  const workspaceSlug = routerWorkspaceSlug?.toString();
  // hooks
  const { sidebarCollapsed: isSidebarCollapsed } = useAppTheme();
  const { getProjectById, updateProject } = useProject();
  const { currentWorkspace } = useWorkspace();

  const { isMobile } = usePlatformOS();

  const projectDetails = getProjectById(projectId);
  if (!projectDetails || !currentWorkspace) return <Spinner />;
  return (
    <div
      ref={projectRef}
      className={cn(
        "group/list-block min-h-11 relative flex flex-col gap-3 bg-custom-background-100 hover:bg-custom-background-90 p-3 pl-1.5 text-sm transition-colors border border-transparent border-b border-b-custom-border-200",
        {
          "bg-custom-background-80": isCurrentBlockDragging,
          "md:flex-row md:items-center": isSidebarCollapsed,
          "lg:flex-row lg:items-center": !isSidebarCollapsed,
        }
      )}
      onDragStart={() => {
        if (!canDrag) {
          setToast({
            type: TOAST_TYPE.WARNING,
            title: "Cannot move project",
            message: "Drag and drop is disabled for the current grouping",
          });
        }
      }}
    >
      <div className="flex w-full truncate">
        <div className="flex flex-grow items-center gap-0.5 truncate">
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 flex-shrink-0 grid place-items-center rounded bg-custom-background-90 mr-2">
              <Logo logo={projectDetails.logo_props} size={18} />
            </div>
          </div>

          {projectDetails.is_member ? (
            <Link
              id={`project-${projectDetails.id}`}
              href={`/${workspaceSlug}/projects/${projectId}/issues`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/${workspaceSlug}/projects/${projectId}/issues`);
              }}
              className={cn("w-full truncate cursor-pointer text-sm text-custom-text-100", {})}
            >
              <Tooltip tooltipContent={projectDetails.name} isMobile={isMobile} position="top-left">
                <p className="truncate">{projectDetails.name}</p>
              </Tooltip>
            </Link>
          ) : (
            <div
              id={`project-${projectDetails.id}`}
              className={cn("w-full truncate cursor-not-allowed text-sm text-custom-text-100", {})}
            >
              <Tooltip tooltipContent={projectDetails.name} isMobile={isMobile} position="top-left">
                <p className="truncate">{projectDetails.name}</p>
              </Tooltip>
            </div>
          )}
        </div>
        <div
          className={cn("block border border-custom-border-300 rounded h-full", {
            "md:hidden": isSidebarCollapsed,
            "lg:hidden": !isSidebarCollapsed,
          })}
        >
          <QuickActions project={projectDetails as TProject} workspaceSlug={workspaceSlug.toString()} />
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <>
          <Attributes
            project={projectDetails as TProject}
            isArchived={projectDetails.archived_at !== null}
            handleUpdateProject={(data) => updateProject(workspaceSlug.toString(), projectDetails.id, data)}
            workspaceSlug={workspaceSlug.toString()}
            currentWorkspace={currentWorkspace}
            cta={<JoinButton project={projectDetails as TProject} />}
          />
          <div
            className={cn("hidden", {
              "md:flex": isSidebarCollapsed,
              "lg:flex": !isSidebarCollapsed,
            })}
          >
            <QuickActions project={projectDetails as TProject} workspaceSlug={workspaceSlug.toString()} />
          </div>
        </>
      </div>
    </div>
  );
});
