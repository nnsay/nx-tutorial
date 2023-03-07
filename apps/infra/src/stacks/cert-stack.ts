import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import { CertStackProps } from '../@types/stack-props';

export class CertStack extends cdk.Stack {
  // 泛域名证书
  public readonly serverCertificateName: string;

  constructor(scope: Construct, id: string, props?: CertStackProps) {
    super(scope, id, props);

    const domainCert = new iam.CfnServerCertificate(this, 'domainCert', {
      serverCertificateName: 'vd20231214',
      privateKey: fs.readFileSync(
        path.join(
          __dirname,
          '..',
          'assets/domainCerts/8994950__visualdynamics.cn.key'
        ),
        { encoding: 'utf-8' }
      ),
      certificateBody: fs.readFileSync(
        path.join(
          __dirname,
          '..',
          'assets/domainCerts/8994950__visualdynamics.cn.pem'
        ),
        { encoding: 'utf-8' }
      ),
      certificateChain: fs.readFileSync(
        path.join(
          __dirname,
          '..',
          'assets/domainCerts/8994950__visualdynamics.cn.chain.pem'
        ),
        { encoding: 'utf-8' }
      ),
      path: '/cloudfront/',
    });

    this.serverCertificateName = domainCert.attrArn;

    // WARN: ServerCertificate仅仅支持Arn属性,所以这里输出名称而不是证书ID
    // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-servercertificate.html
    new cdk.CfnOutput(this, 'serverCertificateName', {
      value: domainCert.serverCertificateName,
      exportName: 'serverCertificateName',
    });
  }
}
