import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoDataLayer {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly imageBucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private readonly todoIdIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {}

    async getAllTodos(todoItem): Promise<TodoItem[]> {
        const param = {
            TableName: this.todosTable,
            IndexName: this.todoIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': todoItem.userId
            }
        }

        const result = await this.docClient.query(param).promise();
        const allItems = result.Items;

        return allItems as TodoItem[];
    }

    async createDataTodo(todoItem): Promise<TodoItem> {
        const param = {
            TableName: this.todosTable,
            Item: todoItem
        }

        await this.docClient.put(param).promise();

        return todoItem;
    }

    async deleteDataTodo (todoItem): Promise<String> {
        const param = {
            TableName: this.todosTable,
            Key: {
                "userId": todoItem.userId,
                "todoId": todoItem.todoId
            }
        };

        await this.docClient.delete(param).promise();

        return "Successful Todo deletion"
    }

    async updateDataTodo (todoItem): Promise<String>{
        const param = {
            TableName: this.todosTable,
            Key: {
                "userId": todoItem.userId,
                "todoId": todoItem.todoId
            },
            UpdateExpression:"set #tn = :n, dueDate=:dd, done=:d",
            ExpressionAttributeNames: {'#tn': 'name'},
            ExpressionAttributeValues: {
                ":n": todoItem.name,
                ":dd": todoItem.dueDate,
                ":d": todoItem.done
            }
        };

        await this.docClient.update(param).promise();

        return "Updated Todo"
    }

    async generateUploadUrl(todoItem): Promise<String> {

        const signedUrl = await this.s3.getSignedUrl('putObject', {
          Bucket: this.imageBucketName,
          Key: todoItem.todoId,
          Expires: parseInt(this.signedUrlExpiration)
        })
    
        const param = {
          TableName: this.todosTable,
          Key: {
            "userId": todoItem.userId,
            "todoId": todoItem.todoId
          },
          UpdateExpression: "set attachmentUrl = :a",
          ExpressionAttributeValues: {
            ":a": `https://${this.imageBucketName}.s3.amazonaws.com/${todoItem.todoId}`
          }
        }
    
        await this.docClient.update(param).promise()
    
        return signedUrl
      }

}