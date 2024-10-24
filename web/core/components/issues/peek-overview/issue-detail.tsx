import { FC, useEffect } from "react";
import { observer } from "mobx-react";
// components
import { IssueParentDetail, TIssueOperations } from "@/components/issues";
// store hooks
import { useIssueDetail, useUser } from "@/hooks/store";
// hooks
import useReloadConfirmations from "@/hooks/use-reload-confirmation";
// plane web components
import { IssueTypeSwitcher } from "@/plane-web/components/issues";
// services
import { IssueService } from "@/services/issue";
const issueService = new IssueService();
// local components
import { IssueDescriptionInput } from "../description-input";
import { IssueReaction } from "../issue-detail/reactions";
import { IssueTitleInput } from "../title-input";

interface IPeekOverviewIssueDetails {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issueOperations: TIssueOperations;
  disabled: boolean;
  isArchived: boolean;
  isSubmitting: "submitting" | "submitted" | "saved";
  setIsSubmitting: (value: "submitting" | "submitted" | "saved") => void;
}

export const PeekOverviewIssueDetails: FC<IPeekOverviewIssueDetails> = observer((props) => {
  const { workspaceSlug, issueId, issueOperations, disabled, isArchived, isSubmitting, setIsSubmitting } = props;
  // store hooks
  const { data: currentUser } = useUser();
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  // hooks
  const { setShowAlert } = useReloadConfirmations(isSubmitting === "submitting");

  useEffect(() => {
    if (isSubmitting === "submitted") {
      setShowAlert(false);
      setTimeout(async () => {
        setIsSubmitting("saved");
      }, 2000);
    } else if (isSubmitting === "submitting") {
      setShowAlert(true);
    }
  }, [isSubmitting, setShowAlert, setIsSubmitting]);

  const issue = issueId ? getIssueById(issueId) : undefined;
  if (!issue || !issue.project_id) return <></>;

  return (
    <div className="space-y-2">
      {issue.parent_id && (
        <IssueParentDetail
          workspaceSlug={workspaceSlug}
          projectId={issue.project_id}
          issueId={issueId}
          issue={issue}
          issueOperations={issueOperations}
        />
      )}
      <IssueTypeSwitcher issueId={issueId} disabled={isArchived || disabled} />
      <IssueTitleInput
        workspaceSlug={workspaceSlug}
        projectId={issue.project_id}
        issueId={issue.id}
        isSubmitting={isSubmitting}
        setIsSubmitting={(value) => setIsSubmitting(value)}
        issueOperations={issueOperations}
        disabled={disabled}
        value={issue.name}
        containerClassName="-ml-3"
      />

      <IssueDescriptionInput
        containerClassName="-ml-3 border-none"
        descriptionHTML={issue.description_html ?? "<p></p>"}
        disabled={disabled}
        fetchDescription={async () => {
          if (!workspaceSlug || !issue.project_id || !issue.id) return;
          return await issueService.fetchDescriptionBinary(workspaceSlug, issue.project_id, issue.id);
        }}
        updateDescription={async (data) => {
          if (!workspaceSlug || !issue.project_id || !issue.id) return;
          return await issueService.updateDescriptionBinary(workspaceSlug, issue.project_id, issue.id, {
            description_binary: data,
          });
        }}
        issueId={issue.id}
        issueOperations={issueOperations}
        projectId={issue.project_id}
        setIsSubmitting={(value) => setIsSubmitting(value)}
        workspaceSlug={workspaceSlug}
      />

      {currentUser && (
        <IssueReaction
          workspaceSlug={workspaceSlug}
          projectId={issue.project_id}
          issueId={issueId}
          currentUser={currentUser}
          disabled={isArchived}
        />
      )}
    </div>
  );
});
