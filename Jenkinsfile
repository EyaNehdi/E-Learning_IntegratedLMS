
pipeline {
  
    agent any
      tools {
         nodejs 'N_NODE' 
    }

    stages {
        stage('Hello Test') {
            steps {
                echo 'Hi Jihed'
            }
        }

         stage('Git Checkout') {
            steps {
                git branch: 'Devops',
                    url: 'https://github.com/EyaNehdi/E-Learning_IntegratedLMS.git',
                    credentialsId: 'PI'
            }
        }
         stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

   
      

     

     
        
    }
}
