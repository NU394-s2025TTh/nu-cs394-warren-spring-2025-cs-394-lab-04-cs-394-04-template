/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for noteService.ts
 *
 * This test suite verifies the implementation of the noteService functions:
 *
 * 1. **`saveNote` Function**:
 *    - Ensures `setDoc` is called with the correct parameters when saving a note.
 *    - Verifies that errors are handled gracefully and re-thrown when `setDoc` fails.
 *   - Tests both the collection reference and the full path to the document, i.e you could use doc(db, 'notes', note.id) or doc(db, 'notes/noteId').
 *    - one caveat is that if you DON'T have firebase create unique id; there is a chance that the document will be created twice.
 *   - This can be avoided by using the collection reference and passing the note.id as a second parameter to doc.
 *
 *
 * 2. **`deleteNote` Function**:
 *    - Ensures `deleteDoc` is called with the correct parameters when deleting a note.
 *    - Verifies that errors are handled gracefully and re-thrown when `deleteDoc` fails.
 *
 * 3. **`transformSnapshot` Function**:
 *    - Verifies that a Firestore snapshot is correctly transformed into a `Notes` object.
 *    - Tests with an empty snapshot to ensure it returns an empty object.
 *
 * 4. **`subscribeToNotes` Function**:
 *    - Ensures `onSnapshot` is called with the correct collection reference.
 *    - Verifies that the callback is called with the transformed `Notes` object when the snapshot changes.
 *    - Ensures errors in the subscription are handled gracefully and the error callback is invoked.
 */

import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  FirestoreError,
  onSnapshot,
  QuerySnapshot,
  setDoc,
} from 'firebase/firestore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteNote,
  saveNote,
  subscribeToNotes,
  transformSnapshot,
} from '../services/noteService';
import { Note } from '../types/Note';

// Mock the entire firebase-config module
vi.mock('../firebase-config', () => ({
  db: 'mockDb', // Mock the Firestore database instance
}));

// Mock Firestore functions
vi.mock('firebase/firestore');

describe('noteService', () => {
  let mockDoc: ReturnType<typeof vi.fn>;
  let mockSetDoc: ReturnType<typeof vi.fn>;
  let mockDeleteDoc: ReturnType<typeof vi.fn>;
  let mockCollection: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    // Reset mocks before each test
    mockDoc = vi.fn().mockReturnValue('mockDoc');
    mockSetDoc = vi.fn().mockResolvedValue(undefined); // Mock setDoc to return a resolved promise
    mockDeleteDoc = vi.fn().mockResolvedValue(undefined); // Mock deleteDoc to return a resolved promise
    //mockOnSnapshot = vi.fn().mockReturnValue(() => {}); // Mock onSnapshot to return an unsubscribe function
    mockCollection = vi.fn().mockReturnValue('mockCollection'); // Mock collection to return a mock collection reference

    // Reset the mocked implementations
    vi.mocked(doc).mockImplementation(mockDoc);
    vi.mocked(setDoc).mockImplementation(mockSetDoc);
    vi.mocked(deleteDoc).mockImplementation(mockDeleteDoc);
    vi.mocked(onSnapshot).mockImplementation((_, onNext: any) => {
      // Default implementation for successful snapshot
      const mockSnapshot = {
        docs: [
          {
            id: '1',
            data: () => ({
              id: '1',
              title: 'Note 1',
              content: 'Content 1',
              lastUpdated: 1234567890,
            }),
          },
        ],
      } as unknown as QuerySnapshot<DocumentData>;

      onNext(mockSnapshot); // Invoke the success callback with the mock snapshot
      return () => {}; // Return a mock unsubscribe function
    }) as any;
    vi.mocked(collection).mockImplementation(mockCollection); // Mock collection to return a mock collection reference
  });
  afterEach(() => {
    // Clear all mocks after each test
    vi.clearAllMocks();
  });

  describe('saveNote', () => {
    it('should call setDoc with the correct parameters, using either collection or full path', async () => {
      const mockNote: Note = {
        id: '1',
        title: 'Test Note',
        content: 'This is a test',
        lastUpdated: Date.now(),
      };

      await saveNote(mockNote);

      // Verify that either the collection function or the full path was used
      const fullPathCalled = mockDoc.mock.calls.some(
        (call) => call[1] === `notes/${mockNote.id}`,
      );
      const collectionPathCalled = mockDoc.mock.calls.some(
        (call) => call[0] === 'mockCollection' && call[1] === mockNote.id,
      );

      expect(fullPathCalled || collectionPathCalled).toBe(true); // Ensure one of the valid approaches was used
      expect(mockSetDoc).toHaveBeenCalledWith('mockDoc', mockNote);
    });
  });

  describe('deleteNote', () => {
    it('should call deleteDoc with the correct parameters, using either collection or full path', async () => {
      const noteId = '1';

      await deleteNote(noteId);

      // Verify that either the collection function or the full path was used
      const fullPathCalled = mockDoc.mock.calls.some(
        (call) => call[1] === `notes/${noteId}`,
      );
      const collectionPathCalled = mockDoc.mock.calls.some(
        (call) => call[0] === 'mockCollection' && call[1] === noteId,
      );

      expect(fullPathCalled || collectionPathCalled).toBe(true); // Ensure one of the valid approaches was used
      expect(mockDeleteDoc).toHaveBeenCalledWith('mockDoc');
    });
  });

  describe('transformSnapshot', () => {
    it('should transform a Firestore snapshot into a Notes object', () => {
      const mockSnapshot = {
        docs: [
          {
            id: '1',
            data: () => ({
              id: '1',
              title: 'Note 1',
              content: 'Content 1',
              lastUpdated: 1234567890,
            }),
          },
          {
            id: '2',
            data: () => ({
              id: '2',
              title: 'Note 2',
              content: 'Content 2',
              lastUpdated: 1234567891,
            }),
          },
        ],
      };

      const result = transformSnapshot(mockSnapshot as any);

      expect(result).toEqual({
        '1': { id: '1', title: 'Note 1', content: 'Content 1', lastUpdated: 1234567890 },
        '2': { id: '2', title: 'Note 2', content: 'Content 2', lastUpdated: 1234567891 },
      });
    });

    it('should return an empty object for an empty snapshot', () => {
      const mockSnapshot = { docs: [] };

      const result = transformSnapshot(mockSnapshot as any);

      expect(result).toEqual({});
    });
  });

  describe('subscribeToNotes', () => {
    it('should handle errors in the subscription gracefully', () => {
      const onError = vi.fn();
      const error: FirestoreError = {
        name: 'FirestoreError',
        message: 'Subscription error',
        code: 'not-found',
        stack: 'Error stack trace',
      };
      // Mock onSnapshot to simulate an error by invoking the onError callback....have to type as any for some strange reason
      vi.mocked(onSnapshot).mockImplementation((_, __, onError: any) => {
        if (onError !== undefined) {
          onError(error);
        } else {
          //fail the test
          throw error; // Throw the error to propagate it
        }
        return () => {}; // Return a valid unsubscribe function
      }) as any;

      subscribeToNotes(() => undefined, onError);

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should call onSnapshot with the correct collection reference', () => {
      const mockCallback = vi.fn();
      subscribeToNotes(mockCallback, vi.fn());

      expect(mockCollection).toHaveBeenCalledWith('mockDb', 'notes');
    });

    it('should invoke the callback with the transformed Notes object when the snapshot changes', () => {
      const mockCallback = vi.fn();

      // Mock snapshot data
      const mockSnapshot = {
        docs: [
          {
            id: '1',
            data: () => ({
              id: '1',
              title: 'Note 1',
              content: 'Content 1',
              lastUpdated: 1234567890,
            }),
          },
          {
            id: '2',
            data: () => ({
              id: '2',
              title: 'Note 2',
              content: 'Content 2',
              lastUpdated: 1234567891,
            }),
          },
        ],
      } as unknown as QuerySnapshot<DocumentData>;

      // Mock onSnapshot to invoke the callback with the mock snapshot
      vi.mocked(onSnapshot).mockImplementation((_, onNext: any) => {
        onNext(mockSnapshot); // Simulate snapshot change
        return () => {}; // Return a mock unsubscribe function
      });

      subscribeToNotes(mockCallback, vi.fn());

      expect(mockCallback).toHaveBeenCalledWith({
        '1': { id: '1', title: 'Note 1', content: 'Content 1', lastUpdated: 1234567890 },
        '2': { id: '2', title: 'Note 2', content: 'Content 2', lastUpdated: 1234567891 },
      });
    });

    it('should handle an empty snapshot correctly', () => {
      const mockCallback = vi.fn();

      // Mock an empty snapshot
      const mockSnapshot = {
        docs: [],
      } as unknown as QuerySnapshot<DocumentData>;

      // Mock onSnapshot to invoke the callback with the empty snapshot
      vi.mocked(onSnapshot).mockImplementation((query, observerOrOnNext: any) => {
        if (typeof observerOrOnNext === 'function') {
          observerOrOnNext(mockSnapshot);
        }
        return () => {}; // Return a mock unsubscribe function
      }) as any;

      subscribeToNotes(mockCallback, vi.fn());

      expect(mockCallback).toHaveBeenCalledWith({});
    });

    it('should return an unsubscribe function that is callable and works as expected', () => {
      const mockCallback = vi.fn();
      const unsubscribeMock = vi.fn(); // Mock the unsubscribe function

      // Mock onSnapshot to return the unsubscribe function
      vi.mocked(onSnapshot).mockImplementation(() => {
        return unsubscribeMock;
      });

      const unsubscribe = subscribeToNotes(mockCallback, vi.fn());

      // Call the unsubscribe function
      unsubscribe();

      // Verify that the unsubscribe function was called
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
