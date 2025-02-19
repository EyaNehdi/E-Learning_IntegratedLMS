const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'), false);
    }
    cb(null, true);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const handleFileUpload = (req, res, next) => {
  upload.single('cvFile')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('⚠️ Multer Error:', err.message);
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      console.error('❌ Unknown Upload Error:', err);
      return res.status(400).json({ error: `Unknown Upload Error: ${err.message}` });
    }

    if (!req.file) {
      console.error('⚠️ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.error('⚠️ Unsupported file type:', req.file.mimetype);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    console.log('✅ File received:', {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    next();
  });
};

const extractText = async (file) => {
    try {
      let text;
      if (file.mimetype === 'application/pdf') {
        const data = await pdf(file.buffer);
        text = data.text;
      } else {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      }
  
      if (!text || text.trim() === '') {
        throw new Error('No text could be extracted from the file.');
      }
  
      // Format the text for better readability
      text = text
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/(\.\s+)/g, '.\n')  // Add a new line after periods
        .replace(/(\|)/g, ' | ')      // Add space around the pipe symbol
        .trim();
  
      return text;
  
    } catch (err) {
      console.error(`Error parsing ${file.mimetype}:`, err);
      throw new Error('Failed to extract text from file');
    }
  };

  const analyzeCV = async (req, res) => {
    try {
        const { file } = req;

        if (!file?.buffer || file.buffer.length === 0) {
            return res.status(400).json({ error: 'Empty file content' });
        }

        const cvText = await extractText(file);
        console.log('Extracted text:', cvText);

        // Use the extractCVInformation function
        const cvData = extractCVInformation(cvText);
        console.log('Structured CV Data:', cvData);

        // Sending structured input to the AI model (optional)
        const response = await axios.post('http://127.0.0.1:8000/analyze', {
            cvText: cvText,
            metadata: {
                fileName: file.originalname,
                fileSize: file.size,
                fileType: file.mimetype,
            },
        }, { timeout: 30000 });

        // Check if response contains entities
        if (!response.data || !Array.isArray(response.data.entities)) {
            return res.status(500).json({ error: 'Invalid response from AI model' });
        }

        res.json({
            success: true,
            entities: response.data.entities,
            cvData,
            warnings: {
                experience: cvData.experience.length === 0 ? "No experience found." : undefined,
                education: cvData.education.length === 0 ? "No education found." : undefined,
                skills: cvData.skills.length === 0 ? "No skills found." : undefined,
                certifications: cvData.certifications.length === 0 ? "No certifications found." : undefined,
            },
        });
        

    } catch (error) {
        console.error('Processing Error:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.error || 'Processing failed';
        res.status(status).json({
            error: message,
            details: error.message,
        });
    }
};
function extractExperienceDetails(experienceText) {
    return experienceText.split('\n').filter(Boolean).map(entry => {
        const parts = entry.split('|');
        return {
            jobTitle: parts[0]?.trim() || '',
            company: parts[1]?.trim() || '',
            dates: parts[2]?.trim() || '',
            description: parts[3]?.trim() || ''
        };
    }).filter(Boolean);
}

function extractEducationDetails(educationText) {
    return educationText.split('\n').filter(Boolean).map(entry => {
        return { degree: entry.trim() }; // Modify based on actual content
    }).filter(Boolean);
}

function extractSkillsDetails(skillsText) {
    return skillsText.split('\n').filter(Boolean).map(skill => skill.trim()).filter(Boolean);
}

function extractCertificationsDetails(certificationsText) {
    return certificationsText.split('\n').filter(Boolean).map(certification => certification.trim()).filter(Boolean);
}




  function extractCVInformation(cvText) {
    const cvData = {
        personalInfo: {},
        objective: "",
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
    };

    // Example regex patterns to match sections
    const experiencePattern = /E X P E R I E N C E\s*([\s\S]*?)(?=E D U C A T I O N|S K I L L  H I G H L I G H T S|C E R T I F I C A T I O N S|L A N G U A G E|$)/i;
    const educationPattern = /E D U C A T I O N\s*([\s\S]*?)(?=S K I L L  H I G H L I G H T S|C E R T I F I C A T I O N S|$)/i;
    const skillsPattern = /S K I L L  H I G H L I G H T S\s*([\s\S]*?)(?=C E R T I F I C A T I O N S|$)/i;
    const certificationsPattern = /C E R T I F I C A T I O N S\s*([\s\S]*?)(?=$)/i;
    

    const cleanedText = cvText.replace(/\s+/g, ' ').trim();

    // Extracting experiences
    const experienceMatch = cleanedText.match(experiencePattern);
if (experienceMatch) {
    cvData.experience = extractExperienceDetails(experienceMatch[1].trim());
}

const educationMatch = cleanedText.match(educationPattern);
if (educationMatch) {
    cvData.education = extractEducationDetails(educationMatch[1].trim());
}

const skillsMatch = cleanedText.match(skillsPattern);
if (skillsMatch) {
    cvData.skills = extractSkillsDetails(skillsMatch[1].trim());
}

const certificationsMatch = cleanedText.match(certificationsPattern);
if (certificationsMatch) {
    cvData.certifications = extractCertificationsDetails(certificationsMatch[1].trim());
}


    return cvData;
}
function normalizeExtractedText(text) {
    return text
        .replace(/ +/g, ' ') // Replace multiple spaces with a single space
        .replace(/\s*\n\s*/g, '\n') // Remove empty lines
        .replace(/(\s*E X P E R I E N C E\s*|\s*E D U C A T I O N\s*|\s*S K I L L  H I G H L I G H T S\s*|\s*C E R T I F I C A T I O N S\s*|\s*L A N G U A G E\s*|\s*Profile\s*|\s*CONTACT\s*)/g, '\n$1\n') // Insert new lines before section headings
        .trim();
}



module.exports = {
  handleFileUpload,
  analyzeCV,
};
