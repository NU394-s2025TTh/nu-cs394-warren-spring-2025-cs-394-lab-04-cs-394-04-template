# Lab Assignment: React useEffect with Firebase Triple Binding

## Overview

In this lab, you will build a collaborative note-taking application that demonstrates the integration of React's state management with Firebase's real-time database capabilities. The application will implement "triple binding" - the synchronization between UI, React state, and Firebase database - allowing multiple users to see updates in real-time.

## Learning Objectives

- Master React's useEffect hook for managing component lifecycles and side effects
- Implement proper Firebase database connections and listeners
- Create "triple binding" between React state and Firebase
- Apply best practices for handling asynchronous operations in React
- Implement proper cleanup to prevent memory leaks

## Background

React's `useEffect` hook is critical for managing side effects in functional components. When working with external services like Firebase, understanding the correct patterns for establishing, maintaining, and cleaning up connections is essential for building robust applications.

### Triple Binding Concept

Triple binding creates a two-way connection between:

1. **UI Components**: What the user sees and interacts with
2. **Application State**: React state managed with hooks
3. **Database**: Firebase Firestore or Realtime Database

Changes in any of these layers propagate to the others automatically, creating a seamless user experience.

## Firebase Emulator

This lab requires the Firebase emulator for local development. The emulator allows you to:

- Develop without affecting production databases
- Test without network connectivity or usage limits
- Have a consistent development environment

For detailed setup instructions, refer to the [Northwestern CS 394 Guide on Firebase](https://courses.cs.northwestern.edu/394/guides/firebase-notes.php#data-binding).

The app also assumes you have set environment variables for Firebase configuration. You can find the `.env` file in the root of the project. Make sure to fill in your Firebase project credentials for the database.

## Lab Requirements

### 1. Implement the Firebase Service

The `noteService.ts` file contains skeleton code for three main functions:

- `saveNote`: Creates or updates a note in Firebase
- `deleteNote`: Removes a note from Firebase
- `subscribeToNotes`: Sets up a listener for real-time updates from Firebase

Your implementation must:

- Use Firebase Firestore methods correctly
- Handle errors appropriately
- Return the unsubscribe function from `subscribeToNotes`

### 2. Implement the Note Components

The application has several React components with TODOs:

- `NoteList`: Displays all notes with Firebase subscription
- `NoteEditor`: Creates and edits notes
- `NoteItem`: Displays individual notes with delete functionality

Focus on implementing the `useEffect` hooks correctly:

- Only subscribe once when the component mounts
- Handle loading and error states
- Properly clean up subscriptions when unmounting

### 3. Handle Firebase Lifecycle

Pay special attention to:

- Properly unsubscribing from Firebase listeners
- Preventing duplicate subscriptions
- Managing loading states during async operations
- Error handling for network or permission issues

### 4. Test Your Implementation

The repository includes tests that verify:

- Proper subscription to Firebase
- Clean unsubscription when components unmount
- Loading and error state management
- Correct handling of data flow

All tests must pass for full credit.

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up the Firebase emulator following the Northwestern CS 394 guide
4. Start the emulator with `firebase emulators:start`
5. Run the development server with `npm run dev`
6. Complete the TODOs in the code
7. Verify your implementation with `npm test`

## Submission

Submit your completed code with:

1. All TODOs implemented
2. All tests passing
3. A link to your running app deployed on firebase

## Grading Criteria

- 70%: Correct implementation, passing all tests; grade scaled to total number of tests (i.e. x/46 \* 70%)
- 20%: Builds properly
- 10% app deployed on Firebase and runs.

## Resources

- [Student Guide Notes on Firebase Emulator and Firebase Testing](student-guide.md)
- [React useEffect Documentation](https://reactjs.org/docs/hooks-effect.html)
- [Firebase Web Documentation](https://firebase.google.com/docs/web/setup)
- [Northwestern CS 394 Firebase Guide](https://courses.cs.northwestern.edu/394/guides/firebase-notes.php#data-binding)

## Detailed information: Tests that pass and fail

enough of the app is running that you can see the app in the browser (`npm run dev`). You can also run the tests in the browser (`npm test`) to see the tests that pass and fail.

Here's the test result analysis:

### Passing Tests (15 total):

**NoteEditor Component (7 tests)**

1. Renders without errors
2. Renders title and content input fields
3. Renders "Save Note" button for new notes
4. Populates input fields with initialNote data
5. Updates lastUpdated timestamp on input changes
6. Clears form after saving new note
7. Prevents form submission with empty fields

**NoteItem Component (8 tests)**

1. Renders note title, content, and timestamp correctly
2. Always renders Delete button
3. Does not display error on successful delete
4. Formats timestamp correctly using formatDate
5. Calculates correct time ago string
6. Updates displayed note when prop changes
7. Updates displayed note when `note` prop changes
8. Does not display error message if deleteNote succeeds

### Failing Tests (31 total):

**noteService Tests (7 failures)**

- Basic CRUD operations not working (saveNote, deleteNote)
- Subscription functionality issues (error handling, collection reference)
- Real-time updates not working
- Unsubscribe functionality not implemented

**NoteEditor Component (10 failures)**

- Form state management issues
- Save/Update functionality not working
- Error handling not implemented
- Triple binding issues
- Button state management (loading states)

**NoteItem Component (8 failures)**

- Edit button conditional rendering
- Delete confirmation dialog
- Button state management during operations
- Error handling for failed operations
- Edit/Delete functionality not working

**NoteList Component (6 failures)**

- Loading state display
- Error state handling
- Empty state handling
- Subscription management
- Component lifecycle issues

## Implementation Guide for Students:

Think about slices for implementation. Typically, the first issue is getting some data in the database. Here's a suggested order of implementation:

1.  **NoteEditor**: Implement just enough to be able to save a well-formed note in Firebase.
2.  **NoteList**: Implement just enough to be able to see the notes in Firebase.
3.  **NoteItem**: Implement just enough to be able to delete a note.
4.  **noteService**: Implement just enough to be able to save and delete a note in Firebase.
5.  **NoteEditor**: Implement just enough to be able to edit a note.
6.  **NoteList**: Implement just enough to be able to see the notes in Firebase.
7.  **NoteItem**: Implement just enough to be able to delete a note.
8.  **noteService**: Implement just enough to be able to save and delete a note in Firebase.

The start working on completeness for the app.

An alternate approach is to use the emulator to create some notes manually in firestore, read them in and show them in the list; see the details; then add the ability to implement. Either way--starting from edit or starting from the list will work.

Key areas to focus on:

- State management (loading, error, data states)
- Error handling throughout the application
- Button states and loading indicators
- Form validation and submission
- Real-time data synchronization
- Component lifecycle management

## A list of TODO's in the app (comments of the form `// TODO:`)

### Firebase Service Layer ([noteService.ts](src/services/noteService.ts))

- **saveNote Function**

  - [ ] Implement Firestore document creation/update
  - [ ] Use either `doc(db, 'notes/noteId')` or `doc(collection(db, 'notes'), noteId)`
  - [ ] Handle errors with appropriate error propagation
  - [ ] Return a Promise that resolves when the save is complete

- **deleteNote Function**

  - [ ] Implement Firestore document deletion
  - [ ] Handle errors appropriately
  - [ ] Return a Promise that resolves when deletion is complete

- **subscribeToNotes Function**
  - [ ] Set up real-time listener using `onSnapshot`
  - [ ] Transform incoming data using `transformSnapshot`
  - [ ] Handle errors through the onError callback
  - [ ] Return an unsubscribe function for cleanup

### React Components

#### [NoteEditor](src/components/NoteEditor.tsx) Component

- [ ] Implement form state management for title and content
- [ ] Add loading state during save operations
- [ ] Handle save/update operations with proper error handling
- [ ] Clear form after successful save
- [ ] Implement validation to prevent empty submissions
- [ ] Add button state management (disabled during save)

#### [NoteList](src/components/NoteList.tsx) Component

- [ ] Implement Firebase subscription using useEffect
- [ ] Handle loading state while data is being fetched
- [ ] Display error state when Firebase operations fail
- [ ] Show empty state when no notes exist
- [ ] Clean up subscription when component unmounts
- [ ] Prevent duplicate subscriptions on re-render

#### [NoteItem](src/components/NoteItem.tsx) Component

- [ ] Implement delete confirmation dialog
- [ ] Handle loading state during delete operation
- [ ] Display error messages when delete fails
- [ ] Implement edit functionality when onEdit is provided
- [ ] Disable buttons during operations
- [ ] Format timestamps using the provided utility functions

### Best Practices to Follow

1. **Error Handling**

   - [ ] Use try/catch blocks for async operations
   - [ ] Display user-friendly error messages
   - [ ] Maintain error states in component state

2. **Loading States**

   - [ ] Show loading indicators during async operations
   - [ ] Disable interactive elements while loading
   - [ ] Handle transitions between states smoothly

3. **Cleanup**

   - [ ] Unsubscribe from Firebase listeners on unmount
   - [ ] Clear timeouts and intervals
   - [ ] Remove event listeners

4. **State Management**

   - [ ] Use appropriate React hooks for state
   - [ ] Handle state updates properly with useEffect dependencies
   - [ ] Prevent unnecessary re-renders

5. **Testing**
   - [ ] Ensure all provided tests pass
   - [ ] Test error scenarios
   - [ ] Verify cleanup functions are called
   - [ ] Test loading and empty states
