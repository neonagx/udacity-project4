import { TodoDataLayer } from '../dataLayer/todosDataLayer'
// import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import * as utils from '../lambda/utils';

// TODO: Implement businessLogic
const logger = createLogger('todosLog');
const todoDataLayer = new TodoDataLayer();
export const getTodosForUser = async (event): Promise<TodoItem[]> => {

    logger.info('getTodos', {event});

    const toDoItem: TodoItem = {
        userId: utils.getUserId(event)
    };

    return todoDataLayer.getAllTodos(toDoItem);
}

export const createTodo = async (event):Promise<TodoItem>  => {
    logger.info('createTodo', {event});

    const newTodo: CreateTodoRequest = JSON.parse(event.body);

    const todoItem: TodoItem = {
        userId: utils.getUserId(event),
        todoId: uuid.v4(),
        createdAt: new Date().toDateString(),
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        attachmentUrl: '',
    };

    return todoDataLayer.createDataTodo(todoItem);

}

export const deleteTodo = async(event): Promise<String> => {
    logger.info('deleteTodo', {event});

    const todoItem: TodoItem = {
        userId: utils.getUserId(event),
        todoId: event.pathParameters.todoId
    };

    return todoDataLayer.deleteDataTodo(todoItem);
}

export const updateTodo = async (event):Promise<String> => {
    logger.info('updateTodo', {event});

    const todoUpdate: UpdateTodoRequest = JSON.parse(event.body);

    const todoItem: TodoItem = {
        userId: utils.getUserId(event),
        todoId: event.pathParameters.todoId,
        name: todoUpdate.name,
        dueDate: todoUpdate.dueDate,
        done: todoUpdate.done
    };

    return todoDataLayer.updateDataTodo(todoItem);
}

export const generateUploadUrl = (event): Promise<String> => {
    logger.info('generateUploadUrl', {event});

    const todoItem: TodoItem = {
        userId: utils.getUserId(event),
        todoId: event.pathParameters.todoId
    };

    return todoDataLayer.generateUploadUrl(todoItem);
}