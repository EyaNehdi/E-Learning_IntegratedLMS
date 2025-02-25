
pipeline {
    agent any
   

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

   
      

     

     
        }
    }
}
