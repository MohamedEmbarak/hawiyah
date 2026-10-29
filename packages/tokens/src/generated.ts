// Generated from tokens.json. Do not edit by hand.
export const tokens = {
  "font": {
    "sans": "\"IBM Plex Sans Arabic\", \"IBM Plex Sans\", \"Noto Sans Arabic\", \"Segoe UI\", Tahoma, Arial, sans-serif",
    "mono": "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace"
  },
  "text": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "md": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem"
  },
  "weight": {
    "regular": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  },
  "leading": {
    "tight": 1.3,
    "heading": 1.45,
    "normal": 1.5,
    "relaxed": 1.85
  },
  "space": {
    "0": "0px",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem"
  },
  "radius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "1rem",
    "xl": "1.5rem",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0px 1px 2px 0px rgb(16 24 40 / 0.05), 0px 1px 3px 0px rgb(16 24 40 / 0.05)",
    "md": "0px 2px 4px -2px rgb(16 24 40 / 0.06), 0px 4px 8px -2px rgb(16 24 40 / 0.10)",
    "lg": "0px 4px 6px -2px rgb(16 24 40 / 0.03), 0px 12px 16px -4px rgb(16 24 40 / 0.08)"
  },
  "duration": {
    "fast": "120ms",
    "normal": "180ms",
    "slow": "280ms",
    "input": "150ms"
  },
  "ease": {
    "standard": "cubic-bezier(0.2, 0, 0, 1)",
    "input": "cubic-bezier(0, 0, 0.58, 1)"
  },
  "content": {
    "max": "80rem",
    "gutter": "2rem",
    "gutter-mobile": "1rem"
  },
  "focus": {
    "width": "3px",
    "offset": "3px"
  },
  "z": {
    "sticky": 10,
    "popover": 30,
    "tooltip": 40,
    "dialog": 50,
    "toast": 60
  },
  "color": {
    "canvas": "#F9FAFB",
    "surface": "#FFFFFF",
    "surface-raised": "#FFFFFF",
    "surface-muted": "#F3F4F6",
    "text": "#161616",
    "text-muted": "#384250",
    "text-subtle": "#4D5761",
    "border": "#D2D6DB",
    "border-strong": "#6C737F",
    "primary": "#1B8354",
    "primary-hover": "#166A45",
    "primary-active": "#104631",
    "on-primary": "#FFFFFF",
    "primary-subtle": "#F3FCF6",
    "primary-text": "#1B8354",
    "focus": "#161616",
    "success": "#067647",
    "success-subtle": "#ECFDF3",
    "warning": "#B54708",
    "warning-subtle": "#FFFAEB",
    "danger": "#B42318",
    "danger-hover": "#B42318",
    "danger-subtle": "#FEF3F2",
    "info": "#175CD3",
    "info-subtle": "#EFF8FF",
    "overlay": "#0b1f18a8",
    "disabled": "#E5E7EB",
    "on-disabled": "#9DA4AE",
    "inverse": "#161616",
    "on-inverse": "#FFFFFF",
    "heading": "#1F2A37",
    "field-border": "#9DA4AE",
    "field-hover": "#384250",
    "field-active": "#0D121C",
    "field-background": "#FFFFFF",
    "field-placeholder": "#6C737F",
    "footer": "#074D31",
    "on-footer": "#FFFFFF",
    "danger-background": "#D92D20"
  },
  "control": {
    "height": "2.5rem",
    "height-sm": "2rem",
    "height-lg": "2.5rem",
    "padding-inline": "1rem"
  },
  "density": {
    "gap": "1rem",
    "cell-padding": "1rem"
  }
} as const;

export const themes = {
  "nasaq": {
    "light": {
      "color": {
        "canvas": "#f7f5ee",
        "surface": "#ffffff",
        "surface-raised": "#ffffff",
        "surface-muted": "#f0f1eb",
        "text": "#142d30",
        "text-muted": "#4c6264",
        "text-subtle": "#5c7071",
        "border": "#d9e0da",
        "border-strong": "#758e8c",
        "primary": "#006a64",
        "primary-hover": "#005650",
        "primary-active": "#004740",
        "on-primary": "#ffffff",
        "primary-subtle": "#c8e7dd",
        "primary-text": "#005b56",
        "focus": "#156bcd",
        "success": "#176447",
        "success-subtle": "#e7f2ec",
        "warning": "#855000",
        "warning-subtle": "#fff3d6",
        "danger": "#ae2e30",
        "danger-hover": "#912124",
        "danger-subtle": "#fff0ef",
        "info": "#175ba8",
        "info-subtle": "#eaf2ff",
        "overlay": "#10282bb3",
        "disabled": "#e8ece8",
        "on-disabled": "#68796e",
        "inverse": "#142d30",
        "on-inverse": "#ffffff",
        "heading": "#142d30",
        "field-border": "#758e8c",
        "field-hover": "#006a64",
        "field-active": "#156bcd",
        "field-background": "#ffffff",
        "field-placeholder": "#5c7071",
        "footer": "#142d30",
        "on-footer": "#ffffff",
        "danger-background": "#ae2e30"
      }
    },
    "dark": {
      "color": {
        "canvas": "#111d1e",
        "surface": "#172728",
        "surface-raised": "#213334",
        "surface-muted": "#283c3c",
        "text": "#eef6f1",
        "text-muted": "#b9cdca",
        "text-subtle": "#9cb5b2",
        "border": "#3a5150",
        "border-strong": "#748f8b",
        "primary": "#7bd4c6",
        "primary-hover": "#9be2d5",
        "primary-active": "#b9ede2",
        "on-primary": "#073a35",
        "primary-subtle": "#1a4540",
        "primary-text": "#a2e0d5",
        "focus": "#8abfff",
        "success": "#93dfae",
        "success-subtle": "#1d3d2c",
        "warning": "#f2cd76",
        "warning-subtle": "#3e321b",
        "danger": "#ffaaa8",
        "danger-hover": "#ffc0bd",
        "danger-subtle": "#462729",
        "info": "#9dc6ff",
        "info-subtle": "#1c334c",
        "overlay": "#071416c2",
        "disabled": "#2c4140",
        "on-disabled": "#9db3ae",
        "inverse": "#e8f4ed",
        "on-inverse": "#142d30",
        "heading": "#eef6f1",
        "field-border": "#748f8b",
        "field-hover": "#7bd4c6",
        "field-active": "#8abfff",
        "field-background": "#172728",
        "field-placeholder": "#9cb5b2",
        "footer": "#e8f4ed",
        "on-footer": "#142d30",
        "danger-background": "#ffaaa8"
      }
    }
  },
  "dga": {
    "light": {
      "color": {
        "canvas": "#F9FAFB",
        "surface": "#FFFFFF",
        "surface-raised": "#FFFFFF",
        "surface-muted": "#F3F4F6",
        "text": "#161616",
        "text-muted": "#384250",
        "text-subtle": "#4D5761",
        "border": "#D2D6DB",
        "border-strong": "#6C737F",
        "primary": "#1B8354",
        "primary-hover": "#166A45",
        "primary-active": "#104631",
        "on-primary": "#FFFFFF",
        "primary-subtle": "#F3FCF6",
        "primary-text": "#1B8354",
        "focus": "#161616",
        "success": "#067647",
        "success-subtle": "#ECFDF3",
        "warning": "#B54708",
        "warning-subtle": "#FFFAEB",
        "danger": "#B42318",
        "danger-hover": "#B42318",
        "danger-subtle": "#FEF3F2",
        "info": "#175CD3",
        "info-subtle": "#EFF8FF",
        "overlay": "#0b1f18a8",
        "disabled": "#E5E7EB",
        "on-disabled": "#9DA4AE",
        "inverse": "#161616",
        "on-inverse": "#FFFFFF",
        "heading": "#1F2A37",
        "field-border": "#9DA4AE",
        "field-hover": "#384250",
        "field-active": "#0D121C",
        "field-background": "#FFFFFF",
        "field-placeholder": "#6C737F",
        "footer": "#074D31",
        "on-footer": "#FFFFFF",
        "danger-background": "#D92D20"
      }
    },
    "dark": {
      "color": {
        "canvas": "#111927",
        "surface": "#1F2A37",
        "surface-raised": "#1F2A37",
        "surface-muted": "#1F2A37",
        "text": "#FFFFFF",
        "text-muted": "#F3F4F6",
        "text-subtle": "#E5E7EB",
        "border": "#6C737F",
        "border-strong": "#9DA4AE",
        "primary": "#1B8354",
        "primary-hover": "#166A45",
        "primary-active": "#104631",
        "on-primary": "#FFFFFF",
        "primary-subtle": "#1B83541A",
        "primary-text": "#54C08A",
        "focus": "#FFFFFF",
        "success": "#47CD89",
        "success-subtle": "#06764733",
        "warning": "#FDB022",
        "warning-subtle": "#B5470833",
        "danger": "#F97066",
        "danger-hover": "#B42318",
        "danger-subtle": "#B4231833",
        "info": "#53B1FD",
        "info-subtle": "#175CD333",
        "overlay": "#020b07bd",
        "disabled": "#384250",
        "on-disabled": "#9DA4AE",
        "inverse": "#FFFFFF",
        "on-inverse": "#161616",
        "heading": "#F9FAFB",
        "field-border": "#6C737F",
        "field-hover": "#E5E7EB",
        "field-active": "#FCFCFD",
        "field-background": "#1F2A37",
        "field-placeholder": "#E5E7EB",
        "footer": "#1B8354",
        "on-footer": "#FFFFFF",
        "danger-background": "#D92D20"
      }
    }
  }
} as const;

export const themeFoundations = {
  "dga": {
    "font": {
      "sans": "\"IBM Plex Sans Arabic\", \"IBM Plex Sans\", \"Noto Sans Arabic\", \"Segoe UI\", Tahoma, Arial, sans-serif",
      "mono": "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace"
    },
    "text": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "leading": {
      "tight": 1.3,
      "heading": 1.45,
      "normal": 1.5,
      "relaxed": 1.85
    },
    "space": {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem"
    },
    "radius": {
      "sm": "0.25rem",
      "md": "0.5rem",
      "lg": "1rem",
      "xl": "1.5rem",
      "full": "9999px"
    },
    "shadow": {
      "sm": "0px 1px 2px 0px rgb(16 24 40 / 0.05), 0px 1px 3px 0px rgb(16 24 40 / 0.05)",
      "md": "0px 2px 4px -2px rgb(16 24 40 / 0.06), 0px 4px 8px -2px rgb(16 24 40 / 0.10)",
      "lg": "0px 4px 6px -2px rgb(16 24 40 / 0.03), 0px 12px 16px -4px rgb(16 24 40 / 0.08)"
    },
    "duration": {
      "fast": "120ms",
      "normal": "180ms",
      "slow": "280ms",
      "input": "150ms"
    },
    "ease": {
      "standard": "cubic-bezier(0.2, 0, 0, 1)",
      "input": "cubic-bezier(0, 0, 0.58, 1)"
    },
    "content": {
      "max": "80rem",
      "gutter": "2rem",
      "gutter-mobile": "1rem"
    },
    "focus": {
      "width": "3px",
      "offset": "3px"
    },
    "z": {
      "sticky": 10,
      "popover": 30,
      "tooltip": 40,
      "dialog": 50,
      "toast": 60
    }
  },
  "nasaq": {
    "font": {
      "sans": "\"IBM Plex Sans Arabic\", \"IBM Plex Sans\", \"Noto Sans Arabic\", \"Segoe UI\", Tahoma, Arial, sans-serif",
      "mono": "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace"
    },
    "text": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.375rem",
      "2xl": "1.75rem",
      "3xl": "2.25rem",
      "4xl": "3rem"
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "leading": {
      "tight": 1.3,
      "heading": 1.45,
      "normal": 1.65,
      "relaxed": 1.85
    },
    "space": {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem"
    },
    "radius": {
      "sm": "0.375rem",
      "md": "0.625rem",
      "lg": "0.875rem",
      "xl": "1.25rem",
      "full": "999px"
    },
    "shadow": {
      "sm": "0 1px 2px rgb(15 35 22 / 0.05), 0 2px 6px rgb(15 35 22 / 0.025)",
      "md": "0 8px 24px -8px rgb(15 35 22 / 0.14), 0 2px 6px rgb(15 35 22 / 0.04)",
      "lg": "0 24px 64px -16px rgb(4 19 10 / 0.3), 0 8px 24px -12px rgb(4 19 10 / 0.18)"
    },
    "duration": {
      "fast": "120ms",
      "normal": "180ms",
      "slow": "280ms",
      "input": "120ms"
    },
    "ease": {
      "standard": "cubic-bezier(0.2, 0, 0, 1)",
      "input": "ease"
    },
    "content": {
      "max": "78rem",
      "gutter": "1.5rem",
      "gutter-mobile": "1rem"
    },
    "focus": {
      "width": "3px",
      "offset": "3px"
    },
    "z": {
      "sticky": 10,
      "popover": 30,
      "tooltip": 40,
      "dialog": 50,
      "toast": 60
    }
  }
} as const;

export const densities = {
  "comfortable": {
    "control": {
      "height": "2.5rem",
      "height-sm": "2rem",
      "height-lg": "2.5rem",
      "padding-inline": "1rem"
    },
    "density": {
      "gap": "1rem",
      "cell-padding": "1rem"
    }
  },
  "compact": {
    "control": {
      "height": "2rem",
      "height-sm": "1.5rem",
      "height-lg": "2.5rem",
      "padding-inline": "0.75rem"
    },
    "density": {
      "gap": "0.75rem",
      "cell-padding": "0.625rem"
    }
  }
} as const;

export const tokenNames = {
  "font": {
    "sans": "--nq-font-sans",
    "mono": "--nq-font-mono"
  },
  "text": {
    "xs": "--nq-text-xs",
    "sm": "--nq-text-sm",
    "md": "--nq-text-md",
    "lg": "--nq-text-lg",
    "xl": "--nq-text-xl",
    "2xl": "--nq-text-2xl",
    "3xl": "--nq-text-3xl",
    "4xl": "--nq-text-4xl"
  },
  "weight": {
    "regular": "--nq-weight-regular",
    "medium": "--nq-weight-medium",
    "semibold": "--nq-weight-semibold",
    "bold": "--nq-weight-bold"
  },
  "leading": {
    "tight": "--nq-leading-tight",
    "heading": "--nq-leading-heading",
    "normal": "--nq-leading-normal",
    "relaxed": "--nq-leading-relaxed"
  },
  "space": {
    "0": "--nq-space-0",
    "1": "--nq-space-1",
    "2": "--nq-space-2",
    "3": "--nq-space-3",
    "4": "--nq-space-4",
    "5": "--nq-space-5",
    "6": "--nq-space-6",
    "8": "--nq-space-8",
    "10": "--nq-space-10",
    "12": "--nq-space-12",
    "16": "--nq-space-16",
    "20": "--nq-space-20",
    "24": "--nq-space-24"
  },
  "radius": {
    "sm": "--nq-radius-sm",
    "md": "--nq-radius-md",
    "lg": "--nq-radius-lg",
    "xl": "--nq-radius-xl",
    "full": "--nq-radius-full"
  },
  "shadow": {
    "sm": "--nq-shadow-sm",
    "md": "--nq-shadow-md",
    "lg": "--nq-shadow-lg"
  },
  "duration": {
    "fast": "--nq-duration-fast",
    "normal": "--nq-duration-normal",
    "slow": "--nq-duration-slow",
    "input": "--nq-duration-input"
  },
  "ease": {
    "standard": "--nq-ease-standard",
    "input": "--nq-ease-input"
  },
  "content": {
    "max": "--nq-content-max",
    "gutter": "--nq-content-gutter",
    "gutter-mobile": "--nq-content-gutter-mobile"
  },
  "focus": {
    "width": "--nq-focus-width",
    "offset": "--nq-focus-offset"
  },
  "z": {
    "sticky": "--nq-z-sticky",
    "popover": "--nq-z-popover",
    "tooltip": "--nq-z-tooltip",
    "dialog": "--nq-z-dialog",
    "toast": "--nq-z-toast"
  },
  "color": {
    "canvas": "--nq-color-canvas",
    "surface": "--nq-color-surface",
    "surface-raised": "--nq-color-surface-raised",
    "surface-muted": "--nq-color-surface-muted",
    "text": "--nq-color-text",
    "text-muted": "--nq-color-text-muted",
    "text-subtle": "--nq-color-text-subtle",
    "border": "--nq-color-border",
    "border-strong": "--nq-color-border-strong",
    "primary": "--nq-color-primary",
    "primary-hover": "--nq-color-primary-hover",
    "primary-active": "--nq-color-primary-active",
    "on-primary": "--nq-color-on-primary",
    "primary-subtle": "--nq-color-primary-subtle",
    "primary-text": "--nq-color-primary-text",
    "focus": "--nq-color-focus",
    "success": "--nq-color-success",
    "success-subtle": "--nq-color-success-subtle",
    "warning": "--nq-color-warning",
    "warning-subtle": "--nq-color-warning-subtle",
    "danger": "--nq-color-danger",
    "danger-hover": "--nq-color-danger-hover",
    "danger-subtle": "--nq-color-danger-subtle",
    "info": "--nq-color-info",
    "info-subtle": "--nq-color-info-subtle",
    "overlay": "--nq-color-overlay",
    "disabled": "--nq-color-disabled",
    "on-disabled": "--nq-color-on-disabled",
    "inverse": "--nq-color-inverse",
    "on-inverse": "--nq-color-on-inverse",
    "heading": "--nq-color-heading",
    "field-border": "--nq-color-field-border",
    "field-hover": "--nq-color-field-hover",
    "field-active": "--nq-color-field-active",
    "field-background": "--nq-color-field-background",
    "field-placeholder": "--nq-color-field-placeholder",
    "footer": "--nq-color-footer",
    "on-footer": "--nq-color-on-footer",
    "danger-background": "--nq-color-danger-background"
  },
  "control": {
    "height": "--nq-control-height",
    "height-sm": "--nq-control-height-sm",
    "height-lg": "--nq-control-height-lg",
    "padding-inline": "--nq-control-padding-inline"
  },
  "density": {
    "gap": "--nq-density-gap",
    "cell-padding": "--nq-density-cell-padding"
  }
} as const;

export const cssVariableNames = [
  "--nq-font-sans",
  "--nq-font-mono",
  "--nq-text-xs",
  "--nq-text-sm",
  "--nq-text-md",
  "--nq-text-lg",
  "--nq-text-xl",
  "--nq-text-2xl",
  "--nq-text-3xl",
  "--nq-text-4xl",
  "--nq-weight-regular",
  "--nq-weight-medium",
  "--nq-weight-semibold",
  "--nq-weight-bold",
  "--nq-leading-tight",
  "--nq-leading-heading",
  "--nq-leading-normal",
  "--nq-leading-relaxed",
  "--nq-space-0",
  "--nq-space-1",
  "--nq-space-2",
  "--nq-space-3",
  "--nq-space-4",
  "--nq-space-5",
  "--nq-space-6",
  "--nq-space-8",
  "--nq-space-10",
  "--nq-space-12",
  "--nq-space-16",
  "--nq-space-20",
  "--nq-space-24",
  "--nq-radius-sm",
  "--nq-radius-md",
  "--nq-radius-lg",
  "--nq-radius-xl",
  "--nq-radius-full",
  "--nq-shadow-sm",
  "--nq-shadow-md",
  "--nq-shadow-lg",
  "--nq-duration-fast",
  "--nq-duration-normal",
  "--nq-duration-slow",
  "--nq-duration-input",
  "--nq-ease-standard",
  "--nq-ease-input",
  "--nq-content-max",
  "--nq-content-gutter",
  "--nq-content-gutter-mobile",
  "--nq-focus-width",
  "--nq-focus-offset",
  "--nq-z-sticky",
  "--nq-z-popover",
  "--nq-z-tooltip",
  "--nq-z-dialog",
  "--nq-z-toast",
  "--nq-color-canvas",
  "--nq-color-surface",
  "--nq-color-surface-raised",
  "--nq-color-surface-muted",
  "--nq-color-text",
  "--nq-color-text-muted",
  "--nq-color-text-subtle",
  "--nq-color-border",
  "--nq-color-border-strong",
  "--nq-color-primary",
  "--nq-color-primary-hover",
  "--nq-color-primary-active",
  "--nq-color-on-primary",
  "--nq-color-primary-subtle",
  "--nq-color-primary-text",
  "--nq-color-focus",
  "--nq-color-success",
  "--nq-color-success-subtle",
  "--nq-color-warning",
  "--nq-color-warning-subtle",
  "--nq-color-danger",
  "--nq-color-danger-hover",
  "--nq-color-danger-subtle",
  "--nq-color-info",
  "--nq-color-info-subtle",
  "--nq-color-overlay",
  "--nq-color-disabled",
  "--nq-color-on-disabled",
  "--nq-color-inverse",
  "--nq-color-on-inverse",
  "--nq-color-heading",
  "--nq-color-field-border",
  "--nq-color-field-hover",
  "--nq-color-field-active",
  "--nq-color-field-background",
  "--nq-color-field-placeholder",
  "--nq-color-footer",
  "--nq-color-on-footer",
  "--nq-color-danger-background",
  "--nq-control-height",
  "--nq-control-height-sm",
  "--nq-control-height-lg",
  "--nq-control-padding-inline",
  "--nq-density-gap",
  "--nq-density-cell-padding"
] as const;
