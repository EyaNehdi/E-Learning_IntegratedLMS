pipeline {
    agent any
    tools {
        nodejs 'N_NODE' 
    }
    environment {
        NEXUS_URL = 'http://192.168.33.10:8081/repository/trelix/' // Nexus repository URL
        NEXUS_CREDENTIALS = 'nexus-credentials-id' // Nexus credentials ID in Jenkins
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

        stage('Publish to Nexus') {
            steps {
                script {
                    // Publish the package to Nexus
                    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}", usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
                        dir('trelix_back') {
                            // List files to ensure we're in the correct directory and it has package.json
                            sh "ls -l"
                            
                            // Publish the package to Nexus without username and password in the command
                            sh """
                                echo Publishing package to Nexus...
                                npm publish --registry ${NEXUS_URL} --access public
                            """
                        }
                    }
                }
            }
        }
    }
}
