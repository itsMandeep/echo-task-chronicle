
import { useState } from 'react';
import { Note } from '@/types';
import { usePlanner } from '@/context/PlannerContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash, PenLine, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function NotesSection() {
  const { currentPlan, isEditMode, addNote, updateNote, deleteNote } = usePlanner();
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote(newNote);
      setNewNote('');
    }
  };

  const startEditingNote = (note: Note) => {
    setEditingNote(note);
    setEditedContent(note.content);
  };

  const saveEditedNote = () => {
    if (editingNote && editedContent.trim()) {
      updateNote(editingNote.id, editedContent);
      setEditingNote(null);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
        <h2 className="text-lg font-medium">Notes</h2>
      </div>

      {isEditMode && (
        <div className="mb-4">
          <Textarea
            placeholder="Add a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="mb-2 min-h-[100px]"
          />
          <Button onClick={handleAddNote} disabled={newNote.trim() === ''}>
            Add Note
          </Button>
        </div>
      )}

      <div className="space-y-3 mt-4">
        {currentPlan?.notes?.map((note) => (
          <div key={note.id} className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-start">
              <div className="text-xs text-gray-500 mb-1">
                {format(parseISO(note.createdAt), "MMM d, h:mm a")}
              </div>
              {isEditMode && (
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => startEditingNote(note)}
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {note.content}
            </div>
          </div>
        ))}

        {currentPlan?.notes?.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No notes yet. {isEditMode ? "Add a note above." : ""}
          </div>
        )}
      </div>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={saveEditedNote}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
