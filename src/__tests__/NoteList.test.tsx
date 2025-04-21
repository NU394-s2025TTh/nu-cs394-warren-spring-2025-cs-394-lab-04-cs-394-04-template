/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/__tests__/NoteList.test.tsx
// ignore any errors in this file
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NoteList from '../components/NoteList';
import { subscribeToNotes } from '../services/noteService';
import { Notes } from '../types/Note';

// Mock the noteService module
vi.mock('../services/noteService', () => {
  return {
    subscribeToNotes: vi.fn(),
  };
});

describe('NoteList Component', () => {
  const mockUnsubscribe = vi.fn();
  const mockOnEditNote = vi.fn(); // Mock for onEditNote

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should show loading state initially', () => {
    // Mock subscribeToNotes to return the mockUnsubscribe function
    vi.mocked(subscribeToNotes).mockReturnValue(mockUnsubscribe);

    render(<NoteList onEditNote={mockOnEditNote} />);

    // Check for loading indicator
    expect(screen.getByText(/loading notes/i)).toBeInTheDocument();
  });

  it('should display notes when data is loaded', async () => {
    // Mock subscribeToNotes to immediately call the callback with mock data
    vi.mocked(subscribeToNotes).mockImplementation((callback) => {
      // Call the callback with mock notes
      callback(mockNotes);
      return mockUnsubscribe;
    });

    render(<NoteList onEditNote={mockOnEditNote} />);

    // Wait for notes to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      expect(screen.getByText('Test Note 2')).toBeInTheDocument();
    });
  });

  it('should display a message when there are no notes', async () => {
    // Mock subscribeToNotes to immediately call the callback with empty data
    (subscribeToNotes as any).mockImplementation((callback: any) => {
      // Call the callback with empty notes
      callback({});
      return mockUnsubscribe;
    });

    render(<NoteList onEditNote={mockOnEditNote} />);

    // Wait for the "no notes" message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
    });
  });

  it('should show error state when an error occurs', async () => {
    // Mock subscribeToNotes to throw an error
    const errorMessage = 'Failed to load notes';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (subscribeToNotes as any).mockImplementation((callback: any) => {
      // Simulate an error by throwing
      throw new Error(errorMessage);
    });

    // We need to suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    render(<NoteList onEditNote={mockOnEditNote} />);

    // Wait for error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should unsubscribe from Firebase when unmounting', () => {
    // Mock subscribeToNotes to return the mockUnsubscribe function
    (subscribeToNotes as any).mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<NoteList />);

    // Unmount the component
    unmount();

    // Check if the unsubscribe function was called
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  // BONUS TEST: This tests for a common mistake where students might not handle
  // their subscriptions properly when a component re-renders
  it('should not create multiple subscriptions on re-render', async () => {
    // Mock subscribeToNotes to return the mockUnsubscribe function
    (subscribeToNotes as any).mockReturnValue(mockUnsubscribe);

    const { rerender } = render(<NoteList />);

    // Force a re-render of the component
    rerender(<NoteList />);

    // Check that subscribeToNotes was only called once
    expect(subscribeToNotes).toHaveBeenCalledTimes(1);
  });
});

const mockNotes: Notes = {
  note1: {
    id: 'note1',
    title: 'Test Note 1',
    content: 'This is the content of Test Note 1',
    lastUpdated: Date.now(),
  },
  note2: {
    id: 'note2',
    title: 'Test Note 2',
    content: 'This is the content of Test Note 2',
    lastUpdated: Date.now(),
  },
};
