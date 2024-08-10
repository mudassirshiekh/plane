// plane web store
import { FeatureFlagsStore, IFeatureFlagsStore } from "@/plane-web/store/feature-flags/feature-flags.store";
import { IIssueTypesStore, IssueTypes } from "@/plane-web/store/issue-types";
import { IPublishPageStore, PublishPageStore } from "@/plane-web/store/pages/publish-page.store";
import { IWorkspacePageStore, WorkspacePageStore } from "@/plane-web/store/pages/workspace-page.store";
import {
  IWorkspaceSubscriptionStore,
  WorkspaceSubscriptionStore,
} from "@/plane-web/store/subscription/subscription.store";
import {
  IWorkspaceWorklogStore,
  WorkspaceWorklogStore,
  IWorkspaceWorklogDownloadStore,
  WorkspaceWorklogDownloadStore,
} from "@/plane-web/store/workspace-worklog";
// store
import { CoreRootStore } from "@/store/root.store";

export class RootStore extends CoreRootStore {
  workspacePages: IWorkspacePageStore;
  publishPage: IPublishPageStore;
  workspaceSubscription: IWorkspaceSubscriptionStore;
  workspaceWorklogs: IWorkspaceWorklogStore;
  workspaceWorklogDownloads: IWorkspaceWorklogDownloadStore;
  featureFlags: IFeatureFlagsStore;
  issueTypes: IIssueTypesStore;

  constructor() {
    super();
    this.workspacePages = new WorkspacePageStore(this);
    this.publishPage = new PublishPageStore(this);
    this.workspaceSubscription = new WorkspaceSubscriptionStore(this);
    this.workspaceWorklogs = new WorkspaceWorklogStore(this);
    this.workspaceWorklogDownloads = new WorkspaceWorklogDownloadStore(this);
    this.featureFlags = new FeatureFlagsStore();
    this.issueTypes = new IssueTypes(this);
  }

  resetOnSignOut() {
    super.resetOnSignOut();
    this.workspacePages = new WorkspacePageStore(this);
    this.publishPage = new PublishPageStore(this);
    this.workspaceSubscription = new WorkspaceSubscriptionStore(this);
    this.workspaceWorklogs = new WorkspaceWorklogStore(this);
    this.workspaceWorklogDownloads = new WorkspaceWorklogDownloadStore(this);
    this.featureFlags = new FeatureFlagsStore();
    this.issueTypes = new IssueTypes(this);
  }
}
