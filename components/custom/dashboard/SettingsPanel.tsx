"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  Check,
  Monitor,
  Moon,
  Palette,
  Sun,
  Users,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"

interface WhiteboardSettings {
  diagramColor: string
  strokeWidth: number
  backgroundColor: string
  sharingPermission: "private" | "view" | "edit"
}

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

const defaultSettings: WhiteboardSettings = {
  diagramColor: "#000000",
  strokeWidth: 2,
  backgroundColor: "#ffffff",
  sharingPermission: "private",
}

const diagramColors = [
  "#000000",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
]

const backgroundColors = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#fefce8",
  "#f0fdf4",
  "#eff6ff",
]

export default function SettingsPanel({
  open,
  onClose,
}: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()

  const [settings, setSettings] =
    useState<WhiteboardSettings>(defaultSettings)

  const [mounted, setMounted] = useState(false)

  // --------------------------------------------------
  // Mount
  // --------------------------------------------------

  useEffect(() => {
    setMounted(true)

    const savedSettings =
      localStorage.getItem("whizboard-settings")

    if (savedSettings) {
      try {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(savedSettings),
        })
      } catch (error) {
        console.error(
          "Failed to load WhizBoard settings:",
          error
        )
      }
    }
  }, [])

  // --------------------------------------------------
  // Save settings
  // --------------------------------------------------

  useEffect(() => {
    if (!mounted) return

    localStorage.setItem(
      "whizboard-settings",
      JSON.stringify(settings)
    )
  }, [settings, mounted])

  // --------------------------------------------------
  // Escape key
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [open, onClose])

  // --------------------------------------------------
  // Don't render on server / when closed
  // --------------------------------------------------

  if (!mounted || !open) {
    return null
  }

  // --------------------------------------------------
  // Update setting
  // --------------------------------------------------

  const updateSetting = <
    K extends keyof WhiteboardSettings
  >(
    key: K,
    value: WhiteboardSettings[K]
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  // --------------------------------------------------
  // Portal
  // --------------------------------------------------

  return createPortal(
    <>
      {/* =================================================
          BACKDROP
      ================================================= */}

      <div
        className="
          fixed
          inset-0
          z-[9998]
          bg-transparent
        "
        onClick={onClose}
      />

      {/* =================================================
          SETTINGS PANEL
      ================================================= */}

      <div
        className="
          fixed
          left-[268px]
          bottom-4
          z-[9999]
          w-[420px]
          max-h-[calc(100vh-32px)]
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
          text-gray-900
          shadow-2xl
          animate-in
          fade-in
          slide-in-from-left-2
          duration-200
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-200
            px-5
            py-4
          "
        >
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Settings
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Customize your WhizBoard experience
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-md
              p-1.5
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            <X size={17} />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            max-h-[calc(100vh-110px)]
            space-y-7
            overflow-y-auto
            p-5
          "
        >
          {/* =================================================
              APPEARANCE
          ================================================= */}

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Palette
                size={16}
                className="text-gray-700"
              />

              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Appearance
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Choose your preferred theme
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">

              <ThemeButton
                active={theme === "light"}
                icon={<Sun size={16} />}
                label="Light"
                onClick={() =>
                  setTheme("light")
                }
              />

              <ThemeButton
                active={theme === "dark"}
                icon={<Moon size={16} />}
                label="Dark"
                onClick={() =>
                  setTheme("dark")
                }
              />

              <ThemeButton
                active={theme === "system"}
                icon={<Monitor size={16} />}
                label="System"
                onClick={() =>
                  setTheme("system")
                }
              />

            </div>
          </section>

          {/* =================================================
              DEFAULT DIAGRAM COLOR
          ================================================= */}

          <section>
            <SettingLabel
              title="Default diagram color"
              description="Color used for new diagrams"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">

              {diagramColors.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    updateSetting(
                      "diagramColor",
                      color
                    )
                  }
                  aria-label={`Select ${color}`}
                  className="
                    relative
                    h-8
                    w-8
                    rounded-full
                    border
                    border-gray-200
                    transition
                    hover:scale-110
                  "
                  style={{
                    backgroundColor: color,
                  }}
                >
                  {settings.diagramColor ===
                    color && (
                    <Check
                      size={14}
                      className="
                        absolute
                        inset-0
                        m-auto
                        text-white
                      "
                    />
                  )}
                </button>
              ))}

              {/* Custom color */}

              <input
                type="color"
                value={settings.diagramColor}
                onChange={(event) =>
                  updateSetting(
                    "diagramColor",
                    event.target.value
                  )
                }
                aria-label="Custom diagram color"
                className="
                  h-8
                  w-8
                  cursor-pointer
                  overflow-hidden
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                "
              />

            </div>
          </section>

          {/* =================================================
              STROKE WIDTH
          ================================================= */}

          <section>
            <div className="flex items-center justify-between">

              <SettingLabel
                title="Stroke width"
                description="Default thickness for drawings"
              />

              <span className="text-xs font-semibold text-gray-700">
                {settings.strokeWidth}px
              </span>

            </div>

            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={settings.strokeWidth}
              onChange={(event) =>
                updateSetting(
                  "strokeWidth",
                  Number(event.target.value)
                )
              }
              className="
                mt-4
                w-full
                cursor-pointer
                accent-blue-600
              "
            />

            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </section>

          {/* =================================================
              CANVAS BACKGROUND
          ================================================= */}

          <section>
            <SettingLabel
              title="Canvas background"
              description="Default background for new boards"
            />

            <div className="mt-3 grid grid-cols-6 gap-2">

              {backgroundColors.map(
                (color) => (
                  <button
                    key={color}
                    onClick={() =>
                      updateSetting(
                        "backgroundColor",
                        color
                      )
                    }
                    aria-label={`Select background ${color}`}
                    className="
                      relative
                      h-9
                      rounded-md
                      border
                      border-gray-200
                      transition
                      hover:scale-105
                    "
                    style={{
                      backgroundColor:
                        color,
                    }}
                  >
                    {settings.backgroundColor ===
                      color && (
                      <Check
                        size={14}
                        className="
                          absolute
                          inset-0
                          m-auto
                          text-gray-700
                        "
                      />
                    )}
                  </button>
                )
              )}

            </div>
          </section>

          {/* =================================================
              DEFAULT SHARING
          ================================================= */}

          <section>

            <div className="mb-3 flex items-center gap-2">

              <Users
                size={16}
                className="text-gray-700"
              />

              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Default sharing
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Permission for newly created boards
                </p>
              </div>

            </div>

            <div className="space-y-2">

              <PermissionOption
                selected={
                  settings.sharingPermission ===
                  "private"
                }
                title="Private"
                description="Only you can access the board"
                onClick={() =>
                  updateSetting(
                    "sharingPermission",
                    "private"
                  )
                }
              />

              <PermissionOption
                selected={
                  settings.sharingPermission ===
                  "view"
                }
                title="Anyone with the link can view"
                description="Others can view but cannot edit"
                onClick={() =>
                  updateSetting(
                    "sharingPermission",
                    "view"
                  )
                }
              />

              <PermissionOption
                selected={
                  settings.sharingPermission ===
                  "edit"
                }
                title="Anyone with the link can edit"
                description="Others can view and modify"
                onClick={() =>
                  updateSetting(
                    "sharingPermission",
                    "edit"
                  )
                }
              />

            </div>

          </section>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            border-t
            border-gray-200
            px-5
            py-3
          "
        >
          <p className="text-center text-[11px] text-gray-500">
            Your preferences are saved automatically
          </p>
        </div>
      </div>
    </>,
    document.body
  )
}


/* =========================================================
   SETTING LABEL
========================================================= */

function SettingLabel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900">
        {title}
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  )
}


/* =========================================================
   THEME BUTTON
========================================================= */

function ThemeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        flex-col
        items-center
        justify-center
        gap-1.5
        rounded-lg
        border
        py-3
        text-xs
        transition
        ${
          active
            ? "border-blue-500 bg-blue-50 text-blue-600"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }
      `}
    >
      {icon}

      <span>{label}</span>
    </button>
  )
}


/* =========================================================
   PERMISSION OPTION
========================================================= */

function PermissionOption({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        justify-between
        rounded-lg
        border
        p-3
        text-left
        transition
        ${
          selected
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:bg-gray-50"
        }
      `}
    >
      <div>
        <p className="text-xs font-medium text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-gray-500">
          {description}
        </p>
      </div>

      {selected && (
        <Check
          size={16}
          className="shrink-0 text-blue-600"
        />
      )}
    </button>
  )
}