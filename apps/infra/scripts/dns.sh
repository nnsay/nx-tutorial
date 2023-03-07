#! /bin/bash

envName=$ENV_NAME
if [[ -z $envName ]]; then
  echo "111${stackName}"
  echo "MUST SET THE `ENV_NAME`( sandbox' | 'dev' | 'staging' | 'production)'"
  exit 1
fi
echo "enter the dns.sh:"
echo "get the stack name: $envName"
stackId=$(aws cloudformation describe-stacks | jq -r ".Stacks|.[]|{StackName, StackId}|select(.StackName==\"$envName\")|.StackId")
echo "get the website stack id: $stackId"
cloudfrontDomain=$(aws cloudformation list-exports | jq -r ".Exports|.[]|(select(.ExportingStackId==\"$stackId\"))|select(.Name==\"distributionDomainName\")|.Value")
echo "get the cloudfront distribution domain: $cloudfrontDomain"

if [[ -z $1 ]]; then
  echo "action: deploy"
  cdk deploy --app 'ts-node apps/infra/src/main.ts' DNSStack --parameters distributionDomainName=$cloudfrontDomain --require-approval never --profile=root
else
  echo "action: destroy"
  cdk destroy --app 'ts-node apps/infra/src/main.ts' DNSStack --parameters distributionDomainName=$cloudfrontDomain --require-approval never --profile=root
fi
echo "deploy done"


