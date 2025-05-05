pipeline {
    agent any
    tools {
        nodejs 'N_NODE'
    }
    environment {
        DOCKER_IMAGE = "jyhedhr/trelix_back"
        DOCKER_TAG = "latest"
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
                sh 'sudo docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'  // Removed sudo
            }
        }
          stage('Push Docker Image') {
               steps {
        // Use the credentials stored in Jenkins
        withCredentials([string(credentialsId: 'DockerHub', variable: 'DockerHub')]) {
            // Log in to Docker Hub using the access token
            sh 'echo $DockerHub | sudo docker login -u jyhedhr --password-stdin'
            
            // Tag the image for pushing to Docker Hub
            sh "sudo docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:${DOCKER_TAG}"
            
            // Push the tagged image to Docker Hub
            sh "sudo docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
        }
    }
        }
      stage('Run Docker Container') {
            steps {
               script {
                    // Check if the container exists and remove it if it does
                    def containerExists = sh(script: "sudo docker ps -a -q -f name=trelix_back", returnStdout: true).trim()
                    if (containerExists) {
                        sh 'sudo docker stop trelix_back || true'
                        sh 'sudo docker rm trelix_back || true'
                    }
                    // Run the new container
                    sh 'sudo docker run -d -p 8089:8089 --name trelix_back ${DOCKER_IMAGE}:${DOCKER_TAG}'
                }
            }
        }

    }
}
