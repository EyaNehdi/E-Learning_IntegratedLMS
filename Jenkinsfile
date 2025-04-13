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
                dir('trelix_back') { 
                    sh 'npm install'
                }
            }
        }

        stage('Build Application') {
            steps {
                dir('trelix_back') {  
                    sh 'npm run build'  
                }
            }
        }
        stage('Test Project') {
            steps {
                dir('trelix_back') { 
                sh 'npm test'
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                dir('trelix_back') {  
                    sh 'sonar-scanner'  
                }
            }
        }

        
    }
}
