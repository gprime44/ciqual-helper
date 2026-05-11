# CIQUAL Helper 🥗

CIQUAL Helper is a web application designed to help users analyze food composition and manage their nutritional intake using the official CIQUAL (French food composition table) database.

## 🚀 Features

- **Food Search:** Search through thousands of food items from the CIQUAL database.
- **Nutritional Analysis:** Detailed view of macro and micro-nutrients (proteins, lipids, carbohydrates, vitamins, minerals).
- **Meal Management:** Build and summarize meals to track daily intake.
- **Pathology Awareness:** Selection of specific dietary constraints based on health conditions.
- **Data Statistics:** Visual representation of nutritional data.
- **CIQUAL Parser:** Custom scripts to process and update the food database.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** CSS (Vanilla)
- **Data:** CIQUAL JSON datasets
- **Services:** Integration with translation and external nutritional APIs (Edamam).

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ciqual-helper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory (refer to `.env.example` if available) with your API keys:
   ```env
   REACT_APP_EDAMAM_APP_ID=your_id
   REACT_APP_EDAMAM_APP_KEY=your_key
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📜 Scripts

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.
- `node scripts/parse_ciqual.js`: Parses raw CIQUAL data into usable JSON format.

## 📂 Project Structure

- `src/components/`: Reusable UI components (FoodSearch, MealSummary, etc.).
- `src/data/`: JSON datasets for foods, compositions, and pathologies.
- `src/utils/`: Helper services for APIs and calculations.
- `scripts/`: Data processing utilities.

---
*Built as part of a nutritional analysis POC.*
