import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import Loader from "react-spinners/PulseLoader"
import API from "@/api"
import MainView from "./MainView"
import { DeleteButton } from "./Button"
import { TimeReportView } from "./TimeReportView"

jest.mock("./Button.module.css", () => ({}))
jest.mock("./TimeReport.module.css", () => ({}))
jest.mock("../app/page.module.css", () => ({}))
jest.mock("@/components/ClientListView", () => () => null)
jest.mock("@/components/RegisterTimeView", () => () => null)
jest.mock("@/api", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    deleteTimeEntry: jest.fn(),
    getTimeEntries: jest.fn()
  })),
  ErrorCode: { Unauthorized: "Unauthorized" }
}))

afterEach(() => {
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

describe("DeleteButton", () => {
  function button(loading: boolean) {
    const action = jest.fn()
    const element = DeleteButton({ action, loading }).props.children
    return { action, element }
  }

  it("shows an accessible loader and blocks clicks while deleting", () => {
    const { action, element } = button(true)
    expect(element.props.disabled).toBe(true)
    expect(element.props["aria-busy"]).toBe(true)
    expect(element.props["aria-label"]).toBe("Deleting…")
    expect(element.props.children.type).toBe(Loader)
    element.props.onClick({})
    expect(action).not.toHaveBeenCalled()
  })

  it("allows deletion when idle", () => {
    const { action, element } = button(false)
    expect(element.props.disabled).toBe(false)
    expect(element.props["aria-label"]).toBe("Delete")
    element.props.onClick({})
    expect(action).toHaveBeenCalledTimes(1)
  })
})

it("only disables the delete button for the pending entry", () => {
  jest.spyOn(React, "useState").mockReturnValue(["raw", jest.fn()])
  const html = renderToStaticMarkup(React.createElement(TimeReportView, {
    registeredEntries: ["first", "second"].map((entryId) => ({
      entryId, project: entryId, hours: 1, date: new Date("2026-10-01")
    })),
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    deletingEntryIds: new Set(["first"])
  }))
  expect(html.match(/disabled=""/g)).toHaveLength(1)
  expect(html).toContain('aria-label="Deleting…"')
  expect(html).toContain('aria-label="Delete"')
})

describe("entry deletion lifecycle", () => {
  function setup() {
    const states: unknown[] = []
    const refs: Array<{ current: unknown }> = []
    let stateIndex = 0
    let refIndex = 0
    jest.spyOn(React, "useState").mockImplementation(((initial: unknown) => {
      const index = stateIndex++
      if (!(index in states)) {
        states[index] = typeof initial === "function" ? initial() : initial
      }
      return [states[index], (value: unknown) => {
        states[index] = typeof value === "function" ? value(states[index]) : value
      }]
    }) as typeof React.useState)
    jest.spyOn(React, "useRef").mockImplementation(((initial: unknown) => {
      const index = refIndex++
      refs[index] ??= { current: initial }
      return refs[index]
    }) as typeof React.useRef)
    jest.spyOn(React, "useEffect").mockImplementation(() => {})
    jest.spyOn(React, "useCallback").mockImplementation((callback) => callback)
    jest.spyOn(console, "error").mockImplementation(() => {})

    const deleteTimeEntry = jest.fn().mockResolvedValue({})
    const getTimeEntries = jest.fn().mockResolvedValue({})
    jest.mocked(API).mockImplementation(() => ({ deleteTimeEntry, getTimeEntries }) as unknown as API)

    function findReport(node: React.ReactNode): React.ComponentProps<typeof TimeReportView> | undefined {
      for (const child of React.Children.toArray(node)) {
        if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
          continue
        }
        if (child.type === TimeReportView) {
          return child.props as React.ComponentProps<typeof TimeReportView>
        }
        const report = findReport(child.props.children)
        if (report) {
          return report
        }
      }
    }

    function render() {
      stateIndex = 0
      refIndex = 0
      return findReport(MainView())!
    }

    return { render, deleteTimeEntry, getTimeEntries }
  }

  it("blocks repeated clicks through deletion and the report refresh", async () => {
    const { render, deleteTimeEntry, getTimeEntries } = setup()
    let finishDelete!: (value: object) => void
    let finishRefresh!: (value: object) => void
    deleteTimeEntry.mockReturnValue(new Promise((resolve) => { finishDelete = resolve }))
    getTimeEntries.mockReturnValue(new Promise((resolve) => { finishRefresh = resolve }))
    const onDelete = render().onDelete!

    const pending = onDelete("first")
    await onDelete("first")
    expect(deleteTimeEntry).toHaveBeenCalledTimes(1)
    expect(render().deletingEntryIds?.has("first")).toBe(true)

    finishDelete({})
    await Promise.resolve()
    expect(getTimeEntries).toHaveBeenCalledTimes(1)
    await onDelete("first")
    expect(deleteTimeEntry).toHaveBeenCalledTimes(1)
    expect(render().deletingEntryIds?.has("first")).toBe(true)

    finishRefresh({})
    await pending
    expect(render().deletingEntryIds?.size).toBe(0)
  })

  it.each(["response error", "rejected request"])("allows retry after a %s", async (failure) => {
    const { render, deleteTimeEntry, getTimeEntries } = setup()
    if (failure === "response error") {
      deleteTimeEntry.mockResolvedValueOnce({ error: "Deletion failed" })
    } else {
      deleteTimeEntry.mockRejectedValueOnce(new Error("Network unavailable"))
    }
    await render().onDelete!("first")
    expect(render().deletingEntryIds?.size).toBe(0)
    expect(getTimeEntries).not.toHaveBeenCalled()
    await render().onDelete!("first")
    expect(deleteTimeEntry).toHaveBeenCalledTimes(2)
  })

  it("tracks simultaneous deletions independently", async () => {
    const { render, deleteTimeEntry } = setup()
    let finishFirst!: (value: object) => void
    deleteTimeEntry.mockReturnValueOnce(new Promise((resolve) => { finishFirst = resolve }))
    const first = render().onDelete!("first")
    await render().onDelete!("second")
    expect(deleteTimeEntry).toHaveBeenCalledTimes(2)
    expect(render().deletingEntryIds).toEqual(new Set(["first"]))
    finishFirst({})
    await first
    expect(render().deletingEntryIds?.size).toBe(0)
  })
})
