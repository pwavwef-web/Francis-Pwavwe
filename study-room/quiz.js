/**
 * AI Quiz Engine — powered by Google Gemini
 * Used in AZ Learner / Francis Pwavwe Study Room
 */

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getApiKey() {
  let key = localStorage.getItem('gemini_api_key');
  if (!key) {
    key = prompt(
      'To use the AI Quiz, please enter your Google Gemini API key.\n' +
      '(Get a free key at https://aistudio.google.com/app/apikey)\n\n' +
      'Your key is stored only in your browser and never sent anywhere except Google.'
    );
    if (key && key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
    }
  }
  return key ? key.trim() : null;
}

async function callGemini(prompt, apiKey) {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseQuestions(rawText) {
  // Expected format: numbered list  1. Question text
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const questions = [];
  for (const line of lines) {
    const match = line.match(/^\d+[\.\)]\s+(.+)$/);
    if (match) questions.push(match[1]);
  }
  return questions.length ? questions : null;
}

/**
 * Initialise the AI quiz widget inside #quiz-section.
 * @param {string} lessonTitle   - Title of the lesson / topic
 * @param {string} lessonContent - Plain-text summary of the lesson content
 */
export function initQuiz(lessonTitle, lessonContent) {
  const section = document.getElementById('quiz-section');
  if (!section) return;

  section.innerHTML = `
    <div class="quiz-card" id="quiz-card">
      <div class="quiz-header">
        <span class="quiz-badge">AI Quiz</span>
        <h2 class="quiz-title">Test Your Understanding</h2>
        <p class="quiz-subtitle">
          Let the AI generate questions based on this lesson, answer them, and receive instant feedback with marks.
        </p>
      </div>
      <div id="quiz-body">
        <button id="startQuizBtn" class="quiz-btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          Generate AI Questions
        </button>
        <p class="quiz-hint">Powered by Google Gemini · Requires your free API key</p>
      </div>
    </div>
  `;

  document.getElementById('startQuizBtn').addEventListener('click', () => startQuiz(lessonTitle, lessonContent));
}

async function startQuiz(lessonTitle, lessonContent) {
  const body = document.getElementById('quiz-body');
  const apiKey = getApiKey();
  if (!apiKey) {
    showMsg(body, 'error', 'No API key provided. Click "Generate AI Questions" to try again.');
    return;
  }

  body.innerHTML = `<div class="quiz-loading"><div class="quiz-spinner"></div><p>Generating questions…</p></div>`;

  const genPrompt = `You are an examiner for a university Tourism Management course.
Lesson: "${lessonTitle}"
Content summary:
${lessonContent}

Generate exactly 5 short-answer exam questions based on the lesson content above.
Format: a numbered list, one question per line, like:
1. [Question]
2. [Question]
...
Do not include answers.`;

  try {
    const rawQuestions = await callGemini(genPrompt, apiKey);
    const questions = parseQuestions(rawQuestions);
    if (!questions || questions.length < 3) {
      throw new Error('Could not parse questions from AI response. Please try again.');
    }
    renderQuestionForm(body, lessonTitle, lessonContent, questions, apiKey);
  } catch (err) {
    showMsg(body, 'error', `Failed to generate questions: ${err.message}`,
      `<button id="retryBtn" class="quiz-btn-secondary" style="margin-top:0.75rem">Try Again</button>`);
    document.getElementById('retryBtn')?.addEventListener('click', () => startQuiz(lessonTitle, lessonContent));
  }
}

function renderQuestionForm(body, lessonTitle, lessonContent, questions, apiKey) {
  const qHtml = questions.map((q, i) => `
    <div class="quiz-question">
      <label class="quiz-q-label">Q${i + 1}. ${escapeHtml(q)}</label>
      <textarea id="answer-${i}" class="quiz-textarea" rows="3"
        placeholder="Type your answer here…"></textarea>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="quiz-questions-wrap">
      ${qHtml}
      <div class="quiz-actions">
        <button id="submitAnswersBtn" class="quiz-btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Submit for Marking
        </button>
        <button id="resetQuizBtn" class="quiz-btn-secondary">Reset</button>
      </div>
    </div>
  `;

  document.getElementById('submitAnswersBtn').addEventListener('click', () => {
    const answers = questions.map((_, i) => (document.getElementById(`answer-${i}`)?.value || '').trim());
    const unanswered = answers.filter(a => !a).length;
    if (unanswered === questions.length) {
      alert('Please answer at least one question before submitting.');
      return;
    }
    submitAnswers(body, lessonTitle, lessonContent, questions, answers, apiKey);
  });

  document.getElementById('resetQuizBtn').addEventListener('click', () => {
    startQuiz(lessonTitle, lessonContent);
  });
}

async function submitAnswers(body, lessonTitle, lessonContent, questions, answers, apiKey) {
  body.innerHTML = `<div class="quiz-loading"><div class="quiz-spinner"></div><p>Marking your answers…</p></div>`;

  const qaBlock = questions.map((q, i) =>
    `Q${i + 1}: ${q}\nStudent Answer: ${answers[i] || '(No answer provided)'}`
  ).join('\n\n');

  const markPrompt = `You are a university examiner marking a Tourism Management exam.
Lesson: "${lessonTitle}"
Content summary:
${lessonContent}

Student's answers:
${qaBlock}

For each question:
1. Award marks out of 2 (0 = incorrect / no answer, 1 = partially correct, 2 = fully correct).
2. Give brief feedback (1-2 sentences).
3. Provide the ideal short answer.

Format your response EXACTLY like this (repeat for each question):
---
Q[N] | Score: [X]/2
Feedback: [your feedback]
Model Answer: [ideal answer]
---

At the end, add a line like:
TOTAL: [X]/[Y]`;

  try {
    const result = await callGemini(markPrompt, apiKey);
    renderResults(body, result, questions.length, lessonTitle, lessonContent);
  } catch (err) {
    showMsg(body, 'error', `Marking failed: ${err.message}`,
      `<button id="retryMarkBtn" class="quiz-btn-secondary" style="margin-top:0.75rem">Try Again</button>`);
    document.getElementById('retryMarkBtn')?.addEventListener('click', () =>
      submitAnswers(body, lessonTitle, lessonContent, questions, answers, apiKey));
  }
}

function renderResults(body, markingText, numQuestions, lessonTitle, lessonContent) {
  // Parse the structured response
  const blocks = markingText.split('---').map(b => b.trim()).filter(Boolean);
  const totalMatch = markingText.match(/TOTAL:\s*(\d+)\s*\/\s*(\d+)/i);
  const totalEarned = totalMatch ? parseInt(totalMatch[1]) : null;
  const totalPossible = totalMatch ? parseInt(totalMatch[2]) : numQuestions * 2;

  const resultCards = blocks
    .filter(b => /Q\d+\s*\|/.test(b))
    .map(block => {
      const scoreMatch = block.match(/Q(\d+)\s*\|\s*Score:\s*(\d+)\s*\/\s*(\d+)/i);
      const feedbackMatch = block.match(/Feedback:\s*(.+?)(?=Model Answer:|$)/is);
      const modelMatch = block.match(/Model Answer:\s*(.+)/is);

      const qNum = scoreMatch ? scoreMatch[1] : '?';
      const score = scoreMatch ? parseInt(scoreMatch[2]) : 0;
      const possible = scoreMatch ? parseInt(scoreMatch[3]) : 2;
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : '';
      const model = modelMatch ? modelMatch[1].trim() : '';

      const scoreColor = score === possible ? '#4ade80' : score > 0 ? '#fbbf24' : '#f87171';
      return `
        <div class="result-card">
          <div class="result-card-header">
            <span class="result-q-num">Question ${qNum}</span>
            <span class="result-score" style="color:${scoreColor}">${score}/${possible}</span>
          </div>
          ${feedback ? `<p class="result-feedback"><strong>Feedback:</strong> ${escapeHtml(feedback)}</p>` : ''}
          ${model ? `<p class="result-model"><strong>Model Answer:</strong> ${escapeHtml(model)}</p>` : ''}
        </div>
      `;
    }).join('');

  const percentage = totalEarned !== null ? Math.round((totalEarned / totalPossible) * 100) : null;
  const grade = percentage !== null ? getGrade(percentage) : '';
  const gradeColor = percentage !== null ? getGradeColor(percentage) : '#94a3b8';

  body.innerHTML = `
    <div class="results-wrap">
      ${totalEarned !== null ? `
        <div class="results-summary">
          <div class="results-total" style="color:${gradeColor}">${totalEarned}/${totalPossible}</div>
          <div class="results-pct" style="color:${gradeColor}">${percentage}% · ${grade}</div>
          <p class="results-summary-text">${getSummaryText(percentage)}</p>
        </div>
      ` : ''}
      <div class="results-cards">${resultCards}</div>
      <div class="quiz-actions" style="margin-top:1.5rem">
        <button id="retakeBtn" class="quiz-btn-primary">Retake Quiz</button>
        <button id="newQuestionsBtn" class="quiz-btn-secondary">New Questions</button>
      </div>
    </div>
  `;

  document.getElementById('retakeBtn')?.addEventListener('click', () => {
    startQuiz(lessonTitle, lessonContent);
  });
  document.getElementById('newQuestionsBtn')?.addEventListener('click', () => {
    startQuiz(lessonTitle, lessonContent);
  });
}

function getGrade(pct) {
  if (pct >= 80) return 'Distinction';
  if (pct >= 70) return 'Merit';
  if (pct >= 60) return 'Credit';
  if (pct >= 50) return 'Pass';
  return 'Needs Improvement';
}

function getGradeColor(pct) {
  if (pct >= 80) return '#4ade80';
  if (pct >= 70) return '#a3e635';
  if (pct >= 60) return '#fbbf24';
  if (pct >= 50) return '#fb923c';
  return '#f87171';
}

function getSummaryText(pct) {
  if (pct >= 80) return 'Excellent work! You have a strong grasp of this topic.';
  if (pct >= 70) return 'Good job! Review a few areas to sharpen your understanding.';
  if (pct >= 60) return 'Not bad. Go through the lesson again to consolidate your knowledge.';
  if (pct >= 50) return 'You passed, but there is room to improve. Re-read the lesson carefully.';
  return 'Keep studying! Review the lesson content and try again.';
}

function showMsg(container, type, text, extraHtml = '') {
  const color = type === 'error' ? '#f87171' : '#4ade80';
  container.innerHTML = `
    <div style="text-align:center;padding:1rem">
      <p style="color:${color};margin-bottom:0.5rem">${escapeHtml(text)}</p>
      ${extraHtml}
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
