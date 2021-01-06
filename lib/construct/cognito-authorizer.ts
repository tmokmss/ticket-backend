import { AuthorizationType, Authorizer, CfnAuthorizer, IAuthorizer, IRestApi } from '@aws-cdk/aws-apigateway';
import { Construct, Lazy, ResourceProps, Stack } from '@aws-cdk/core';

export interface CognitoAuthorizerProps extends ResourceProps {
  /**
   * (Optional) The name of this Authorizer
   *
   * @default The node's logical ID
   */
  authorizerName?: string;
  /**
   * The Identity Source (e.g. header, query string, etc.)
   *
   * @default `method.request.header.Authorization`
   */
  identitySource?: string;
  /**
   * The Cognito User Pool ARN
   */
  userPoolArn: string;
}

/**
 * Amazon Cognito IDP Authorizer for API Gateway REST APIs
 * @extends Authorizer
 * @implements IAuthorizer
 */
export class CognitoAuthorizer extends Authorizer implements IAuthorizer {
  /**
   * The Authorizer ID
   */
  public readonly authorizerId: string;
  /**
   * The API Gateway REST API ID this Authorizer is attached to
   */
  protected restApiId?: string;
  /**
   * The ARN of this Authorizer
   */
  public readonly authorizerArn: string;
  constructor(scope: Construct, id: string, props: CognitoAuthorizerProps) {
    super(scope, id, props);

    const restApiId = this.lazyRestApiId();
    const resource = new CfnAuthorizer(this, 'Resource', {
      name: props.authorizerName ?? this.node.uniqueId,
      restApiId,
      type: 'COGNITO_USER_POOLS',
      identitySource: props.identitySource || 'method.request.header.Authorization',
      providerArns: [props.userPoolArn],
    });

    this.authorizerId = resource.ref;
    this.authorizerArn = Stack.of(this).formatArn({
      service: 'cognito-idp',
      resource: restApiId,
      resourceName: `authorizers/${this.authorizerId}`,
    });
    // We have to do this because CDK's API Gateway L2 requires that IAuthorizers be "custom"
    // even though we have to make this COGNITO
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.authorizationType = AuthorizationType.COGNITO;
  }

  /**
   * Attaches this authorizer to a specific REST API.
   * @internal
   */
  public _attachToApi(restApi: IRestApi): void {
    if (this.restApiId && this.restApiId !== restApi.restApiId) {
      throw new Error('Cannot attach authorizer to two different rest APIs');
    }

    this.restApiId = restApi.restApiId;
  }
  /**
   * Returns a token that resolves to the Rest Api Id at the time of synthesis.
   * Throws an error, during token resolution, if no RestApi is attached to this authorizer.
   */
  protected lazyRestApiId(): string {
    return Lazy.string({
      produce: () => {
        if (!this.restApiId) {
          throw new Error(`Authorizer (${this.node.path}) must be attached to a RestApi`);
        }
        return this.restApiId;
      },
    });
  }
}
