import * as cdk from 'aws-cdk-lib';

export type EnvName = 'sandbox' | 'dev' | 'staging' | 'production';

export interface CertStackProps extends cdk.StackProps {
  stackName: string;
  codeEnvName: string;
  sld: string;
}

export interface WebsiteStackProps extends cdk.StackProps {
  stackName: string;

  iamCertificateId: string;
  codeEnvName: string;
  sld: string;
}

export interface DNSStackProps extends cdk.StackProps {
  stackName: string;

  recordName: string;
  zoneName: string;
  hostedZoneId: string;
}
