import { Placement } from "@popperjs/core";
import { EmojiClickData, Theme } from "emoji-picker-react";

export enum EmojiIconPickerTypes {
  EMOJI = "emoji",
  ICON = "icon",
}

export const TABS_LIST = [
  {
    key: EmojiIconPickerTypes.EMOJI,
    title: "Emojis",
  },
  {
    key: EmojiIconPickerTypes.ICON,
    title: "Icons",
  },
];

export type TChangeHandlerProps =
  | {
      type: EmojiIconPickerTypes.EMOJI;
      value: EmojiClickData;
    }
  | {
      type: EmojiIconPickerTypes.ICON;
      value: {
        name: string;
        color: string;
      };
    };

export type TCustomEmojiPicker = {
  isOpen: boolean;
  handleToggle: (value: boolean) => void;
  buttonClassName?: string;
  className?: string;
  closeOnSelect?: boolean;
  defaultIconColor?: string;
  defaultOpen?: EmojiIconPickerTypes;
  disabled?: boolean;
  dropdownClassName?: string;
  label: React.ReactNode;
  onChange: (value: TChangeHandlerProps) => void;
  placement?: Placement;
  searchPlaceholder?: string;
  theme?: Theme;
  iconType?: "material" | "lucide";
};

export const DEFAULT_COLORS = ["#95999f", "#6d7b8a", "#5e6ad2", "#02b5ed", "#02b55c", "#f2be02", "#e57a00", "#f38e82"];

export type TIconsListProps = {
  defaultColor: string;
  onChange: (val: { name: string; color: string }) => void;
};

/**
 * Adjusts the given hex color to ensure it has enough contrast.
 * @param {string} hex - The hex color code input by the user.
 * @returns {string} - The adjusted hex color code.
 */
export const adjustColorForContrast = (hex: string): string => {
  // Validate hex color code
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    throw new Error("Invalid hex color code");
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const expandHex = (shortHex: string): string =>
      shortHex.length === 4 ? "#" + [...shortHex.slice(1)].map((ch) => ch + ch).join("") : shortHex;

    const fullHex = expandHex(hex);
    return {
      r: parseInt(fullHex.slice(1, 3), 16),
      g: parseInt(fullHex.slice(3, 5), 16),
      b: parseInt(fullHex.slice(5, 7), 16),
    };
  };

  // Helper function to convert RGB back to hex
  const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }): string =>
    `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;

  // Convert hex to RGB
  const { r, g, b } = hexToRgb(hex);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Darken the color if luminance is too high
  const adjustment = luminance > 0.5 ? -50 : 0;
  const adjustedRgb = {
    r: Math.max(0, r + adjustment),
    g: Math.max(0, g + adjustment),
    b: Math.max(0, b + adjustment),
  };

  return rgbToHex(adjustedRgb);
};
