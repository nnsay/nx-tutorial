import * as cdk from 'aws-cdk-lib';
import {
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_cloudfront as cloudfront,
  aws_route53 as route53,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteStackProps } from '../@types/stack-props';
import * as path from 'path';

export class EnvStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    // globel varibles
    const iamCertificateId = props.iamCertificateId;

    // bucket
    const corsRule: s3.CorsRule = {
      allowedMethods: [
        s3.HttpMethods.DELETE,
        s3.HttpMethods.GET,
        s3.HttpMethods.HEAD,
        s3.HttpMethods.POST,
        s3.HttpMethods.PUT,
      ],
      allowedOrigins: ['*'],
    };
    const websiteBucket = new s3.Bucket(this, `${this.stackName}WebSite`, {
      cors: [corsRule],
      publicReadAccess: true,
      bucketName: `${this.stackName}-wb`,
      websiteIndexDocument: 'index.html',
    });

    // deployment
    new s3deploy.BucketDeployment(this, `${this.stackName}Deployment`, {
      sources: [
        s3deploy.Source.asset(
          path.resolve(path.join(__dirname, '../../../../dist/tmp'))
        ),
      ],
      destinationBucket: websiteBucket,
    });

    // cloudfront
    const websiteDomain = `${this.stackName}.visualdynamics.cn`;
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `${this.stackName}WebSiteCloudFront`,
      {
        originConfigs: [
          {
            customOriginSource: {
              domainName: websiteBucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors: [
              {
                pathPattern: '',
                compress: true,
                isDefaultBehavior: true,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
                allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
              },
            ],
          },
        ],
        defaultRootObject: '',
        viewerCertificate: cloudfront.ViewerCertificate.fromIamCertificate(
          iamCertificateId,
          {
            aliases: [websiteDomain],
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          }
        ),
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        enableIpV6: false,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
      }
    );
    new cdk.CfnOutput(this, 'distributionId', {
      value: distribution.distributionId,
      exportName: 'distributionId',
    });

    // route53
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      props.dnsStack,
      'rootHostedzone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.zoneName,
      }
    );
    new route53.CnameRecord(props.dnsStack, 'websiteCname', {
      recordName: this.stackName,
      domainName: distribution.distributionDomainName,
      zone: hostedZone,
    });
  }
}
