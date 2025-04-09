// trelix_back/controllers/googleClassroom.controller.js
// Modifiez les fonctions qui utilisent req.user._id

// Par exemple, pour la fonction handleGoogleCallback :
const handleGoogleCallback = async (req, res) => {
                      try {
                        const { code } = req.query;
                        // Utilisez un ID utilisateur fixe pour les tests
                        const userId = '65f1a2b3c4d5e6f7a8b9c0d1'; // ID utilisateur fictif
                        
                        // Reste du code...
                      } catch (error) {
                        // Gestion des erreurs...
                      }
                    };
                    
                    // De même pour getAllCourses :
                    const getAllCourses = async (req, res) => {
                      try {
                        // Utilisez un ID utilisateur fixe pour les tests
                        const userId = '65f1a2b3c4d5e6f7a8b9c0d1'; // ID utilisateur fictif
                        
                        // Reste du code...
                      } catch (error) {
                        // Gestion des erreurs...
                      }
                    };