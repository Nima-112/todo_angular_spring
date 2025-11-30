package ma.ensaf.todo.spec;

import org.springframework.data.jpa.domain.Specification;
import ma.ensaf.todo.entity.Todo;

public class TodoSpecifications {

    public static Specification<Todo> byUsername(String username) {
        return (root, query, cb) -> cb.equal(root.get("user").get("username"), username);
    }

    public static Specification<Todo> completed(Boolean completed) {
        if (completed == null) return null;
        return (root, query, cb) -> cb.equal(root.get("completed"), completed);
    }

    public static Specification<Todo> titleContains(String q) {
        if (q == null || q.isBlank()) return null;
        return (root, query, cb) -> cb.like(cb.lower(root.get("title")), "%" + q.toLowerCase() + "%");
    }
}
