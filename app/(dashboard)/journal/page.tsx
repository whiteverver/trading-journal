"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil, Save, X } from "lucide-react";

type JournalNote = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  note_date: string;
  created_at: string;
};

export default function JournalPage() {
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteDate, setNoteDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("journal_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("note_date", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setNotes(data || []);
    setLoading(false);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !content || !noteDate) {
      alert("Please fill all fields");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      return;
    }

    const { error } = await supabase.from("journal_notes").insert({
      user_id: user.id,
      title,
      content,
      note_date: noteDate,
    });

    if (error) {
      alert("Failed to add note");
      console.error(error);
      return;
    }

    setTitle("");
    setContent("");
    setNoteDate("");
    fetchNotes();
  }

  function startEdit(note: JournalNote) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditDate(note.note_date);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditDate("");
  }

  async function updateNote(id: string) {
    if (!editTitle || !editContent || !editDate) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase
      .from("journal_notes")
      .update({
        title: editTitle,
        content: editContent,
        note_date: editDate,
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update note");
      console.error(error);
      return;
    }

    cancelEdit();
    fetchNotes();
  }

  async function deleteNote(id: string) {
    const confirmDelete = confirm("Delete this journal note?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("journal_notes")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete note");
      console.error(error);
      return;
    }

    fetchNotes();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Journal</h1>
        <p className="text-muted-foreground">
          Write daily notes, lessons, emotions, and trading reviews.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Journal Note</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={addNote} className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
            />

            <Textarea
              placeholder="Write your trading journal note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />

            <Button type="submit">Add Note</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Notes</p>
            <h2 className="text-2xl font-bold">{notes.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Latest Note</p>
            <h2 className="text-lg font-semibold">
              {notes[0]?.title || "No notes yet"}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Last Date</p>
            <h2 className="text-lg font-semibold">
              {notes[0]?.note_date || "No date"}
            </h2>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Notes</h2>

        {loading ? (
          <p className="text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No journal notes added yet.
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-5 space-y-4">
                {editingId === note.id ? (
                  <>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />

                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />

                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={5}
                    />

                    <div className="flex gap-2">
                      <Button onClick={() => updateNote(note.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>

                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{note.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {note.note_date}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEdit(note)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                      {note.content}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}