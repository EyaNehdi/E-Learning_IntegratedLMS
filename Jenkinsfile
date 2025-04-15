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
        }/*
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('trelix_back') {
                        script {
                            def scannerHome = tool 'DefaultScanner'
                            sh "${scannerHome}/bin/sonar-scanner"
                        }
                    }
                }
            }
        }
*/
        stage('Publish to Nexus') {
            steps {
                dir('trelix_back') {
                    script {
                        // Publish to Nexus
                        sh 'npm publish --registry http://192.168.33.10:8081/repository/trelix/'
                    }
                }
            }
        }
         stage('Build Docker Image') {
            steps {
                
                sh 'sudo docker-compose build '  
               
            }
        }
        

    }
}
