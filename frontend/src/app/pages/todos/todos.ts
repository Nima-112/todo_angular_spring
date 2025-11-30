import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todos-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatCardModule, MatSnackBarModule, MatSelectModule, MatChipsModule, MatButtonToggleModule, MatDividerModule, DragDropModule],
  templateUrl: './todos.html',
  styleUrl: './todos.scss'
})
export class TodosPage {
  todos = signal<Todo[]>([]);
  isLoading = signal(true);
  isDark = signal(window.matchMedia('(prefers-color-scheme: dark)').matches);
  filter = signal<'all' | 'active' | 'completed'>('all');
  search = signal('');
  sortBy = signal<'createdAt' | 'priority' | 'orderIndex'>('orderIndex');
  direction = signal<'asc' | 'desc'>('asc');
  editingId = signal<number | null>(null);
  editingTitle = signal('');
  countTotal = computed(() => this.todos().length);
  countActive = computed(() => this.todos().filter(t => !t.completed).length);
  countCompleted = computed(() => this.todos().filter(t => t.completed).length);

  constructor(private todoService: TodoService, private snack: MatSnackBar) {
    this.loadTodos();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', e => this.isDark.set(e.matches));
    effect(() => document.documentElement.dataset['theme'] = this.isDark() ? 'dark' : 'light');
  }

  params() {
    const completed = this.filter() === 'all' ? undefined : this.filter() === 'completed';
    return {
      completed,
      titleContains: this.search(),
      sortBy: this.sortBy(),
      direction: this.direction()
    };
  }

  loadTodos() {
    this.isLoading.set(true);
    this.todoService.getTodos(this.params()).subscribe({
      next: (data) => { this.todos.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  addTodo(title: string) {
    if (!title.trim()) return;
    this.todoService.addTodo({ title, completed: false }).subscribe(todo => {
      this.todos.update(t => [...t, todo]);
      this.snack.open('Tâche ajoutée', 'OK', { duration: 2000 });
    });
  }

  toggle(todo: Todo) {
    this.todoService.updateTodo({ ...todo, completed: !todo.completed }).subscribe(() => {
      this.todos.update(t => t.map(x => x.id === todo.id ? { ...x, completed: !x.completed } : x));
    });
  }

  delete(id?: number) {
    if (!id) return;
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos.update(t => t.filter(x => x.id !== id));
      this.snack.open('Tâche supprimée', 'OK', { duration: 2000 });
    });
  }

  startEdit(todo: Todo) {
    this.editingId.set(todo.id ?? null);
    this.editingTitle.set(todo.title);
  }

  commitEdit(todo: Todo) {
    const title = this.editingTitle().trim();
    if (!title) { this.editingId.set(null); return; }
    this.todoService.updateTodo({ ...todo, title }).subscribe(updated => {
      this.todos.update(t => t.map(x => x.id === todo.id ? { ...x, title } : x));
      this.editingId.set(null);
    });
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  completeAll() {
    this.todoService.completeAll().subscribe(() => {
      this.todos.update(t => t.map(x => ({ ...x, completed: true })));
      this.snack.open('Toutes les tâches complétées', 'OK', { duration: 2000 });
    });
  }

  deleteCompleted() {
    this.todoService.deleteCompleted().subscribe({
      next: () => {
        this.todos.update(t => t.filter(x => !x.completed));
        this.loadTodos();
        this.snack.open('Tâches complétées supprimées', 'OK', { duration: 2000 });
      },
      error: () => {
        this.snack.open('Échec suppression des tâches complétées', 'OK', { duration: 2500 });
      }
    });
  }

  drop(event: CdkDragDrop<Todo[]>) {
    const arr = [...this.todos()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.todos.set(arr);
    const ids = arr.map(x => x.id!).filter(Boolean) as number[];
    this.todoService.reorder(ids).subscribe();
  }

  setFilter(f: 'all' | 'active' | 'completed') { this.filter.set(f); this.loadTodos(); }
  setDirection(d: 'asc' | 'desc') { this.direction.set(d); this.loadTodos(); }
  setSortBy(s: 'createdAt' | 'priority' | 'orderIndex') { this.sortBy.set(s); this.loadTodos(); }
}
