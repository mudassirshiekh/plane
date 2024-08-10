import { IssueIdentifier as BaseIssueIdentifier } from "ce/components/issues/issue-details/issue-identifier";

import { observer } from "mobx-react";
// ui
import { Loader, Tooltip } from "@plane/ui";
// hooks
import { cn } from "@/helpers/common.helper";
import { useIssueDetail, useProject } from "@/hooks/store";
// plane web components
import { IssueTypeLogo } from "@/plane-web/components/issue-types";
// plane web hooks
import { useIssueType, useIssueTypes } from "@/plane-web/hooks/store";

type TIssueIdentifierProps = {
  issueId: string;
  projectId: string;
  iconSize?: number;
  iconContainerSize?: number;
  textContainerClassName?: string;
};

export const IssueIdentifier: React.FC<TIssueIdentifierProps> = observer((props) => {
  const { issueId, projectId, iconSize = 12, iconContainerSize = 18, textContainerClassName = "" } = props;
  // store hooks
  const { getProjectById, getProjectIdentifierById } = useProject();
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  const { loader: issueTypesLoader } = useIssueTypes();
  // derived values
  const issue = getIssueById(issueId);
  const projectDetails = getProjectById(projectId);
  const issueType = useIssueType(issue?.type_id);

  if (!projectDetails?.is_issue_type_enabled) {
    return (
      <BaseIssueIdentifier
        issueId={issueId}
        projectId={projectId}
        iconSize={iconSize}
        iconContainerSize={iconContainerSize}
        textContainerClassName={textContainerClassName}
      />
    );
  }

  if (issueTypesLoader === "init-loader") {
    return (
      <Loader className="flex w-20 h-5">
        <Loader.Item height="100%" width="100%" />
      </Loader>
    );
  }

  return (
    <Tooltip tooltipContent={issueType?.name} position="top-left">
      <div className="flex flex-shrink-0 items-center space-x-2">
        <IssueTypeLogo
          icon_props={issueType?.logo_props?.icon}
          size={iconSize}
          containerSize={iconContainerSize}
          isDefault={issueType?.is_default}
        />
        <span className={cn("text-base font-medium text-custom-text-300", textContainerClassName)}>
          {getProjectIdentifierById(issue?.project_id)}-{issue?.sequence_id}
        </span>
      </div>
    </Tooltip>
  );
});
