import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../../../backend/src/auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDEzCCAfugAwIBAgIJdgtfcSDfHxk6MA0GCSqGSIb3DQEBCwUAMCcxJTAjBgNV
BAMTHGFuZHJld2phbWVzd29ybWFsZC5hdXRoMC5jb20wHhcNMjAwNTIwMDUzOTAy
WhcNMzQwMTI3MDUzOTAyWjAnMSUwIwYDVQQDExxhbmRyZXdqYW1lc3dvcm1hbGQu
YXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4BvDCvJB
uFxQ7I0odrxSMsa6UcXWdT9wSlmycOxf+lg/DMaiR0iURpPq6UQ3utxPk1PShGSP
hBn5F0zi0ybWrBWWm/Gil1AhJE0HCrZ5SKCgDzVt1FcOR2lffiN1EtXUX9g15Q5Q
AVBt5Pjbyxr6sc/2OGcz1vzg6gc4so+Y1ZttXYasfCcFfO4xkGh2DAhrd1HszMvD
8FiRQWvI7mlMrDqLk5ePK16EVrpyy73F/KAuWwanFOBr4/C3cL+ehBQFXF9EX3fp
/hEUDvpLYO3sifDk3Om1kuPb4EVt9GD5CNpjLYXiER5Xj2OZ8IERXmfAqXppWPTW
iMx/DJUS0J54wwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRv
k/M0m/hTwUIOTxai9PT3i49e8DAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQEL
BQADggEBAHdYMqRODSI/kYjR5NDzjwzEwADMn+9VpFfOdZvSseoDylwaOt+IVSXc
MbytviOr1qyYT3lgmPuwUoCGT26fm3sI1NM0+h2NOaJHC9VgTk0SNjUyf3t/hN4b
qkNKujYAm698IN7Y/YSCNd8SOucFV7p5Dokms9TkdUwbVnEglWB6BBv0tmVUNJXB
SRSxo/cp+9+JPDk0L9h2V+Uofa6JSeFjZNI0VPzg82ViyQ5/+RRPAleVgAwIgWV1
/1wEwq50ZXqFKoD0dxZnroGUQ4U6C6pFYzLj+iPuO2brBpG+ciRRC1mK1ZZHlXcu
g2QVtLp0cy2tUYc1bxG/A1dwql47sHc=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await Verify(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

export function Verify(authHeader: string): JwtPayload {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

