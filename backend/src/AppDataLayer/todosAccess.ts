import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: code block to Implement the AppDataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {}

    async createTodo(todoItem: TodoItem){
        logger.info('creating new todo item in todosAccess', todoItem)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
    }

    async deleteTodo(todoId: string, userId: string){
        logger.info('deleting a todo item '+todoId)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
    }

    async getTodosForUser(userId: string){
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.createdAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        logger.info(`Todo Items for user:${userId} retrieved`, result)

        return result
    }

    async updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest){
        logger.info('updating a todo item', updatedTodo)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
              ":dueDate": updatedTodo.dueDate,
              ":done": updatedTodo.done
            }
        }).promise()

        logger.info('Todo item has been updated', updatedTodo)

        return updatedTodo
    }
}