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
        dir('trelix_back') {
            sh '''
                echo Publishing package to Nexus...

                echo "//192.168.33.10:8081/repository/trelix/:username=admin" >> ~/.npmrc
                echo "//192.168.33.10:8081/repository/trelix/:_password=$(echo -n admin | base64)" >> ~/.npmrc
                echo "//192.168.33.10:8081/repository/trelix/:email=admin@example.org" >> ~/.npmrc
                echo "//192.168.33.10:8081/repository/trelix/:always-auth=true" >> ~/.npmrc

                npm publish --registry http://192.168.33.10:8081/repository/trelix/ --access public
            '''
        }
    }
}






    }
}
