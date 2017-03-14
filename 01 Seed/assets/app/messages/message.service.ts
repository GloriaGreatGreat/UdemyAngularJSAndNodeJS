import {Message} from "./message.model";
import {Http, Response, Headers} from "@angular/http";
import {Injectable, EventEmitter} from "@angular/core";
import 'rxjs/Rx';
import {Observable} from "rxjs";

@Injectable()
export class MessageService {
    private messages: Message[] = [];
    messageIsEdit = new EventEmitter<Message>();

    constructor(private http: Http){}

    addMessage(message: Message) {
        // this.messages.push(message);
        const body = JSON.stringify(message);
        const headers = new Headers({'Content-Type': 'application/json'});
        const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
        return this.http.post('http://localhost:8888/message' + token, body, {headers: headers}) //connect to the backend
            .map((response: Response) => {
                const result = response.json();
                const message = new Message(result.obj.content, result.obj.user.firstName, result.obj._id, result.obj.user._id);
                this.messages.push(message);
                return message;
            })
            .catch((error: Response) => Observable.throw(error.json()));
    }

    getMessages(){
        return this.http.get('http://localhost:8888/message') //connect to the backend
            .map((response: Response) => { //transformedMessages is returned to map to be worked with
                const messages = response.json().obj; // here the obj need to have the same name defined at backend, message.js
                let transformedMessages: Message[] = [];
                for (let message of messages) {
                    transformedMessages.push(new Message(message.content, message.user.firstName, message._id,  message.user._id));
                }
                this.messages = transformedMessages;
                return transformedMessages;
            })
            .catch((error: Response) => Observable.throw(error.json()));
    }

    editMessages(message: Message){
        this.messageIsEdit.emit(message);
    }

    updateMessage(message: Message){
        const body = JSON.stringify(message);
        const headers = new Headers({'Content-Type': 'application/json'});
        const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
        return this.http.patch('http://localhost:8888/message/' + message.messageId + token, body, {headers: headers}) //connect to the backend
            .map((response: Response) => response.json())
            .catch((error: Response) => Observable.throw(error.json()));
    }

    deleteMessage(message: Message){
        const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
        this.messages.splice(this.messages.indexOf(message), 1);
        return this.http.delete('http://localhost:8888/message/' + message.messageId + token) //connect to the backend
            .map((response: Response) => response.json())
            .catch((error: Response) => Observable.throw(error.json()));
    }
}