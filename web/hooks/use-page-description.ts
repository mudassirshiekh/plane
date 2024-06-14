import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { applyUpdates, mergeUpdates, proseMirrorJSONToBinaryString } from "@plane/document-editor";
import { EditorRefApi, generateJSONfromHTML } from "@plane/editor-core";
import useReloadConfirmations from "@/hooks/use-reload-confirmation";
import { PageService } from "@/services/page.service";
import { IPageStore } from "@/store/pages/page.store";
import { CollaborationProvider } from "./CollaborationProvider"; // Adjust the import path as needed

const pageService = new PageService();

type Props = {
  editorRef: React.RefObject<EditorRefApi>;
  page: IPageStore;
  projectId: string | string[] | undefined;
  workspaceSlug: string | string[] | undefined;
};

const AUTO_SAVE_TIME = 10000;

export const usePageDescription = (props: Props) => {
  const { editorRef, page, projectId, workspaceSlug } = props;
  const [isDescriptionReady, setIsDescriptionReady] = useState(false);
  const [descriptionUpdates, setDescriptionUpdates] = useState<Uint8Array[]>([]);
  const { isContentEditable, isSubmitting, updateDescription, setIsSubmitting } = page;
  const pageDescription = page.description_html;
  const pageId = page.id;

  const { data: descriptionYJS, mutate: mutateDescriptionYJS } = useSWR(
    workspaceSlug && projectId && pageId ? `PAGE_DESCRIPTION_${workspaceSlug}_${projectId}_${pageId}` : null,
    workspaceSlug && projectId && pageId
      ? () => pageService.fetchDescriptionYJS(workspaceSlug.toString(), projectId.toString(), pageId.toString())
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  const pageDescriptionYJS = useMemo(
    () => (descriptionYJS ? new Uint8Array(descriptionYJS) : undefined),
    [descriptionYJS]
  );

  const handleDescriptionChange = useCallback((updates: Uint8Array) => {
    console.log("updates", updates);
    setDescriptionUpdates((prev) => [...prev, updates]);
  }, []);

  useEffect(() => {
    const changeHTMLToBinary = async () => {
      if (!pageDescriptionYJS || !pageDescription) return;
      if (pageDescriptionYJS.byteLength === 0) {
        const { contentJSON, editorSchema } = generateJSONfromHTML(pageDescription ?? "<p></p>");
        const yDocBinaryString = proseMirrorJSONToBinaryString(contentJSON, "default", editorSchema);
        await updateDescription(yDocBinaryString, pageDescription ?? "<p></p>");
        await mutateDescriptionYJS();
        setIsDescriptionReady(true);
      } else setIsDescriptionReady(true);
    };
    changeHTMLToBinary();
  }, [mutateDescriptionYJS, pageDescription, pageDescriptionYJS, updateDescription]);

  const handleSaveDescription = useCallback(async () => {
    if (!isContentEditable) return;

    const applyUpdatesAndSave = async (latestDescription: any, updates: Uint8Array) => {
      if (!workspaceSlug || !projectId || !pageId || !latestDescription) return;
      const descriptionArray = new Uint8Array(latestDescription);
      const combinedBinaryString = applyUpdates(descriptionArray, updates);
      const descriptionHTML = editorRef.current?.getHTML() ?? "<p></p>";
      await updateDescription(combinedBinaryString, descriptionHTML).finally(() => setIsSubmitting("saved"));
    };

    try {
      setIsSubmitting("submitting");
      const latestDescription = await mutateDescriptionYJS();
      if (descriptionUpdates.length <= 0) {
        setIsSubmitting("saved");
        return;
      }
      const mergedUpdates = mergeUpdates(descriptionUpdates);
      await applyUpdatesAndSave(latestDescription, mergedUpdates);
      setDescriptionUpdates([]);
    } catch (error) {
      setIsSubmitting("saved");
      throw error;
    }
  }, [
    descriptionUpdates,
    editorRef,
    isContentEditable,
    mutateDescriptionYJS,
    pageId,
    projectId,
    setIsSubmitting,
    updateDescription,
    workspaceSlug,
  ]);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      const { ctrlKey, metaKey, key } = e;
      const cmdClicked = ctrlKey || metaKey;

      if (cmdClicked && key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
        handleSaveDescription();
      }
    };
    window.addEventListener("keydown", handleSave);

    return () => {
      window.removeEventListener("keydown", handleSave);
    };
  }, [handleSaveDescription]);

  const { setShowAlert } = useReloadConfirmations(descriptionUpdates.length > 0 || isSubmitting === "submitting");

  useEffect(() => {
    console.log("descriptionUpdates", descriptionUpdates.length);
    if (descriptionUpdates.length > 0 || isSubmitting === "submitting") setShowAlert(true);
    else setShowAlert(false);
  }, [descriptionUpdates, isSubmitting, setShowAlert]);

  useEffect(() => {
    const syncUpdatesFromIndexedDB = async () => {
      const provider = new CollaborationProvider({
        name: `PAGE_DESCRIPTION_${workspaceSlug}_${projectId}_${pageId}`,
        onChange: handleDescriptionChange,
      });

      const updates = await provider.getUpdatesFromIndexedDB();
      if (updates.length > 0) {
        setDescriptionUpdates(updates);
      }
    };

    syncUpdatesFromIndexedDB();
  }, [handleDescriptionChange, pageId, projectId, workspaceSlug]);

  return {
    handleDescriptionChange,
    isDescriptionReady,
    pageDescriptionYJS,
  };
};
