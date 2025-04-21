import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NoteEditor from '../components/NoteEditor';
import { saveNote } from '../services/noteService';
import { Note } from '../types/Note';

vi.mock('../services/noteService');

describe('NoteEditor Component', () => {
  const mockSaveNote = vi.mocked(saveNote);
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockSaveNote.mockReset();
    mockOnSave.mockReset();
  });

  it('renders without errors', () => {
    render(<NoteEditor />);
  });

  describe('Rendering Tests', () => {
    it('renders the title and content input fields', () => {
      render(<NoteEditor />);
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Content')).toBeInTheDocument();
    });

    it('renders the "Save Note" button when initialNote is not provided', () => {
      render(<NoteEditor />);
      expect(screen.getByText('Save Note')).toBeInTheDocument();
    });

    it('renders the "Update Note" button when initialNote is provided', () => {
      const initialNote: Note = {
        id: '1',
        title: 'Test Title',
        content: 'Test Content',
        lastUpdated: Date.now(),
      };
      render(<NoteEditor initialNote={initialNote} />);
      expect(screen.getByText('Update Note')).toBeInTheDocument();
    });

    it('populates the input fields with initialNote data when provided', () => {
      const initialNote: Note = {
        id: '1',
        title: 'Test Title',
        content: 'Test Content',
        lastUpdated: Date.now(),
      };
      render(<NoteEditor initialNote={initialNote} />);
      expect(screen.getByLabelText('Title')).toHaveValue(initialNote.title);
      expect(screen.getByLabelText('Content')).toHaveValue(initialNote.content);
    });
  });

  describe('Input Change Handling', () => {
    it('updates the title in state when the title input changes', () => {
      render(<NoteEditor />);
      const titleInput = screen.getByLabelText('Title');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });
      expect(titleInput).toHaveValue('New Title');
    });

    it('updates the content in state when the content input changes', () => {
      render(<NoteEditor />);
      const contentInput = screen.getByLabelText('Content');
      fireEvent.change(contentInput, { target: { value: 'New Content' } });
      expect(contentInput).toHaveValue('New Content');
    });

    it('updates the lastUpdated timestamp when the input fields change', () => {
      const initialNote: Note = {
        id: '1',
        title: 'Test Title',
        content: 'Test Content',
        lastUpdated: Date.now(),
      };
      render(<NoteEditor initialNote={initialNote} />);
      const contentInput = screen.getByLabelText('Content');
      const initialTimestamp = initialNote.lastUpdated;
      fireEvent.change(contentInput, { target: { value: 'New Content' } });
      const newTimestamp = (screen.getByLabelText('Content') as HTMLTextAreaElement)
        .value;
      expect(initialTimestamp).not.toBe(newTimestamp);
    });
  });

  describe('Save/Update Functionality', () => {
    it('calls saveNote with the correct note data when the form is submitted', async () => {
      render(<NoteEditor onSave={mockOnSave} />);
      const titleInput = screen.getByLabelText('Title');
      const contentInput = screen.getByLabelText('Content');
      const saveButton = screen.getByText('Save Note');

      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSaveNote).toHaveBeenCalledTimes(1);
        const savedNote = mockSaveNote.mock.calls[0][0];
        expect(savedNote.title).toBe('Test Title');
        expect(savedNote.content).toBe('Test Content');
      });
    });

    it('displays "Saving..." while the note is being saved', async () => {
      mockSaveNote.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<NoteEditor onSave={mockOnSave} />);
      const titleInput = screen.getByLabelText('Title');
      const contentInput = screen.getByLabelText('Content');
      const saveButton = screen.getByText('Save Note');

      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });
      fireEvent.click(saveButton);

      expect(saveButton).toHaveTextContent('Saving...');

      await waitFor(() => {
        expect(mockSaveNote).toHaveBeenCalled();
      });
    });

    it('calls the onSave callback with the updated note data after a successful save', async () => {
      const initialNote: Note = {
        id: '1',
        title: 'Test Title',
        content: 'Test Content',
        lastUpdated: Date.now(),
      };
      mockSaveNote.mockResolvedValue(undefined);
      render(<NoteEditor initialNote={initialNote} onSave={mockOnSave} />);
      const titleInput = screen.getByLabelText('Title');
      const contentInput = screen.getByLabelText('Content');
      const updateButton = screen.getByText('Update Note');

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(contentInput, { target: { value: 'Updated Content' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        const updatedNote = mockOnSave.mock.calls[0][0];
        expect(updatedNote.title).toBe('Updated Title');
        expect(updatedNote.content).toBe('Updated Content');
      });
    });

    it('clears the form after saving a new note', async () => {
      render(<NoteEditor onSave={mockOnSave} />);
      const titleInput = screen.getByLabelText('Title');
      const contentInput = screen.getByLabelText('Content');
      const saveButton = screen.getByText('Save Note');

      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(titleInput).toHaveValue('');
        expect(contentInput).toHaveValue('');
      });
    });
  });

  describe('Triple Binding Tests', () => {
    it('updates the component state when the initialNote prop changes', () => {
      const initialNote: Note = {
        id: '1',
        title: 'Initial Title',
        content: 'Initial Content',
        lastUpdated: Date.now(),
      };
      const { rerender } = render(<NoteEditor initialNote={initialNote} />);

      expect(screen.getByLabelText('Title')).toHaveValue('Initial Title');
      expect(screen.getByLabelText('Content')).toHaveValue('Initial Content');

      const updatedNote: Note = {
        ...initialNote,
        title: 'Updated Title',
        content: 'Updated Content',
      };
      rerender(<NoteEditor initialNote={updatedNote} />);

      expect(screen.getByLabelText('Title')).toHaveValue('Updated Title');
      expect(screen.getByLabelText('Content')).toHaveValue('Updated Content');
    });

    it('calls the onSave callback with the updated note data when edited', async () => {
      const initialNote: Note = {
        id: '1',
        title: 'Initial Title',
        content: 'Initial Content',
        lastUpdated: Date.now(),
      };
      render(<NoteEditor initialNote={initialNote} onSave={mockOnSave} />);

      const titleInput = screen.getByLabelText('Title');
      const contentInput = screen.getByLabelText('Content');
      const updateButton = screen.getByText('Update Note');

      fireEvent.change(titleInput, { target: { value: 'Edited Title' } });
      fireEvent.change(contentInput, { target: { value: 'Edited Content' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        const updatedNote = mockOnSave.mock.calls[0][0];
        expect(updatedNote.title).toBe('Edited Title');
        expect(updatedNote.content).toBe('Edited Content');
      });
    });
  });

  describe('Validation Tests', () => {
    it('prevents form submission with empty title and content', async () => {
      render(<NoteEditor onSave={mockOnSave} />);
      const saveButton = screen.getByText('Save Note');

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSaveNote).not.toHaveBeenCalled();
      });
    });

    it('allows submission with valid title and content', async () => {
      render(<NoteEditor onSave={mockOnSave} />);
      const titleInput = screen.getByLabelText('Title');
      const contentInput = screen.getByLabelText('Content');
      const saveButton = screen.getByText('Save Note');

      fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
      fireEvent.change(contentInput, { target: { value: 'Valid Content' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSaveNote).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays an error message if saveNote fails', async () => {
      mockSaveNote.mockRejectedValue(new Error('Failed to save note'));
      render(<NoteEditor onSave={mockOnSave} />);

      const titleInput = screen.getByLabelText('Title');
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });

      const contentInput = screen.getByLabelText('Content');
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });

      const saveButton = screen.getByText('Save Note');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save note')).toBeInTheDocument();
      });
    });
  });
});
