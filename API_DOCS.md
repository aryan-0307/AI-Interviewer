# AI Interview Agent API Documentation

This guide provides all the necessary endpoints and payloads to test the backend using Postman and integrate it with your frontend.

Base URL: `http://localhost:8000`

---

## 1. Health Check
Check if the API is running successfully.

* **Endpoint:** `GET /`
* **Response:**
```json
{
  "status": "online",
  "app": "AI Interview Agent",
  "version": "1.0.0"
}
```

---

## 2. Get Candidates
Retrieve a list of available candidates to start an interview with.

* **Endpoint:** `GET /api/candidates`
* **Response:**
```json
[
  {
    "id": "candidate_001",
    "name": "Aryan Sharma",
    "experience_level": "mid",
    "background": "Software Engineer with 3 years of experience...",
    "weaknesses": ["System Design", "Concurrency"],
    "strengths": ["Python", "Algorithms"]
  }
]
```

---

## 3. Get Curriculum
Retrieve the 8-day curriculum.

* **Endpoint:** `GET /api/curriculum`
* **Response:**
```json
[
  {
    "day": 1,
    "topics": ["Python Basics", "Data Structures"]
  }
]
```

---

## 4. Start Interview
Initialize a new interview session for a specific candidate. **This is the first step of the interview flow.**

* **Endpoint:** `POST /api/interview/start`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "candidate_id": "candidate_001"
}
```
* **Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Hello Aryan Sharma. Let's begin the interview.",
  "first_question": {
    "question": "Can you explain how list comprehensions work in Python?",
    "topic": "Python Basics",
    "difficulty": "medium",
    "context": "Testing basic syntax",
    "curriculum_day": 1
  }
}
```
**Important:** Save the `session_id` returned here, as you will need it for the next endpoints!

---

## 5. Submit Answer
Submit the candidate's answer to the current question and receive an evaluation and the next question (or notice to finish).

* **Endpoint:** `POST /api/interview/answer`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "answer": "List comprehensions provide a concise way to create lists..."
}
```
* **Response:**
```json
{
  "evaluation": {
    "accuracy": 8,
    "depth": 7,
    "communication": 9,
    "confidence": 8,
    "practical_knowledge": 7,
    "system_design": 5
  },
  "feedback": "Good explanation of the syntax. You could also mention performance benefits.",
  "next_action": "next_question", 
  "next_question": {
    "question": "What is the Global Interpreter Lock (GIL)?",
    "topic": "Concurrency",
    "difficulty": "hard",
    "context": "Candidate showed strength in Python basics.",
    "curriculum_day": 2
  },
  "is_finished": false
}
```
**Note:** If `is_finished` is true, or `next_action` is `finish_interview`, you should redirect the frontend to a completion screen and call the Finish Interview endpoint to get the final report.

---

## 6. Finish Interview
Complete the interview and generate the final comprehensive report.

* **Endpoint:** `POST /api/interview/finish`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "session_id": "YOUR_SESSION_ID_HERE"
}
```
* **Response:**
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "overall_score": 7.5,
  "strengths": ["Python Basics", "Communication"],
  "weaknesses": ["Concurrency", "System Design"],
  "missed_concepts": ["GIL performance implications"],
  "recommended_curriculum_days": [2, 7],
  "interview_summary": "The candidate demonstrated strong foundational knowledge...",
  "improvement_suggestions": ["Review Python multiprocessing."]
}
```

---

## 7. Get Session Status
Useful for retrieving the state of an interview if the frontend is refreshed.

* **Endpoint:** `GET /api/session/{session_id}`
* **Response:**
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "candidate_id": "candidate_001",
  "status": "in_progress",
  "question_count": 3,
  "conversation": [ ],
  "covered_curriculum_days": [1, 2],
  "weak_topics": ["Concurrency"],
  "strong_topics": ["Python Basics"]
}
```
