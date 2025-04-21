// REFERENCE SOLUTION - Do not distribute to students
// src/App.tsx
import './App.css';

import React, { useEffect, useState } from 'react';

import NoteEditor from './components/NoteEditor';
import NoteList from './components/NoteList';
import { Note } from './types/Note';

function App() {
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Effect to check Firebase emulator connection
  useEffect(() => {
    const checkEmulatorConnection = () => {
      // In a real app, we'd make an actual check to the emulator
      // For this demo, we'll just use online/offline status
      const handleConnectionChange = () => {
        setIsConnected(navigator.onLine);
      };

      // Check initial connection status
      setIsConnected(navigator.onLine);

      // Listen for online/offline events
      window.addEventListener('online', handleConnectionChange);
      window.addEventListener('offline', handleConnectionChange);

      // Clean up event listeners on unmount
      return () => {
        window.removeEventListener('online', handleConnectionChange);
        window.removeEventListener('offline', handleConnectionChange);
      };
    };

    // Only run in development mode where emulators are used
    if (import.meta.env.DEV) {
      return checkEmulatorConnection();
    }

    return undefined;
  }, []);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    // Scroll to editor
    document.querySelector('.note-editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNoteSaved = () => {
    // Clear the editing note after save
    setEditingNote(undefined);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Collaborative Notes App</h1>
        <p>Changes are synced in real-time across all connected users</p>
        {import.meta.env.DEV && (
          <div className="emulator-status">
            {isConnected ? (
              <span className="connected">✓ Using Firebase Emulator</span>
            ) : (
              <span className="disconnected">⚠️ Firebase Emulator not connected</span>
            )}
          </div>
        )}
      </header>
      <main className="app-main">
        <section className="editor-section">
          <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
          <NoteEditor initialNote={editingNote} onSave={handleNoteSaved} />
        </section>
        <section className="list-section">
          <NoteList onEditNote={handleEditNote} />
        </section>
      </main>
      <footer className="app-footer">
        <p>
          This application demonstrates React useEffect with Firebase real-time data
          binding.
          {import.meta.env.DEV && (
            <span> Running in development mode with Firebase Emulator.</span>
          )}
        </p>
      </footer>
    </div>
  );
}

export default App;
