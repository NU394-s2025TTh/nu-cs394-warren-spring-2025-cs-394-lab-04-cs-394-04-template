import '@testing-library/jest-dom';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import NoteItem from '../components/NoteItem';
import { deleteNote } from '../services/noteService';
import { Note } from '../types/Note';

// Mock the deleteNote function
vi.mock('../services/noteService', () => {
  const mockDeleteNote = vi.fn(() => Promise.resolve());
  return {
    deleteNote: mockDeleteNote,
  };
});

describe('NoteItem Component', () => {
  // Mock note data
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'This is a test note.',
    lastUpdated: Date.now(),
  };

  describe('Rendering Tests', () => {
    it('renders the note title, content, and last updated timestamp correctly', () => {
      render(<NoteItem note={mockNote} />);

      // Check title
      expect(screen.getByText(mockNote.title)).toBeInTheDocument();

      // Check content
      expect(screen.getByText(mockNote.content)).toBeInTheDocument();

      // Check last updated timestamp (formatted as "Last updated: ...")
      const lastUpdatedElement = screen.getByText(/Last updated:/);
      expect(lastUpdatedElement).toBeInTheDocument();
      expect(lastUpdatedElement).toHaveAttribute('title'); // Ensure title attribute exists
    });

    it('renders the "Edit" button only if the onEdit prop is provided', () => {
      const { rerender } = render(<NoteItem note={mockNote} />);
      // Without onEdit prop
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();

      // With onEdit prop
      rerender(<NoteItem note={mockNote} onEdit={vi.fn()} />);
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('always renders the "Delete" button', () => {
      render(<NoteItem note={mockNote} />);
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Edit Button Functionality', () => {
    it('calls the onEdit callback with the correct note when the Edit button is clicked', async () => {
      const onEditMock = vi.fn();
      render(<NoteItem note={mockNote} onEdit={onEditMock} />);

      const editButton = screen.getByText('Edit');
      await userEvent.click(editButton);

      expect(onEditMock).toHaveBeenCalledTimes(1);
      expect(onEditMock).toHaveBeenCalledWith(mockNote);
    });

    it('disables the "Edit" button when the deleting state is true', async () => {
      const onEditMock = vi.fn();

      // Mock window.confirm to always return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<NoteItem note={mockNote} onEdit={onEditMock} />);

      // Simulate clicking the "Delete" button to trigger the deleting state
      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);

      // Wait for the "Edit" button to become disabled
      const editButton = await screen.findByText('Edit');
      expect(editButton).toBeDisabled();

      // Restore the original window.confirm behavior
      vi.restoreAllMocks();
    });
  });

  describe('Delete Button Functionality', () => {
    it('triggers a confirmation dialog when the Delete button is clicked', async () => {
      // Mock window.confirm
      const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<NoteItem note={mockNote} />);

      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);

      // Ensure the confirmation dialog is triggered
      expect(confirmMock).toHaveBeenCalledTimes(1);

      // Restore the original window.confirm behavior
      vi.restoreAllMocks();
    });

    it('calls the deleteNote function with the correct note ID when confirmed', async () => {
      // Mock window.confirm to always return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      // Access the mocked deleteNote function
      const deleteNoteMock = vi.mocked(deleteNote);

      render(<NoteItem note={mockNote} />);

      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);

      // Ensure deleteNote is called with the correct note ID
      expect(deleteNoteMock).toHaveBeenCalledTimes(1);
      expect(deleteNoteMock).toHaveBeenCalledWith(mockNote.id);

      // Restore mocks
      vi.restoreAllMocks();
    });

    it('displays Deleting... and disables the Delete button while deleting', async () => {
      // Mock window.confirm to always return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<NoteItem note={mockNote} />);

      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);
      // Check that the button displays "Deleting..." and is disabled
      expect(deleteButton).toHaveTextContent('Deleting...');
      expect(deleteButton).toBeDisabled();
      // Restore mocks
      vi.restoreAllMocks();
    });
  });

  describe('Error Handling', () => {
    it('displays an error message if deleteNote fails', async () => {
      // Mock window.confirm to always return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      // Mock deleteNote to reject with an error
      const errorMessage = 'Failed to delete note.';
      const deleteNoteMock = vi.mocked(deleteNote);
      deleteNoteMock.mockRejectedValueOnce(new Error(errorMessage));

      render(<NoteItem note={mockNote} />);

      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);

      // Wait for the error message to appear
      const errorElement = await screen.findByText(errorMessage);
      expect(errorElement).toBeInTheDocument();

      // Ensure the "Delete" button is re-enabled after the error
      expect(deleteButton).not.toBeDisabled();

      // Restore mocks
      vi.restoreAllMocks();
    });

    it('does not display an error message if deleteNote succeeds', async () => {
      // Mock window.confirm to always return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      // Mock deleteNote to resolve successfully
      const deleteNoteMock = vi.mocked(deleteNote);
      deleteNoteMock.mockResolvedValueOnce(undefined);

      render(<NoteItem note={mockNote} />);

      const deleteButton = screen.getByText('Delete');
      await userEvent.click(deleteButton);

      // Ensure no error message is displayed
      const errorElement = screen.queryByText(/Failed to delete note/);
      expect(errorElement).not.toBeInTheDocument();

      // Restore mocks
      vi.restoreAllMocks();
    });
  });

  describe('Date Formatting', () => {
    it('formats the timestamp correctly using formatDate', () => {
      const mockTimestamp = new Date('2025-04-04T15:30:00Z').getTime();
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(new Date(mockTimestamp));

      render(<NoteItem note={{ ...mockNote, lastUpdated: mockTimestamp }} />);

      const lastUpdatedElement = screen.getByText(/Last updated:/);
      expect(lastUpdatedElement).toHaveAttribute('title', formattedDate);
    });

    it('calculates the correct time ago string using getTimeAgo', () => {
      const now = Date.now();

      // Test cases for different time intervals
      const testCases = [
        { timestamp: now - 60 * 1000, expected: '1 minute ago' }, // 1 minute ago
        { timestamp: now - 2 * 60 * 1000, expected: '2 minutes ago' }, // 2 minutes ago
        { timestamp: now - 60 * 60 * 1000, expected: '1 hour ago' }, // 1 hour ago
        { timestamp: now - 24 * 60 * 60 * 1000, expected: '1 day ago' }, // 1 day ago
        { timestamp: now - 30 * 24 * 60 * 60 * 1000, expected: '1 month ago' }, // 1 month ago
        { timestamp: now - 365 * 24 * 60 * 60 * 1000, expected: '1 year ago' }, // 1 year ago
      ];

      testCases.forEach(({ timestamp, expected }) => {
        // Cleanup the DOM before rendering the next component
        cleanup();

        render(<NoteItem note={{ ...mockNote, lastUpdated: timestamp }} />);

        const lastUpdatedElement = screen.getByText(/Last updated:/);
        expect(lastUpdatedElement).toHaveTextContent(expected);
      });
    });
  });

  describe('Triple Binding', () => {
    it('updates the displayed note when the `note` prop changes', async () => {
      const { rerender } = render(<NoteItem note={mockNote} />);

      // Verify initial note content
      expect(screen.getByText(mockNote.title)).toBeInTheDocument();
      expect(screen.getByText(mockNote.content)).toBeInTheDocument();

      // Update the note prop
      const updatedNote = {
        ...mockNote,
        title: 'Updated Note Title',
        content: 'Updated note content.',
      };
      rerender(<NoteItem note={updatedNote} />);

      // Verify updated note content
      expect(screen.getByText(updatedNote.title)).toBeInTheDocument();
      expect(screen.getByText(updatedNote.content)).toBeInTheDocument();
    });

    it('calls the `onEdit` callback and updates the note when edited', async () => {
      const onEditMock = vi.fn();
      render(<NoteItem note={mockNote} onEdit={onEditMock} />);

      const editButton = screen.getByText('Edit');
      await userEvent.click(editButton);

      // Verify that the `onEdit` callback is called with the correct note
      expect(onEditMock).toHaveBeenCalledTimes(1);
      expect(onEditMock).toHaveBeenCalledWith(mockNote);

      // Simulate an edit by updating the note prop
      const editedNote = {
        ...mockNote,
        title: 'Edited Note Title',
        content: 'Edited note content.',
      };
      render(<NoteItem note={editedNote} onEdit={onEditMock} />);

      // Verify the updated note content
      expect(screen.getByText(editedNote.title)).toBeInTheDocument();
      expect(screen.getByText(editedNote.content)).toBeInTheDocument();
    });
  });
});
