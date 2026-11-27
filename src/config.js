// Bloom's Taxonomy configuration and Target Difficulty Profiles

export const BLOOM_LEVELS = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create'
];

export const BLOOM_COLORS = {
  Remember: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', fill: '#3b82f6' },
  Understand: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', fill: '#14b8a6' },
  Apply: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', fill: '#10b981' },
  Analyze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', fill: '#f59e0b' },
  Evaluate: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', fill: '#f97316' },
  Create: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', fill: '#a855f7' }
};

export const DIFFICULTY_PROFILES = {
  Introductory: {
    description: 'Foundational concepts, direct definitions, worked examples, and step-by-step scaffolding using plain language.',
    targets: {
      Remember: 35,
      Understand: 35,
      Apply: 30,
      Analyze: 0,
      Evaluate: 0,
      Create: 0
    },
    pedagogy: 'High scaffolding, clear vocabulary definitions, guided step-by-step walk-throughs, low cognitive load, concrete real-world analogies.'
  },
  Intermediate: {
    description: 'Core application, comparison, structural analysis, mixed real-world scenarios, and transfer problems across concepts.',
    targets: {
      Remember: 10,
      Understand: 15,
      Apply: 45,
      Analyze: 30,
      Evaluate: 0,
      Create: 0
    },
    pedagogy: 'Medium scaffolding, diagnostic problem solving, comparing trade-offs, transfer tasks, applying formulas and principles to unpracticed cases.'
  },
  Advanced: {
    description: 'Higher-order synthesis, rigorous critical evaluation, architectural edge cases, ambiguous multi-variable trade-offs, and open-ended design.',
    targets: {
      Remember: 0,
      Understand: 5,
      Apply: 15,
      Analyze: 35,
      Evaluate: 25,
      Create: 20
    },
    pedagogy: 'Minimal scaffolding, adversarial scenarios, failure modes, design critique, synthesis under strict constraints, edge-case analysis.'
  }
};

export const SAMPLE_DOCUMENTS = {
  messyLectureNotes: {
    title: "Messy Lecture Notes: Distributed Consensus (Raft vs Paxos)",
    type: "lecture_notes",
    text: `# CS 452 Distributed Systems - Week 6 Notes (Rough Draft)
Instructor: Dr. Martinez | Topic: Consensus, Leader Election & Log Replication

## 1. Intro & The Core Problem
- Distributed systems fail! Nodes crash, networks partition (split-brain danger!).
- Need nodes to agree on a state machine log even if some fail.
- FLP Impossibility Theorem (Fischer, Lynch, Paterson 1985): Async network with even 1 crash failure -> no deterministic consensus guaranteed. So we use partially synchronous models with timeouts/randomization.

## 2. Paxos vs Raft (Why Raft exists)
- Paxos (Leslie Lamport): Mathematically elegant, notoriously hard to understand and implement in real software. Multi-Paxos has messy corner cases for view changes.
- Raft (Ongaro & Ousterhout 2014, Stanford): Designed specifically for "understandability".
- Key Raft idea: Decompose problem into 3 separate subproblems:
  1) Leader Election
  2) Log Replication
  3) Safety invariants

## 3. Raft Leader Election Details
- 3 States: Follower, Candidate, Leader.
- Term numbers act as logical clocks (monotonically increasing integer).
- Election Timeout: Followers wait between 150ms-300ms (randomized!) without heartbeat before becoming Candidate.
- Why randomized? To prevent "split vote" live-lock where two candidates tie indefinitely.
- Candidate increments currentTerm, votes for itself, sends RequestVote RPCs to all peers.
- Quorum rule: Majority (e.g. 3 of 5, or floor(N/2)+1).
- Leader sends periodic AppendEntries heartbeats (every ~50ms) to assert dominance.

## 4. Log Replication & Commit Index
- Client sends command to Leader -> Leader appends entry to its local log.
- Leader sends AppendEntries RPC to followers with entry.
- When entry is safely replicated on a majority of nodes, Leader marks it "committed" (updates commitIndex) and applies it to state machine. Leader replies to client.
- Followers update their commitIndex in subsequent heartbeats.

## 5. Network Partitions & Split-Brain Mitigation
- Example: 5 nodes (A, B, C, D, E). Partition splits {A, B} from {C, D, E}.
- Old leader A is in {A, B}. Can A commit new writes? NO! It only has 2/5 nodes, cannot form a majority quorum. Writes stall on partition {A, B}.
- Partition {C, D, E} elects new leader (say C) because 3 nodes can form majority. C commits writes.
- When partition heals: Node A sees higher term from C, steps down immediately to Follower.
- Log matching property: Leader forces followers to overwrite any uncommitted conflicting logs. Uncommitted logs on A and B get discarded.`
  },
  shortSyllabus: {
    title: "Course Syllabus: CS 210 Data Structures & Algorithms",
    type: "syllabus",
    text: `# Department of Computer Science
## CS 210: Data Structures and Algorithms (Fall Semester)
Credits: 4.0 | Prerequisites: CS 101 Introduction to Object-Oriented Programming

### Course Description
An in-depth study of abstract data types, fundamental data structures, algorithm design paradigms, and asymptotic computational complexity analysis. Students will implement core structures and analyze performance trade-offs in real-world systems.

### Primary Course Learning Objectives (CLOs)
1. Analyze worst-case, average-case, and amortized time/space complexity using Big-O, Big-Omega, and Big-Theta notation.
2. Implement and evaluate fundamental linear data structures: dynamic arrays, singly and doubly linked lists, stacks, and ring-buffer queues.
3. Design and balance non-linear tree structures: Binary Search Trees (BST), AVL self-balancing trees, and binary heaps for priority queues.
4. Compare collision-resolution strategies in Hash Tables (separate chaining vs open addressing with linear/quadratic probing and double hashing).
5. Formulate graph algorithms for pathfinding, connectivity, and traversal (Breadth-First Search, Depth-First Search, Dijkstra's Single-Source Shortest Path, Prim/Kruskal Minimum Spanning Trees).
6. Implement divide-and-conquer algorithms (MergeSort, QuickSort with randomized pivot selection) and evaluate their operational bounds.

### Weekly Modular Breakdown
- Week 1-2: Asymptotic Analysis, Recurrence Relations, and Master Theorem
- Week 3-4: Linear Structures, Array resizing mechanics, Amortized analysis
- Week 5-6: Binary Search Trees, Tree rotations, AVL balance factors
- Week 7-8: Priority Queues, Binary Heaps, and HeapSort
- Week 9-10: Hash Functions, Load factor, Chaining vs Probing trade-offs
- Week 11-12: Graph Representations (Adjacency Matrix vs List), BFS/DFS, Topological Sort
- Week 13-14: Shortest Paths (Dijkstra) and Greedy Algorithms
- Week 15: Review and Capstone Assessment

### Evaluation & Grading Breakdown
- Programming Assignments (4 projects): 35%
- Bi-weekly Quizzes: 15%
- Midterm Examination: 20%
- Final Comprehensive Examination: 25%
- Class Participation & Lab Exercises: 5%`
  }
};
