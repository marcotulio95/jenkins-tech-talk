def runTests = true;
currentBuild.result = 'SUCCESS';


node('master') {
	
	def isMaster = false;
    def isRelease = false;
    def isFeature = false;
    
    try
    {
		def workspace = env.WORKSPACE;
		def jenkins_home = env.JENKINS_HOME;
    	def branchName = env.BRANCH_NAME;
	    isMaster = branchName.toString() == "master";
	    def isDevelop = branchName.toString() == "develop";
	    isRelease = isReleaseBranch();
	    isFeature = !(isMaster || isRelease || isDevelop);
	    def jobName = env.JOB_NAME;
	    def buildNumber = env.BUILD_NUMBER;

	    properties([buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '10', daysToKeepStr: '', numToKeepStr: '')), disableConcurrentBuilds(), pipelineTriggers([cron('H H(0-0) * * *')])])

		echo("Branch: $branchName; master: $isMaster release: $isRelease develop: $isDevelop")
    	setBuildName()
    	sendMessageViaSlack("Build Started - ${env.JOB_NAME}  (<${env.BUILD_URL}|Open>)")

		stage('Checkout & CleanUp'){
			deleteDir()
			checkoutFomGit()
		}
		
		stage('Build'){
			withMaven( maven: 'mvn' ){
				sh "mvn -B -DskipTests clean package"
			}
		}
	
		stage('Archive Artifacts'){
			//archiveArtifacts '*.jar'
		}

		stage('Test & Publish junit'){
			def logPath = "target/surefire-reports/*xml"
			
			withMaven(options: [junitPublisher(disabled: false)], maven: 'mvn' ){
				sh "mvn test"
			}
			
			def existsTeste = fileExists "${logPath}"	

			if(existsTeste) {
				step([$class: 'JUnitResultArchiver', testResults: logPath])
			}else{
				echo 'No tests found !'
			}
		}
    }catch(Exception e)
    {
        //todo handle script returned exit code 143
        currentBuild.result = 'FAILURE'
        throw e;
    }finally
    {
    	//cleanWs()
    	sendMessageViaSlack("Build Finish - ${env.JOB_NAME} with status: ${currentBuild.result} (<${env.BUILD_URL}|Open>)")
    }
}

//Myfunctions

def sendMessageViaSlack(message){

	def channel = "teste-techtalk"

	slackSend channel: "$channel", message: "$message", tokenCredentialId: 'AtZTUdI8yhYkGr1LNcMbChWe'
}

def checkoutFomGit(){
		checkout scm
}

def getRepository(gitUrl, folderTarget){
	checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: "$folderTarget"]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'b0864a31-0a3a-48fd-be36-8f15e5d0665a', url: "$gitUrl" ]]])
}


def getRepository(gitUrl, folderTarget, branch){
    checkout([$class: 'GitSCM', branches: [[name: "*/$branch"]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: "$folderTarget"]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'b0864a31-0a3a-48fd-be36-8f15e5d0665a', url: "$gitUrl" ]]])
}

boolean isReleaseBranch()
{
    def branchName = env.BRANCH_NAME
    // release branches named major.minor(.bugfix)_releaseName; note: env.BRANCH_NAME is available in multi-branch-pipeline projects
    // Gitflow forces us to use prefix "release/"
    branchName != null && branchName.matches("(release/)?\\d+\\.\\d+(\\.\\d+)?_.*");
}

def setBuildName(){
	def jobName = env.JOB_NAME
	def buildNumber = currentBuild.number
	currentBuild.displayName = "$jobName"+"#"+"$buildNumber"
}