import { useEffect, useMemo, useRef } from "react";
import { EditorView} from "codemirror";
import { EditorState } from "@codemirror/state";
import { oneDark} from "@codemirror/theme-one-dark";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extensions";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { minimap } from "../extensions/minimap";
import {indentationMarkers} from "@replit/codemirror-indentation-markers";
import { customSetup } from "../extensions/custom-setup";
import { suggestion } from "../extensions/suggestion";
import { quickEdit } from "../extensions/quick-edit";

interface Props {
  fileName: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({fileName, initialValue = "", onChange}: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(() => getLanguageExtension (fileName), [fileName])

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        oneDark,
        customSetup,
        customTheme,
        languageExtension,
        suggestion(fileName),
        quickEdit(fileName),
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if(update.docChanged) {
            onChange(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [languageExtension]);

  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
};
