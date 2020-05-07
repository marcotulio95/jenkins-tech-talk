currentBuild.result = 'SUCCESS';
pipeline{
	
	agent any
    
	tools {
        maven 'Maven 3.3.9'
        jdk 'jdk8'
    }

	 runTests = true;
	 isMaster = false;
     isRelease = false;
     isFeature = false;
    
    try
    {
		 workspace = env.WORKSPACE;
		 jenkins_home = env.JENKINS_HOME;
    	 branchName = env.BRANCH_NAME;
	    isMaster = branchName.toString() == "master";
	     isDevelop = branchName.toString() == "develop";
	    isRelease = isReleaseBranch();
	    isFeature = !(isMaster || isRelease || isDevelop);
	     jobName = env.JOB_NAME;
	     buildNumber = env.BUILD_NUMBER;

	    properties([buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '10', daysToKeepStr: '', numToKeepStr: '')), disableConcurrentBuilds(), pipelineTriggers([cron('H H(0-0) * * *')])])

		echo("Branch: $branchName; master: $isMaster release: $isRelease develop: $isDevelop")
    	setBuildName()
    	sendMessageViaSlack("Build Started - ${env.JOB_NAME}  (<${env.BUILD_URL}|Open>)")

		stage('Checkout & CleanUp'){
			deleteDir()
			checkoutFomGit()
		}
		
		stage('Build'){
				sh "mvn -B -DskipTests clean package"
		}
	
		stage('Archive Artifacts'){
			archiveArtifacts '*.jar'
		}

		stage('Test & Publish junit'){
				steps {
                	sh 'mvn test'
				}
				post {
					always {
						junit 'target/surefire-reports/*.xml'
					}
				}
		}
		

    }catch(Exception e)
    {
        //todo handle script returned exit code 143
        currentBuild.result = 'FAILURE'
        throw e;
    }finally
    {
    	cleanWs()
    	sendMessageViaSlack("Build Finish - ${env.JOB_NAME} with status: ${currentBuild.result} (<${env.BUILD_URL}|Open>)")
    }
}

//Myfunctions

 sendMessageViaSlack(message){

	 channel = "teste-techtalk"

	slackSend channel: "$channel", message: "$message", tokenCredentialId: 'AtZTUdI8yhYkGr1LNcMbChWe'
}

 checkoutFomGit(){
		checkout scm
}

 getRepository(gitUrl, folderTarget){
	checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: "$folderTarget"]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'b0864a31-0a3a-48fd-be36-8f15e5d0665a', url: "$gitUrl" ]]])
}


 getRepository(gitUrl, folderTarget, branch){
    checkout([$class: 'GitSCM', branches: [[name: "*/$branch"]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: "$folderTarget"]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'b0864a31-0a3a-48fd-be36-8f15e5d0665a', url: "$gitUrl" ]]])
}

boolean isReleaseBranch()
{
     branchName = env.BRANCH_NAME
    // release branches named major.minor(.bugfix)_releaseName; note: env.BRANCH_NAME is available in multi-branch-pipeline projects
    // Gitflow forces us to use prefix "release/"
    branchName != null && branchName.matches("(release/)?\\d+\\.\\d+(\\.\\d+)?_.*");
}

 setBuildName(){
	 jobName = env.JOB_NAME
	 buildNumber = currentBuild.number
	currentBuild.displayName = "$jobName"+"#"+"$buildNumber"
}