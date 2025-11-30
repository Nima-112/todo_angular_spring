package ma.ensaf.todo.service;

import java.util.List;
import java.util.Comparator;

import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ma.ensaf.todo.entity.Todo;
import ma.ensaf.todo.entity.User;
import ma.ensaf.todo.repository.TodoRepository;
import ma.ensaf.todo.repository.UserRepository;
import ma.ensaf.todo.spec.TodoSpecifications;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository repository;
    private final UserRepository userRepository;

    private String currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    private User currentUser() {
        String username = currentUsername();
        if (username == null) throw new org.springframework.security.access.AccessDeniedException("Unauthenticated");
        return userRepository.findByUsername(username).orElseThrow();
    }

    public List<Todo> search(Boolean completed, String titleContains, String sortBy, String direction) {
        String username = currentUsername();
        var spec = TodoSpecifications.byUsername(username);
        var c = TodoSpecifications.completed(completed);
        var t = TodoSpecifications.titleContains(titleContains);
        if (c != null) spec = spec.and(c);
        if (t != null) spec = spec.and(t);
        Sort sort = Sort.by("orderIndex");
        if (sortBy != null && !sortBy.isBlank()) {
            sort = Sort.by(sortBy);
        }
        if (direction != null && direction.equalsIgnoreCase("desc")) {
            sort = sort.descending();
        }
        return repository.findAll(spec, sort);
    }

    public Todo create(Todo todo) {
        var user = currentUser();
        todo.setUser(user);
        var todos = repository.findByUserUsername(user.getUsername());
        int nextOrder = todos.stream().map(Todo::getOrderIndex).max(Comparator.naturalOrder()).orElse(-1) + 1;
        todo.setOrderIndex(nextOrder);
        return repository.save(todo);
    }

    public Todo update(Long id, Todo todo) {
        var user = currentUser();
        var existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Todo not found: " + id));
        if (existing.getUser() == null || !existing.getUser().getUsername().equals(user.getUsername())) {
            throw new RuntimeException("Forbidden");
        }
        existing.setTitle(todo.getTitle());
        existing.setCompleted(todo.isCompleted());
        existing.setPriority(todo.getPriority());
        return repository.save(existing);
    }

    public void delete(Long id) {
        var user = currentUser();
        var existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Todo not found: " + id));
        if (existing.getUser() == null || !existing.getUser().getUsername().equals(user.getUsername())) {
            throw new RuntimeException("Forbidden");
        }
        repository.delete(existing);
    }

    public void completeAll() {
        String username = currentUsername();
        var todos = repository.findByUserUsername(username);
        todos.forEach(t -> t.setCompleted(true));
        repository.saveAll(todos);
    }

    public void deleteCompleted() {
        String username = currentUsername();
        if (username == null) throw new org.springframework.security.access.AccessDeniedException("Unauthenticated");
        repository.deleteByUserUsernameAndCompletedTrue(username);
    }

    public void reorder(List<Long> ids) {
        String username = currentUsername();
        var todos = repository.findByUserUsername(username);
        var map = todos.stream().collect(java.util.stream.Collectors.toMap(Todo::getId, t -> t));
        for (int i = 0; i < ids.size(); i++) {
            var t = map.get(ids.get(i));
            if (t != null) t.setOrderIndex(i);
        }
        repository.saveAll(todos);
    }

    public Todo findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found: " + id));
    }
}
