# Lexicon - Smart Vocabulary Builder

Lexicon is a MERN stack application that helps users save new vocabulary words and review them using a simple spaced repetition system.

When a user adds a word, the application automatically fetches its definition and example sentence from the free Dictionary API and stores it in MongoDB. The review section then shows words that are due for revision and schedules the next review date based on the user's performance.

## Tech Stack

### Frontend

- React.js (Vite)
- CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB with Mongoose

### External API

- Dictionary API (dictionaryapi.dev)

---

## Running the Project

### Backend

```bash
cd Backend
npm install
npm run dev
```

Create a `.env` file in the `Backend` folder and configure:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/vocab-builder
```

### Frontend

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` folder and configure the API base URL:

```env
VITE_API_BASE_URL=http://localhost:5001/api/words
```

Then start the frontend:

```bash
npm run dev
```

The frontend dev server runs on:

```text
http://localhost:5173
```

The frontend uses the configured `VITE_API_BASE_URL` for all API requests.

---

## Features

### Add New Words

Users can enter a vocabulary word and the system will:

- Fetch its definition
- Fetch an example sentence (if available)
- Save the word in MongoDB
- Make it immediately available for review

### Review Mode

The review page displays words that are due.

Workflow:

1. Show the word
2. Reveal the definition
3. User selects:
   - Got It Right
   - Needs Work

4. Next review date is automatically calculated

### Spaced Repetition Logic

Normal mode:

| Result       | Next Review |
| ------------ | ----------- |
| Needs Work   | 1 Day       |
| Got It Right | 3 Days      |

For demonstration purposes, a Dev Mode is available:

| Result       | Next Review |
| ------------ | ----------- |
| Needs Work   | 1 Minute    |
| Got It Right | 3 Minutes   |

This allows the complete review cycle to be tested quickly without waiting for days.

---

## Project Structure

I tried to keep the backend responsibilities separated so that each file has a clear purpose.

### dictionaryService.js

Handles communication with the external Dictionary API.

Responsibilities:

- Fetch definitions
- Extract example sentences
- Handle API errors

### srsService.js

Contains the spaced repetition scheduling logic.

Given:

- Review result
- Dev mode status

It returns:

- The next review date

Keeping this logic separate makes it easier to test and maintain.

### Word Model

Stores:

- Word
- Definition
- Example
- Review history
- Next review date

An index is added to the review date field because review queries are performed frequently.

### Routes

The route layer remains lightweight and focuses only on:

- Request validation
- Calling services
- Returning responses

---

## Frontend Design Decisions

The application is small, so I avoided adding Redux or other state-management libraries.

Instead:

- App component manages global UI state
- Review and Library pages manage their own data
- Components update their local state after API calls to keep the interface responsive

This approach keeps the codebase simple while still being easy to understand.

---

## User Experience

A few UI decisions were made to improve the experience:

- Flashcard-style review interface
- Definition hidden until revealed
- Clear success and error messages
- Responsive layout for mobile and desktop
- Empty states when no words are available
- Loading indicators during API requests

---

## API Endpoints

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | /api/words                 | Get all saved words   |
| POST   | /api/words                 | Add a new word        |
| DELETE | /api/words/:id             | Delete a word         |
| GET    | /api/words/review/queue    | Get due words         |
| POST   | /api/words/:id/review      | Submit review result  |
| POST   | /api/words/dev/skip-to-due | Mark all words as due |
| GET    | /api/health                | Health check          |

For simplicity, the application currently uses a single hardcoded user and does not implement authentication.
