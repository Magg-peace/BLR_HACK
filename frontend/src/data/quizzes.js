// Quiz bank — multiple difficulty levels, persona-aware
// Types: 'mcq' (multiple choice) and 'hotspot' (pick the right structure on an image)

export const QUIZZES = [
  {
    id: "heart-basics",
    title: "Heart Basics",
    difficulty: "easy",
    organ: "heart",
    questions: [
      {
        type: "mcq",
        q: "Which chamber pumps blood to the entire body?",
        options: ["Right atrium", "Right ventricle", "Left atrium", "Left ventricle"],
        a: 3,
        explain: "The left ventricle generates systemic arterial pressure during systole.",
      },
      {
        type: "mcq",
        q: "Which valve sits between the left atrium and left ventricle?",
        options: ["Tricuspid", "Pulmonary", "Mitral", "Aortic"],
        a: 2,
        explain: "The mitral (bicuspid) valve prevents backflow into the LA during systole.",
      },
      {
        type: "mcq",
        q: "The heart's natural pacemaker is the…",
        options: ["AV node", "Bundle of His", "SA node", "Purkinje fibers"],
        a: 2,
        explain: "The SA node in the right atrium fires at 60–100 bpm intrinsically.",
      },
      {
        type: "mcq",
        q: "Blood from the lungs returns to the heart via the…",
        options: ["Pulmonary arteries", "Pulmonary veins", "Vena cava", "Aorta"],
        a: 1,
        explain: "Four pulmonary veins drain oxygenated blood into the left atrium.",
      },
      {
        type: "mcq",
        q: "Which artery supplies the anterior wall of the LV?",
        options: ["RCA", "LCx", "LAD", "PDA"],
        a: 2,
        explain: "The left anterior descending (LAD) supplies the anterior LV wall and septum.",
      },
    ],
  },
  {
    id: "brain-basics",
    title: "Brain Basics",
    difficulty: "easy",
    organ: "brain",
    questions: [
      {
        type: "mcq",
        q: "Which lobe processes vision?",
        options: ["Frontal", "Parietal", "Temporal", "Occipital"],
        a: 3,
        explain: "Primary visual cortex (V1) lies along the calcarine sulcus in the occipital lobe.",
      },
      {
        type: "mcq",
        q: "Memory consolidation primarily relies on the…",
        options: ["Amygdala", "Hippocampus", "Thalamus", "Cerebellum"],
        a: 1,
        explain: "Hippocampus is essential for encoding new declarative memories.",
      },
      {
        type: "mcq",
        q: "Broca's area, important for speech production, is located in the…",
        options: ["Dominant temporal lobe", "Dominant frontal lobe", "Cerebellum", "Brainstem"],
        a: 1,
        explain: "Brodmann areas 44/45 in the inferior frontal gyrus (usually left).",
      },
      {
        type: "mcq",
        q: "Which structure relays nearly all sensory information to the cortex?",
        options: ["Amygdala", "Hypothalamus", "Thalamus", "Pons"],
        a: 2,
        explain: "Thalamus is the central sensory relay (olfaction is the exception).",
      },
      {
        type: "mcq",
        q: "Coordination and balance are primarily controlled by the…",
        options: ["Cerebellum", "Hippocampus", "Frontal lobe", "Medulla"],
        a: 0,
        explain: "The cerebellum fine-tunes motor output via deep cerebellar nuclei.",
      },
    ],
  },
  {
    id: "clinical-cardio",
    title: "Clinical Cardiology",
    difficulty: "hard",
    organ: "heart",
    questions: [
      {
        type: "mcq",
        q: "Door-to-balloon target for STEMI primary PCI is…",
        options: ["≤30 min", "≤60 min", "≤90 min", "≤120 min"],
        a: 2,
        explain: "Guideline-recommended D2B ≤90 min minimizes infarct size.",
      },
      {
        type: "mcq",
        q: "Severe symptomatic aortic stenosis with mean gradient >40 mmHg is best managed with…",
        options: ["Diuretics alone", "Watchful waiting", "Aortic valve replacement", "Statin therapy"],
        a: 2,
        explain: "Class I indication for SAVR or TAVR depending on STS risk.",
      },
      {
        type: "mcq",
        q: "First-line foundational therapy in HFrEF includes all EXCEPT…",
        options: ["Beta blocker", "ARNI", "SGLT2 inhibitor", "Calcium channel blocker"],
        a: 3,
        explain: "Non-dihydropyridine CCBs are contraindicated in HFrEF.",
      },
      {
        type: "mcq",
        q: "In atrial fibrillation, the dominant source of cardioembolic stroke is the…",
        options: ["Mitral valve", "Left atrial appendage", "Pulmonary vein", "Right atrium"],
        a: 1,
        explain: "Over 90% of AF-related thrombi form in the LAA.",
      },
      {
        type: "mcq",
        q: "Wallenberg (lateral medullary) syndrome is most often caused by occlusion of the…",
        options: ["MCA", "PCA", "PICA", "ACA"],
        a: 2,
        explain: "PICA occlusion → lateral medullary infarct.",
      },
    ],
  },
];

export const findQuiz = (id) => QUIZZES.find((q) => q.id === id);
