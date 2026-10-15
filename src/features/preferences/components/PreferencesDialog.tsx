import { XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { addAuthor, removeAuthor, toggleSource } from '../lib/edit';
import { DEFAULT_EDITABLE } from '../store';
import type { EditablePreferences } from '../store';
import { PreferencesForm } from './PreferencesForm';

type PreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Gets focus back on close; several buttons open this popup, so there's no single trigger. */
  returnFocusTo: HTMLElement | null;
  preferences: EditablePreferences;
  /** Called once with the edited preferences when the user saves. */
  onSave: (edited: EditablePreferences) => void;
};

/**
 * Sources, categories and authors in a popup over the feed. Edits are a draft until "Save":
 * every change would otherwise refetch the feed behind the popup and spend API quota.
 * Closing the popup discards the draft.
 */
export function PreferencesDialog({
  open,
  onOpenChange,
  preferences,
  onSave,
  returnFocusTo,
}: PreferencesDialogProps) {
  const [draft, setDraft] = useState(preferences);
  const [wasOpen, setWasOpen] = useState(open);

  // Each opening starts from what's saved, not from a discarded draft. The parent controls
  // `open`, so this is caught during render rather than in an open handler.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(preferences);
  }

  function handleSave() {
    onSave(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Own close button: the generated one is smaller than the 44 px touch target. */}
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          if (!returnFocusTo) return;
          event.preventDefault();
          returnFocusTo.focus();
        }}
        className="max-h-[85dvh] gap-6 overflow-y-auto p-5 sm:max-w-lg"
      >
        <DialogHeader className="flex-row items-center justify-between gap-2">
          <DialogTitle className="font-heading text-xl font-medium">Preferences</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Close preferences">
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Choose the sources, categories and authors your feed shows.
        </DialogDescription>
        <PreferencesForm
          sources={draft.sources}
          categories={draft.categories}
          authors={draft.authors}
          onToggleSource={(source) => {
            setDraft({ ...draft, sources: toggleSource(draft.sources, source) });
          }}
          onCategoriesChange={(categories) => {
            setDraft({ ...draft, categories });
          }}
          onAddAuthor={(name) => {
            const authors = addAuthor(draft.authors, name);
            if (!authors) return false;
            setDraft({ ...draft, authors });
            return true;
          }}
          onRemoveAuthor={(name) => {
            setDraft({ ...draft, authors: removeAuthor(draft.authors, name) });
          }}
        />
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            className="h-11 px-4"
            onClick={() => {
              setDraft(DEFAULT_EDITABLE);
            }}
          >
            Reset
          </Button>
          <Button className="h-11 px-6" onClick={handleSave}>
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
