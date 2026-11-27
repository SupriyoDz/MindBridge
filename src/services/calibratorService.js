// Bloom's Taxonomy Calibrator Service
import { BLOOM_LEVELS, DIFFICULTY_PROFILES } from '../config.js';

/**
 * Normalizes any variation of Bloom's level string into standard level
 */
export function normalizeBloomLevel(level) {
  if (!level) return 'Understand';
  const clean = String(level).trim().toLowerCase();
  for (const bl of BLOOM_LEVELS) {
    if (bl.toLowerCase() === clean) return bl;
  }
  // Fallbacks
  if (clean.includes('remember') || clean.includes('recall')) return 'Remember';
  if (clean.includes('understand') || clean.includes('comprehend')) return 'Understand';
  if (clean.includes('apply') || clean.includes('application')) return 'Apply';
  if (clean.includes('analyze') || clean.includes('analysis')) return 'Analyze';
  if (clean.includes('evaluat') || clean.includes('critique')) return 'Evaluate';
  if (clean.includes('creat') || clean.includes('synthes')) return 'Create';
  return 'Understand';
}

/**
 * Computes the empirical distribution of Bloom's levels across all items or a specific artifact
 */
export function computeBloomDistribution(items = []) {
  const counts = {
    Remember: 0,
    Understand: 0,
    Apply: 0,
    Analyze: 0,
    Evaluate: 0,
    Create: 0
  };

  if (!items || items.length === 0) {
    return { counts, percentages: { ...counts }, total: 0 };
  }

  let total = 0;
  items.forEach((item) => {
    const rawLevel = item.bloom_level || item.bloomLevel;
    if (rawLevel) {
      const level = normalizeBloomLevel(rawLevel);
      counts[level] = (counts[level] || 0) + 1;
      total++;
    }
  });

  const percentages = {};
  BLOOM_LEVELS.forEach((level) => {
    percentages[level] = total > 0 ? Math.round((counts[level] / total) * 100) : 0;
  });

  return { counts, percentages, total };
}

/**
 * Compares actual distribution with target profile.
 * Computes maximum drift and determines pass/warn badge.
 */
export function analyzeBloomAlignment(actualPercentages, difficulty) {
  const targetProfile = DIFFICULTY_PROFILES[difficulty] || DIFFICULTY_PROFILES.Introductory;
  const targets = targetProfile.targets;

  let maxDrift = 0;
  let driftedLevels = [];
  const comparisons = [];

  BLOOM_LEVELS.forEach((level) => {
    const actual = actualPercentages[level] || 0;
    const target = targets[level] || 0;
    const diff = actual - target;
    const absDiff = Math.abs(diff);

    if (absDiff > maxDrift) {
      maxDrift = absDiff;
    }

    if (absDiff > 15) {
      driftedLevels.push({
        level,
        actual,
        target,
        diff: diff > 0 ? `+${diff}%` : `${diff}%`
      });
    }

    comparisons.push({
      level,
      actual,
      target,
      diff
    });
  });

  // Calculate overall alignment score (0 - 100)
  // Total absolute error across 6 levels divided by 200 (max possible drift)
  const totalAbsDiff = comparisons.reduce((sum, c) => sum + Math.abs(c.diff), 0);
  const alignmentScore = Math.max(0, Math.round(100 - totalAbsDiff / 2));

  const isCalibrated = maxDrift <= 15;

  return {
    isCalibrated,
    status: isCalibrated ? 'PASS' : 'WARN',
    maxDrift,
    driftedLevels,
    alignmentScore,
    comparisons,
    targetProfile
  };
}

/**
 * Aggregates all Bloom-tagged items across all 4 artifacts and Content Map
 */
export function extractAllBloomItems({ contentMap, lessonPlan, rubric, flashcards, quizBank }) {
  const items = [];

  // Content Map objectives
  if (contentMap?.learning_objectives) {
    contentMap.learning_objectives.forEach((lo) => {
      items.push({
        artifact: 'Content Map',
        id: lo.id,
        bloom_level: lo.bloom_level,
        title: lo.description
      });
    });
  }

  // Flashcards
  if (flashcards?.cards) {
    flashcards.cards.forEach((card) => {
      items.push({
        artifact: 'Flashcards',
        id: card.id,
        bloom_level: card.bloom_level,
        title: card.front
      });
    });
  }

  // Quiz Bank
  if (quizBank?.items) {
    quizBank.items.forEach((item) => {
      items.push({
        artifact: 'Quiz Bank',
        id: item.id,
        bloom_level: item.bloom_level,
        title: item.question
      });
    });
  }

  // Lesson Plan Objectives
  if (lessonPlan?.objectives) {
    lessonPlan.objectives.forEach((obj) => {
      items.push({
        artifact: 'Lesson Plan',
        id: obj.id,
        bloom_level: obj.bloom_level,
        title: obj.description
      });
    });
  }

  return items;
}
