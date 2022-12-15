# teslaassessment

This repository holds the code of the Assessment I have been assigned for Tesla. 

Instructions to run: 

npm install // This will install all the required dependencies as specified in the package.json file. 
node app.js // This will start the express server locally and exposes the end points. 

Instructions to deploy into AWS Lambda:

serverless deploy // This will deploy the app into the AWS Lambda as specified in the serverless.yml file. 

NOTE: The application depends on dotenv package to access the AWS credentials from a environment file. Please enter your AWS credentials in the .env file. 
