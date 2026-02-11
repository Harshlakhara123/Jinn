import { EditorState, StateField } from "@codemirror/state";
import { showTooltip, Tooltip, EditorView } from "@codemirror/view";
import { quickEditState, showQuickEditEffect } from "./quick-edit";

let editorView: EditorView | null = null;

const createTooltipForSelection = (state: EditorState): readonly Tooltip[] => {
    const selection = state.selection.main;

    // Show tooltip only when text is selected
    if (selection.empty) return [];

    const isQuickEditActive = state.field(quickEditState, false);
    if (isQuickEditActive) return [];

    return [
        {
            pos: selection.to,
            above: false,
            strictSide: false,
            create() {
                const dom = document.createElement("div");
                dom.className =
                    "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-1 shadow-md flex items-center gap-2 text-sm";

                // Add to Chat button
                const addToChatButton = document.createElement("button");
                addToChatButton.textContent = "Add to Chat";
                addToChatButton.className =
                    "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm";

                // Quick Edit button
                const quickEditButton = document.createElement("button");
                quickEditButton.className =
                    "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm flex items-center gap-1";

                const quickEditButtonText = document.createElement("span");
                quickEditButtonText.textContent = "Quick Edit";

                const quickEditButtonShortcut = document.createElement("span");
                quickEditButtonShortcut.textContent = "Ctrl + K";
                quickEditButtonShortcut.className = "text-xs opacity-60";

                quickEditButton.appendChild(quickEditButtonText);
                quickEditButton.appendChild(quickEditButtonShortcut);

                // Quick Edit button logic
                quickEditButton.onclick = () => {
                    if (editorView) {
                        editorView.dispatch({
                            effects: showQuickEditEffect.of(true),
                        });
                    }
                };

                dom.appendChild(addToChatButton);
                dom.appendChild(quickEditButton);

                return { dom };
            },
        },
    ];
};

const selectionTooltipField = StateField.define<readonly Tooltip[]>({
    create(state) {
        return createTooltipForSelection(state);
    },

    update(tooltips, transaction) {
        if (transaction.docChanged || transaction.selection) {
            return createTooltipForSelection(transaction.state);
        }

        for (const effect of transaction.effects) {
            if (effect.is(showQuickEditEffect)) {
                return createTooltipForSelection(transaction.state);
            }
        }

        return tooltips;
    },

    provide: (field) =>
        showTooltip.computeN([field], (state) => state.field(field)),
});

// Capture view reference
const captureViewExtension = EditorView.updateListener.of((update) => {
    editorView = update.view;
});

// Exported extension
export const selectionTooltip = () => [
    selectionTooltipField,
    captureViewExtension,
];
