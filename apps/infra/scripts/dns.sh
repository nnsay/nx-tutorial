#! /bin/bash


echo "enter the dns.sh:"

if [[ -z $1 ]]; then
  envName=$ENV_NAME
  domain=$DOMAIN
  if [[ -z $envName ]]; then
    echo "MUST SET THE `ENV_NAME`, eg: 'sandbox' | 'dev' | 'staging' | 'prod'"
    exit 1
  fi
  if [[ -z $domain ]]; then
    echo "MUST SET THE `DOMAIN`, eg: 'visualdynamics' | 'solarsketch'"
    exit 1
  fi
  stackName="${envName}-${domain}"
  echo "get the websiste stack name: $stackName"
  stackId=$(aws cloudformation describe-stacks | jq -r ".Stacks|.[]|{StackName, StackId}|select(.StackName==\"$stackName\")|.StackId")
  echo "get the website stack id: $stackId"
  if [ -z $stackId ]; then
    echo "error: can not find the stack by the stack name($stackName)"
    echo "action exit"
    exit
  fi
  cloudfrontDomain=$(aws cloudformation list-exports --max-items 200 | jq -r ".Exports|.[]|(select(.ExportingStackId==\"$stackId\"))|select(.Name==\"$stackName-distributionDomainName\")|.Value")
  echo "get the cloudfront distribution domain: $cloudfrontDomain"
  echo "action: deploy"
  AWS_ACCESS_KEY_ID=$IT_AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY=$IT_AWS_SECRET_ACCESS_KEY
  cdk deploy dnsStack --parameters distributionDomainName=$cloudfrontDomain --force
else
  echo "action: destroy"
  AWS_ACCESS_KEY_ID=$IT_AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY=$IT_AWS_SECRET_ACCESS_KEY
  cdk destroy dnsStack --force
fi
echo "action done"
