import { useParams } from "next/navigation";
import { IssueEmojiReactions, IssueVotes } from "@/components/issues/peek-overview";
import { useProject } from "@/hooks/store";

// type IssueReactionsProps = {
//   workspaceSlug: string;
//   projectId: string;
// };

export const IssueReactions: React.FC = () => {
  const { workspace_slug: workspaceSlug, project_id: projectId } = useParams<any>();

  const { canVote, canReact } = useProject();

  return (
    <div className="mt-4 flex items-center gap-3">
      {canVote && (
        <>
          <div className="flex items-center gap-2">
            <IssueVotes workspaceSlug={workspaceSlug} projectId={projectId} />
          </div>
        </>
      )}
      {canReact && (
        <div className="flex items-center gap-2">
          <IssueEmojiReactions workspaceSlug={workspaceSlug} projectId={projectId} />
        </div>
      )}
    </div>
  );
};
