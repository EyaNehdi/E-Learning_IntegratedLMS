// controllers/intelligentRecommendationController.js
const Course = require("../models/course");
const Preference = require("../models/Preference");
const Module = require("../models/module");
const natural = require('natural');

// Initialiser le tokenizer et le stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Dictionnaire de termes liés pour différents domaines
const domainDictionary = {
  "frontend": [
    "react", "angular", "vue", "javascript", "html", "css", "dom", "web", "interface", 
    "responsive", "spa", "component", "jsx", "typescript", "frontend", "ui", "ux", 
    "design", "framework", "library", "client-side", "browser", "mobile", "sass", "less"
  ],
  "backend": [
    "node", "express", "django", "flask", "spring", "api", "rest", "graphql", "database", 
    "sql", "nosql", "mongodb", "postgresql", "mysql", "server", "backend", "php", "ruby", 
    "python", "java", "c#", "authentication", "authorization", "middleware"
  ],
  "mobile": [
    "android", "ios", "swift", "kotlin", "react native", "flutter", "xamarin", "mobile", 
    "app", "smartphone", "tablet", "responsive", "touch", "gesture", "native"
  ],
  "devops": [
    "docker", "kubernetes", "jenkins", "ci/cd", "pipeline", "git", "github", "gitlab", 
    "aws", "azure", "cloud", "deployment", "automation", "monitoring", "logging", 
    "infrastructure", "terraform", "ansible", "chef", "puppet"
  ],
  "data": [
    "data science", "machine learning", "deep learning", "ai", "artificial intelligence", 
    "python", "r", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn", "statistics", 
    "analytics", "big data", "hadoop", "spark", "etl", "data mining", "visualization"
  ],
  "security": [
    "cybersecurity", "encryption", "authentication", "authorization", "oauth", "jwt", 
    "https", "ssl", "tls", "firewall", "penetration testing", "vulnerability", "hacking", 
    "security", "privacy", "compliance", "audit", "risk"
  ]
};

// Fonction pour calculer la similarité entre deux textes
const calculateSimilarity = (text1, text2) => {
  // Tokenize et stem les textes
  const tokens1 = tokenizer.tokenize((text1 || "").toLowerCase()).map(token => stemmer.stem(token));
  const tokens2 = tokenizer.tokenize((text2 || "").toLowerCase()).map(token => stemmer.stem(token));
  
  // Créer des ensembles de tokens uniques
  const uniqueTokens1 = new Set(tokens1);
  const uniqueTokens2 = new Set(tokens2);
  
  // Calculer l'intersection
  const intersection = new Set([...uniqueTokens1].filter(token => uniqueTokens2.has(token)));
  
  // Calculer l'union
  const union = new Set([...uniqueTokens1, ...uniqueTokens2]);
  
  // Calculer le coefficient de Jaccard (similarité)
  return intersection.size / (union.size || 1); // Éviter la division par zéro
};

// Fonction pour déterminer les domaines d'un texte
const classifyDomains = (text) => {
  const domains = Object.keys(domainDictionary);
  const scores = {};
  
  domains.forEach(domain => {
    // Joindre tous les termes du domaine en un seul texte
    const domainText = domainDictionary[domain].join(' ');
    // Calculer la similarité
    scores[domain] = calculateSimilarity(text, domainText);
  });
  
  // Trier les domaines par score décroissant
  const sortedDomains = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0.01); // Filtrer les scores trop bas
  
  return sortedDomains;
};

// Fonction pour trouver des cours liés sémantiquement à un module
const findRelatedCourses = (moduleName, allCourses) => {
  // Classifier les domaines du module
  const moduleDomainsWithScores = classifyDomains(moduleName);
  const moduleDomains = moduleDomainsWithScores.map(([domain]) => domain);
  
  // Calculer un score pour chaque cours
  const scoredCourses = allCourses.map(course => {
    // Extraire les textes pertinents du cours
    const courseText = [
      course.title || "",
      course.description || "",
      course.categorie || ""
    ].join(" ");
    
    // Calculer la similarité directe avec le nom du module
    const directSimilarity = calculateSimilarity(moduleName, courseText);
    
    // Classifier les domaines du cours
    const courseDomains = classifyDomains(courseText).map(([domain]) => domain);
    
    // Calculer le nombre de domaines en commun
    const commonDomains = moduleDomains.filter(domain => courseDomains.includes(domain));
    const domainSimilarity = commonDomains.length / Math.max(moduleDomains.length, 1);
    
    // Score final (combinaison de similarité directe et similarité de domaine)
    const score = directSimilarity * 0.4 + domainSimilarity * 0.6;
    
    return {
      course,
      score,
      domains: courseDomains
    };
  });
  
  // Trier les cours par score décroissant
  scoredCourses.sort((a, b) => b.score - a.score);
  
  // Filtrer les cours avec un score minimum
  const relevantCourses = scoredCourses.filter(item => item.score > 0.1);
  
  return {
    courses: relevantCourses.map(item => ({
      ...item.course._doc, // Utiliser _doc pour accéder aux données brutes du document Mongoose
      aiScore: Math.round(item.score * 100) // Score en pourcentage pour l'affichage
    })),
    moduleInfo: {
      name: moduleName,
      domains: moduleDomainsWithScores.map(([domain, score]) => ({
        name: domain,
        score: Math.round(score * 100) // Score en pourcentage pour l'affichage
      }))
    }
  };
};

// Fonction pour obtenir des cours intelligemment liés au module préféré
const getIntelligentRecommendations = async (req, res) => {
  const { userId } = req.params;

  try {
    // Vérifier si l'utilisateur existe et a des préférences
    const userPreferences = await Preference.findOne({ user: userId }).populate("module");
    
    if (!userPreferences) {
      return res.status(404).json({ message: "Aucune préférence trouvée pour cet utilisateur" });
    }

    // Récupérer le module préféré de l'utilisateur
    const preferredModule = userPreferences.module;
    
    if (!preferredModule) {
      return res.status(404).json({ message: "Module préféré non trouvé" });
    }

    // Récupérer tous les cours disponibles
    const allCourses = await Course.find().populate("module");
    
    // Utiliser le service de recommandation pour trouver des cours liés au module
    const { courses, moduleInfo } = findRelatedCourses(preferredModule.name, allCourses);
    
    // Renvoyer les préférences, les cours recommandés et les informations sur le module
    res.status(200).json({
      preferences: userPreferences,
      courses: courses,
      moduleInfo: moduleInfo,
      message: "Cours recommandés par analyse intelligente basés sur votre module préféré"
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des recommandations intelligentes:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};



module.exports = { getIntelligentRecommendations };