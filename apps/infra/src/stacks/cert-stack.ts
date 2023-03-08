import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import { CertStackProps } from '../@types/stack-props';

export class CertStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: CertStackProps) {
    super(scope, id, props);

    // 证书通过如下环境变量给与
    // - CERT_PRIVATE_[ENV_NAME]_[DOMAIN]
    // - CERT_BODY_[ENV_NAME]_[DOMAIN]
    // - CERT_CSR_[ENV_NAME]_[DOMAIN]
    const domain = props.sld.split('.')[0];
    const domainEnvName = domain.toUpperCase();
    const envName = props.codeEnvName.toUpperCase();
    new iam.CfnServerCertificate(this, `${domain}Cert`, {
      serverCertificateName: `${domain}2023`,
      privateKey: process.env[`CERT_PRIVATE_${envName}_${domainEnvName}`],
      certificateBody: process.env[`CERT_BODY_${envName}_${domainEnvName}`],
      certificateChain: process.env[`CERT_CSR_${envName}_${domainEnvName}`],
      path: '/cloudfront/',
    });
  }
}
