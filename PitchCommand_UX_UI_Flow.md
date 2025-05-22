# PitchCommand – UX/UI Flow Document (MVP)

---

## 🎯 Goal
To design an intuitive, fast, mobile-friendly user experience for real-time pitch logging, prediction feedback, and multi-pitcher tracking during live baseball games.

---

## 👤 User Role
- **Primary User:** Coach, analyst, or scout manually logging pitches and tracking sequences during a game
- **Environment:** Mobile phone or tablet at field level

---

## 📱 Key Screens and UI Elements

### 1. Pitcher Selection Screen
**Purpose:** Select or create pitcher profile for logging
- List of saved pitchers (name, team, number)
- “New Pitcher” button → input form: name, team, number, age, L/R
- “Start Logging” button to enter active session

### 2. Pitch Logging Screen (Core Screen)
**Purpose:** Manually input pitch details in real time
- **Input Elements:**
  - Count selector (e.g., 0-0, 1-2)
  - Pitch type buttons (FB, SL, CH, etc.)
  - Optional location selector (grid or dropdown)
  - Result selector (strike, ball, foul, hit)
- **Submit Button:** “Log Pitch”
- **Keyboard shortcuts or fast-tap UI** for mobile use

### 3. Prediction Display Section (Inline or Next Screen)
**Purpose:** Show predicted next pitch before user logs next pitch
- Top 1–3 predicted pitches with confidence %
- “Actual pitch was...” section after user logs actual pitch
- Feedback color (green if correct, red if not)

### 4. Pitcher Switch Menu
**Purpose:** Seamlessly swap between pitchers mid-game
- Accessible via top nav dropdown or side panel
- Must persist data for each pitcher’s current session

### 5. Session Summary Screen (Optional for MVP)
**Purpose:** End-of-game summary
- Charts: pitch distribution, prediction accuracy
- Download or export option

---

## 🔄 Primary User Flow
1. User launches app
2. Selects pitcher or creates new profile
3. Enters pitch logging screen
4. Logs pitch → receives prediction for next pitch
5. Logs actual pitch → model updates + feedback shown
6. Repeat until pitcher switches or game ends
7. (Optional) View session summary or export data

---

## 🔄 Edge Flows
| Scenario | Flow |
|----------|------|
| No pitcher selected | Prompt to create/select pitcher before logging |
| Switch pitcher mid-game | Save current pitcher’s session → load new pitcher |
| Undo mistake | “Undo last pitch” option on pitch log screen |
| No predictions available | Show “No data yet – predictions will appear soon” |

---

## 🧩 Mobile UX Considerations
- Button-based pitch logging (not dropdown-heavy)
- Minimal screen taps to log pitch and view prediction
- Color-coded elements for fast visual feedback
- Sticky header for count + pitcher info

---

## Future Enhancements
- Full timeline scroll of pitch events
- Live session comparison across pitchers
- Tablet dashboard mode for multi-pitcher monitoring
- Voice-to-input logging (experimental)

---

## Notes
- UX must support rapid decision-making and ease of use in loud, fast-paced game environments
- Use clear, baseball-native terms and keep interactions under 3 taps per pitch