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
            withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}", usernameVariable: 'NEXUS_USERNAME', passwordVariable: 'NEXUS_PASSWORD')]) {
                dir('trelix_back') {
                    sh '''
                        echo Publishing package to Nexus...
                        AUTH_STRING=$(echo -n "$NEXUS_USERNAME:$NEXUS_PASSWORD" | base64)
                        echo "//192.168.33.10:8081/repository/trelix/:_auth=$AUTH_STRING" >> ~/.npmrc
                        echo "//192.168.33.10:8081/repository/trelix/:email=admin@example.org" >> ~/.npmrc

                        npm publish --registry http://192.168.33.10:8081/repository/trelix/ --access public
                    '''
                }
            }
        }
    }
}
    }
}
