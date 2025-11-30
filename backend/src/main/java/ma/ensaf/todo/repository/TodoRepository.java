package ma.ensaf.todo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import ma.ensaf.todo.entity.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long>, JpaSpecificationExecutor<Todo> {
    List<Todo> findByUserUsername(String username);
    void deleteByUserUsernameAndCompletedTrue(String username);
}
