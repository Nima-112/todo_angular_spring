import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/todos';

  // constructor(private http: HttpClient) { }

  getTodos(params?: { completed?: boolean; titleContains?: string; sortBy?: string; direction?: 'asc' | 'desc' }): Observable<Todo[]> {
    const p: any = {};
    if (params?.completed !== undefined) p.completed = params.completed;
    if (params?.titleContains) p.titleContains = params.titleContains;
    if (params?.sortBy) p.sortBy = params.sortBy;
    if (params?.direction) p.direction = params.direction;
    return this.http.get<Todo[]>(this.apiUrl, { params: p });
  }

  addTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo);
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${todo.id}`, todo);
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  completeAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/complete-all`, {});
  }

  deleteCompleted(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/completed`);
  }

  reorder(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, { ids });
  }

}
