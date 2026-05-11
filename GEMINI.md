# CIQUAL Helper - Project Context
## Overview
**CIQUAL Helper** is a **clinical decision support tool** designed for **healthcare professionals** (doctors, dietitians, nurses) to facilitate the use and consultation of the **CIQUAL table** (the French food composition database).

**Target Audience:** Strictly for medical and healthcare professionals. It is NOT intended for direct patient use or self-diagnosis.

## Core Features (Planned/Targeted)
- **Meal Composition Breakdown (Main Feature)**: Analyze a standard meal and provide the full nutritional breakdown of its components.
- **Search & Filter**: Efficiently search through 3,400+ food items.
- **Data Visualization**: Clear presentation of nutritional compositions.
- **Pathology Management (Endocrinology)**: Specialized nutritional analysis based on patient pathology (Diabetes, Thyroid, etc.).
- **Comparison Tools**: Compare nutritional values between different foods.

## Pathology Feature (Endocrinology)
### Objective
Provide a medical-grade analysis by highlighting specific nutrients that are key to the patient's nutritional recommendations. The approach focuses on **positive guidance and optimization** rather than food restrictions.

### Supported Pathologies (Initial List)
- **Diabetes (Type 1 & 2)**: Optimization of complex carbohydrates and fiber.
- **Hypothyroidism/Hyperthyroidism**: Support for iodine and selenium intake.
- **Addison's Disease**: Management of sodium and potassium balance.
- **Cushing's Syndrome**: Balance of sodium and carbohydrate intake.
- **Metabolic Syndrome**: Promotion of the Mediterranean model (unsaturated fats, fiber).

### Technical Implementation
- **Definition**: Stored in `src/data/pathologies.json` with a focus on encouraging terminology.
- **Logic**: When a pathology is selected, the `MealSummary` component highlights the recommended nutrient cards for monitoring using a distinct visual style (`.highlighted`).
- **UI**: A `PathologySelector` component allows the medical professional to set the patient's profile.

## Food Comparison Feature (Planned)
### Objective
Enable medical professionals to compare two or more food items side-by-side to help patients choose the best option according to their nutritional recommendations.

### Key Capabilities
- **Side-by-Side Comparison**: Table view comparing the full nutritional profile of selected foods.
- **Differential Highlighting**: Visually indicate which food is higher/lower in specific nutrients (e.g., "Higher in Fiber", "Lower in Sodium").
- **Pathology Integration**: Priority comparison of nutrients highlighted by the active patient profile.
- **Unit Normalization**: Automatic adjustment to compare items on a per-100g basis or custom weights.

## Smart Substitutions Feature (Planned)
### Objective
Proactively suggest healthier alternatives to a selected food item based on the patient's specific pathology and the food's nutritional category.

### Key Capabilities
- **Intelligent Discovery**: Automatically find foods within the same `subgroup` (e.g., if "Whole Milk" is selected, suggest "Skimmed Milk").
- **Goal-Based Ranking**: Rank alternatives based on the pathology's goals (e.g., if goal is `decrease sugar`, rank items with the lowest sugar first).
- **Proactive Alerts**: If a selected food significantly deviates from recommendations (e.g., high sodium for Cushing), display a "Recommended Alternative" nudge.
- **Side-by-Side Validation**: Allow the professional to quickly compare the original choice with the suggested alternative to validate the replacement.

## Tech Stack
- **Frontend**: React 19, TypeScript.
- **Data Parsing**: Node.js script for XML to JSON conversion (supporting UTF-8).
- **Styling**: Vanilla CSS.
- **Testing**: Jest and React Testing Library.

## Data Integration
- **Source**: Official CIQUAL 2025 table (ANSES).
- **Format**: XML parsed to a compact JSON (`ciqual_full.json`).
- **Update Frequency**: Manual update via `scripts/parse_ciqual.js`.

## Development Workflow
- `npm start`: Run development server.
- `npm test`: Run tests in watch mode.
- `npm run build`: Create production build.

## Key Directories
- `src/`: Application source code.
- `src/data/`: JSON food data.
- `scripts/`: Data processing scripts.
- `public/`: Static assets.
