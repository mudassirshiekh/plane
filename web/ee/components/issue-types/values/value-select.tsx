import React from "react";
import { observer } from "mobx-react";
import { AlignLeft, InfoIcon } from "lucide-react";
// ui
import { Loader, Logo, Tooltip } from "@plane/ui";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useIssueDetail } from "@/hooks/store";
// plane web components
import {
  TextValueInput,
  BooleanInput,
  NumberValueInput,
  MemberValueSelect,
  DateValueSelect,
  OptionValueSelect,
} from "@/plane-web/components/issue-types/values";
import { getIssuePropertyTypeKey } from "@/plane-web/helpers/issue-properties.helper";
// plane web types
import {
  EIssuePropertyType,
  EIssuePropertyValueError,
  TDateAttributeDisplayOptions,
  TIssueProperty,
  TIssuePropertyTypeKeys,
  TPropertyValueVariant,
  TTextAttributeDisplayOptions,
} from "@/plane-web/types";

type TPropertyValueSelectProps = {
  propertyDetail: Partial<TIssueProperty<EIssuePropertyType>>;
  propertyValue: string[];
  propertyValueError?: EIssuePropertyValueError;
  projectId: string;
  variant: TPropertyValueVariant;
  isPropertyValuesLoading: boolean;
  onPropertyValueChange: (value: string[]) => Promise<void>;
};

export const PropertyValueSelect = observer((props: TPropertyValueSelectProps) => {
  const {
    propertyDetail,
    propertyValue,
    propertyValueError,
    projectId,
    variant,
    isPropertyValuesLoading,
    onPropertyValueChange,
  } = props;
  // store hooks
  const { peekIssue } = useIssueDetail();
  // derived values
  const isPeekOverview = peekIssue ? true : false;

  const IssuePropertyDetail = () => (
    <>
      <div className="flex-shrink-0 grid place-items-center">
        {propertyDetail?.logo_props?.in_use ? (
          <Logo logo={propertyDetail.logo_props} size={16} type="lucide" customColor="text-custom-text-300" />
        ) : (
          <AlignLeft className={cn("w-4 h-4 text-custom-text-300")} />
        )}
      </div>
      <span className={cn("w-full cursor-default truncate", variant === "create" && "text-sm text-custom-text-200")}>
        <span className="flex gap-0.5 items-center">
          <span className="truncate">{propertyDetail?.display_name}</span>
          {propertyDetail?.is_required && <span className="text-red-500">*</span>}
          {propertyDetail.description && (
            <Tooltip
              tooltipContent={propertyDetail?.description}
              position="right"
              disabled={!propertyDetail?.description}
            >
              <InfoIcon className="flex-shrink-0 w-3 h-3 mx-0.5 text-custom-text-300 cursor-pointer" />
            </Tooltip>
          )}
        </span>
      </span>
    </>
  );

  const ISSUE_PROPERTY_ATTRIBUTE_DETAILS: Partial<Record<TIssuePropertyTypeKeys, JSX.Element>> = {
    TEXT: (
      <>
        <TextValueInput
          propertyDetail={propertyDetail as TIssueProperty<EIssuePropertyType.TEXT>}
          value={propertyValue}
          error={propertyValueError}
          variant={variant}
          display_format={propertyDetail?.settings?.display_format as TTextAttributeDisplayOptions}
          readOnlyData={propertyDetail?.default_value?.[0]}
          className="min-h-8"
          onTextValueChange={onPropertyValueChange}
        />
      </>
    ),
    DECIMAL: (
      <>
        <NumberValueInput
          propertyDetail={propertyDetail as TIssueProperty<EIssuePropertyType.DECIMAL>}
          value={propertyValue}
          error={propertyValueError}
          variant={variant}
          className="h-8"
          onNumberValueChange={onPropertyValueChange}
        />
      </>
    ),
    OPTION: (
      <>
        {propertyDetail?.id && propertyDetail?.issue_type && (
          <OptionValueSelect
            propertyDetail={propertyDetail as TIssueProperty<EIssuePropertyType.OPTION>}
            value={propertyValue}
            error={propertyValueError}
            issueTypeId={propertyDetail.issue_type}
            issuePropertyId={propertyDetail.id}
            variant={variant}
            isMultiSelect={propertyDetail.is_multi}
            buttonClassName="h-8"
            onOptionValueChange={onPropertyValueChange}
          />
        )}
      </>
    ),
    BOOLEAN: (
      <div className={cn("w-full h-8 flex items-center", variant === "update" && "px-1.5")}>
        <BooleanInput value={propertyValue} onBooleanValueChange={onPropertyValueChange} />
      </div>
    ),
    DATETIME: (
      <>
        <DateValueSelect
          propertyDetail={propertyDetail as TIssueProperty<EIssuePropertyType.DATETIME>}
          value={propertyValue}
          error={propertyValueError}
          variant={variant}
          displayFormat={propertyDetail?.settings?.display_format as TDateAttributeDisplayOptions}
          buttonClassName="h-8"
          onDateValueChange={onPropertyValueChange}
        />
      </>
    ),
    RELATION_USER: (
      <>
        <MemberValueSelect
          propertyDetail={propertyDetail as TIssueProperty<EIssuePropertyType.RELATION>}
          value={propertyValue}
          error={propertyValueError}
          projectId={projectId}
          variant={variant}
          isMultiSelect={propertyDetail?.is_multi}
          buttonClassName="h-8"
          onMemberValueChange={onPropertyValueChange}
        />
      </>
    ),
  };

  const propertyTypeKey = getIssuePropertyTypeKey(propertyDetail?.property_type, propertyDetail?.relation_type);
  const isPropertyMultiLineText =
    propertyTypeKey === "TEXT" && propertyDetail?.settings?.display_format === "multi-line";

  const CurrentPropertyAttribute = isPropertyValuesLoading ? (
    <Loader className="w-full min-h-8">
      <Loader.Item height="32px" />
    </Loader>
  ) : (
    (propertyDetail?.id && ISSUE_PROPERTY_ATTRIBUTE_DETAILS[propertyTypeKey]) || null
  );

  if (!CurrentPropertyAttribute) return null;

  return (
    <>
      {variant === "create" && (
        <div
          className={cn("w-full flex items-start justify-center gap-1.5 py-1", isPropertyMultiLineText && "flex-col")}
        >
          <div
            className={cn(
              "w-1/3 md:w-1/2 h-8 flex flex-shrink-0 gap-1.5 items-center",
              isPropertyMultiLineText && "w-full"
            )}
          >
            <IssuePropertyDetail />
          </div>
          <div className="w-full h-full min-h-8 flex flex-col gap-0.5">{CurrentPropertyAttribute}</div>
        </div>
      )}
      {variant === "update" && (
        <div
          className={cn(
            "flex w-full items-start gap-x-3 gap-y-1 min-h-8",
            isPropertyMultiLineText && "flex-col items-start"
          )}
        >
          <div
            className={cn(
              "flex items-center h-8 gap-1 flex-shrink-0 text-sm text-custom-text-300",
              isPeekOverview ? "w-1/4" : "w-2/5",
              isPropertyMultiLineText && "w-full"
            )}
          >
            <IssuePropertyDetail />
          </div>
          <div className="relative h-full min-h-8 w-full flex-grow flex flex-col gap-0.5">
            {CurrentPropertyAttribute}
          </div>
        </div>
      )}
    </>
  );
});
