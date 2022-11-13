import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../AppBusinessLogic/todos'
// import { getUserId } from '../utils' #disabled for causing build errors

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    

    const uploadUrl = await createAttachmentPresignedUrl(todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
 .use(httpErrorHandler())
 .use(
     cors({
       credentials: true
  })
)